import { sameRequirement, type Declaration, type Dependencies, type DependencyState, type Files } from './model';
import type { DependencyDocument, DependencyFormat } from './formats/document';
import { swiftManifest } from './formats/swift';

export type SourceFile = { file: string; format: DependencyFormat };

export type Snapshot = DependencyState & {
  documents: DependencyDocument[];
};

export function readSnapshot(files: Files, sources: SourceFile[], globalPath: string, allowMissing = false): Snapshot {
  const documents: DependencyDocument[] = [];
  for (const { file, format } of sources) {
    if (!(file in files)) {
      if (allowMissing) continue;
      throw new Error(`${file}: source file is missing`);
    }
    documents.push(format.read(files[file], file));
  }

  const global = globalPath in files ? swiftManifest.read(files[globalPath], globalPath) : null;
  return {
    documents,
    sources: indexDependencies(documents.flatMap(document => document.dependencies)),
    global: global ? indexDependencies(global.dependencies, globalPath) : null,
  };
}

function indexDependencies(declarations: readonly Declaration[], globalPath?: string): Dependencies {
  const byURL = new Map<string, Declaration>();
  for (const declaration of declarations) {
    const previous = byURL.get(declaration.url);
    if (previous) {
      if (globalPath) throw new Error(`${globalPath}: duplicate package ${declaration.url}`);
      if (!sameRequirement(previous.rule, declaration.rule)) {
        throw new Error(`conflicting requirements for ${declaration.url}: ${previous.file}:${previous.line} and ${declaration.file}:${declaration.line}`);
      }
    } else {
      byURL.set(declaration.url, declaration);
    }
  }
  return byURL;
}
