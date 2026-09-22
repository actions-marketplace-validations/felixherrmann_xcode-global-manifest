export type Rule =
  | { kind: 'exact' | 'major' | 'minor' | 'branch' | 'revision'; value: string }
  | { kind: 'range' | 'closed'; min: string; max: string };

export type Dependency = {
  url: string;
  rule: Rule;
};

export type Declaration = Dependency & {
  file: string;
  line: number;
};

export type Dependencies = ReadonlyMap<string, Declaration>;
export type Requirements = ReadonlyMap<string, Rule>;
export type Files = Record<string, string>;

export type DependencyState = {
  sources: Dependencies;
  global: Dependencies | null;
};

export function sameRequirement(a: Rule | undefined, b: Rule | undefined): boolean {
  if (!a || !b) return a === b;
  if (a.kind === 'range' || a.kind === 'closed') {
    return a.kind === b.kind && a.min === b.min && a.max === b.max;
  }
  return b.kind !== 'range' && b.kind !== 'closed' && a.kind === b.kind && a.value === b.value;
}
