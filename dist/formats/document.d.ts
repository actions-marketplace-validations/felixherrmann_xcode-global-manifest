import { type Declaration, type Requirements, type Rule } from '../model';
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
export declare function textDocument(source: string, file: string, occurrences: Occurrence[], render: (rule: Rule, occurrence: Occurrence) => string): DependencyDocument;
