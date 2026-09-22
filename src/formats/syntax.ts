export type Token = { type: 'string' | 'symbol' | 'word'; value: string; start: number; end: number };

export function fail(file: string, source: string, offset: number, message: string): never {
  throw new Error(`${file}:${lineAt(source, offset)}: ${message}`);
}

export function lineAt(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

function skipBlockComment(source: string, file: string, start: number, limit: number): number {
  let depth = 1;
  let cursor = start + 2;
  while (depth > 0 && cursor < limit) {
    if (source.startsWith('/*', cursor)) {
      depth++;
      cursor += 2;
    } else if (source.startsWith('*/', cursor)) {
      depth--;
      cursor += 2;
    } else {
      cursor++;
    }
  }
  if (depth > 0) fail(file, source, start, 'unterminated comment');
  return cursor;
}

const stringEscapes: Record<string, string> = {
  '0': '\0', n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\',
};

function readString(source: string, file: string, start: number, limit: number): Token {
  let cursor = start + 1;
  let value = '';
  while (cursor < limit) {
    const character = source[cursor++];
    if (character === '"') {
      return { type: 'string', value, start, end: cursor };
    }
    if (character !== '\\') {
      value += character;
      continue;
    }

    const escape = source[cursor++];
    if (escape !== 'u' || source[cursor] !== '{') {
      if (!(escape in stringEscapes)) fail(file, source, start, 'unsupported string escape');
      value += stringEscapes[escape];
      continue;
    }

    const end = source.indexOf('}', cursor + 1);
    const hex = source.slice(cursor + 1, end);
    if (end < 0 || end >= limit || !/^[0-9a-fA-F]{1,8}$/.test(hex)) {
      fail(file, source, start, 'invalid string escape');
    }
    const point = parseInt(hex, 16);
    if (point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) {
      fail(file, source, start, 'invalid Unicode scalar');
    }
    value += String.fromCodePoint(point);
    cursor = end + 1;
  }
  fail(file, source, start, 'unterminated string');
}

export function tokens(source: string, file: string, from = 0, to = source.length): Token[] {
  const out: Token[] = [];
  for (let i = from; i < to;) {
    if (/\s/.test(source[i])) {
      i++;
      continue;
    }
    if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i + 2);
      i = end < 0 ? to : Math.min(end, to);
      continue;
    }
    if (source.startsWith('/*', i)) {
      i = skipBlockComment(source, file, i, to);
      continue;
    }
    const start = i;
    if (source[i] === '"') {
      const token = readString(source, file, start, to);
      out.push(token);
      i = token.end;
      continue;
    }
    const op = source.slice(i).match(/^(\.\.\.|\.\.<)/);
    if (op) {
      i += op[0].length;
      out.push({ type: 'symbol', value: op[0], start, end: i });
      continue;
    }
    if (/[()[\]{}.,:;=]/.test(source[i])) {
      i++;
      out.push({ type: 'symbol', value: source[start], start, end: i });
      continue;
    }
    while (i < to && !/\s|[()[\]{}.,:;="]/.test(source[i]) && !source.startsWith('//', i) && !source.startsWith('/*', i)) {
      i++;
    }
    if (i === start) fail(file, source, i, `unexpected character ${source[i]}`);
    out.push({ type: 'word', value: source.slice(start, i), start, end: i });
  }
  return out;
}

export function closing(ts: Token[], at: number, file: string, source: string): number {
  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
  const stack = [pairs[ts[at]?.value || '']];
  if (!stack[0]) fail(file, source, ts[at]?.start || 0, 'expected opening delimiter');
  for (let i = at + 1; i < ts.length; i++) {
    const v = ts[i].value;
    if (pairs[v]) stack.push(pairs[v]);
    else if (v === ')' || v === ']' || v === '}') {
      if (stack.pop() !== v) fail(file, source, ts[i].start, 'mismatched delimiter');
      if (!stack.length) return i;
    }
  }
  fail(file, source, ts[at].start, 'unclosed delimiter');
}

export function pieces(ts: Token[], start: number, end: number, separator: string, file: string, source: string): Token[][] {
  const result: Token[][] = [];
  let from = start;
  for (let i = start; i < end; i++) {
    if ('([{'.includes(ts[i].value) && ts[i].value.length === 1) {
      i = closing(ts, i, file, source);
      continue;
    }
    if (ts[i].value === separator) {
      if (i > from) result.push(ts.slice(from, i));
      from = i + 1;
    }
  }
  if (from < end) result.push(ts.slice(from, end));
  return result;
}

export function literal(ts: Token[], file: string, source: string): string {
  if (ts.length !== 1 || ts[0].type !== 'string') fail(file, source, ts[0]?.start || 0, 'expected a literal string');
  return ts[0].value;
}

export function quote(value: string): string {
  return '"' + value.replace(/[\\"\x00-\x1f]/g, c => ({ '\\': '\\\\', '"': '\\"', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\0': '\\0' }[c] || `\\u{${c.charCodeAt(0).toString(16)}}`)) + '"';
}
