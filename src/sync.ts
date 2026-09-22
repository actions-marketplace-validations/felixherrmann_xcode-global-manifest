import type { Files, Requirements } from './model';
import { generate } from './formats/swift';
import { readSnapshot, type Snapshot, type SourceFile } from './snapshot';
import { reconcile, sameDependencies } from './reconcile';

export type SyncInput = {
  base: Files;
  head: Files;
  sources: SourceFile[];
  globalPath: string;
};

/** Read dependencies, reconcile both directions, then render only changed files. */
export function synchronize({ base, head, sources, globalPath }: SyncInput): Files {
  const before = readSnapshot(base, sources, globalPath, true);
  const current = readSnapshot(head, sources, globalPath);
  const plan = reconcile(before, current, globalPath);

  const updates = updateSourceRequirements(current, head, plan.sourceUpdates);
  if (!current.global || !sameDependencies(current.global, plan.dependencies)) {
    updates[globalPath] = generate(plan.dependencies);
  }
  return updates;
}

function updateSourceRequirements(snapshot: Snapshot, files: Files, requirements: Requirements): Files {
  const updates: Files = {};
  if (!requirements.size) return updates;

  for (const document of snapshot.documents) {
    const content = document.update(requirements);
    if (content !== files[document.file]) updates[document.file] = content;
  }
  return updates;
}
