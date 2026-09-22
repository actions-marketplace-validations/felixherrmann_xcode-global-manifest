import { type DependencyState, type Files } from './model';
import type { DependencyDocument, DependencyFormat } from './formats/document';
export type SourceFile = {
    file: string;
    format: DependencyFormat;
};
export type Snapshot = DependencyState & {
    documents: DependencyDocument[];
};
export declare function readSnapshot(files: Files, sources: SourceFile[], globalPath: string, allowMissing?: boolean): Snapshot;
