import { sameRequirement, type Declaration, type Requirements, type Rule } from '../model';

/** A parsed source owns how requirements are updated, including any syntax details. */
export interface DependencyDocument {
  readonly file: string;
  readonly dependencies: readonly Declaration[];
  update(requirements: Requirements): string;
}

export interface DependencyFormat {
  read(source: string, file: string): DependencyDocument;
}

/** Text ranges stay inside the text formats; structured formats need not use them. */
export type Occurrence = Declaration & {
  start: number;
  end: number;
};

export function textDocument(
  source: string,
  file: string,
  occurrences: Occurrence[],
  render: (rule: Rule, occurrence: Occurrence) => string,
): DependencyDocument {
  return {
    file,
    dependencies: occurrences.map(({ url, rule, file, line }) => ({ url, rule, file, line })),
    update(requirements) {
      let result = source;
      // Work backwards so an edit cannot invalidate the remaining source ranges.
      for (const occurrence of [...occurrences].sort((a, b) => b.start - a.start)) {
        const rule = requirements.get(occurrence.url);
        if (!rule || sameRequirement(rule, occurrence.rule)) continue;
        result = result.slice(0, occurrence.start) + render(rule, occurrence) + result.slice(occurrence.end);
      }
      return result;
    },
  };
}
