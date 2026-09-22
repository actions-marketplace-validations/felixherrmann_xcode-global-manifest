import { sameRequirement, type Declaration, type Dependencies, type DependencyState, type Requirements, type Rule } from './model';

export type SyncPlan = {
  dependencies: Dependencies;
  sourceUpdates: Requirements;
};

/** Merge requirement changes per package; source files own package membership. */
export function reconcile(base: DependencyState, head: DependencyState, globalPath: string): SyncPlan {
  validateBaseline(base, head, globalPath);

  const dependencies = new Map<string, Declaration>();
  const sourceUpdates = new Map<string, Rule>();
  const urls = new Set([...base.sources.keys(), ...head.sources.keys(), ...(head.global?.keys() ?? [])]);

  for (const url of urls) {
    const sourceBefore = base.sources.get(url);
    const sourceNow = head.sources.get(url);
    const globalBefore = base.global?.get(url);
    const globalNow = head.global?.get(url);
    const sourceChanged = !sameRequirement(sourceBefore?.rule, sourceNow?.rule);
    const globalChanged = base.global !== null && !sameRequirement(globalBefore?.rule, globalNow?.rule);

    const membershipChanged = globalChanged && (!globalBefore || !globalNow);
    if (membershipChanged && (!sourceChanged || !sameRequirement(sourceNow?.rule, globalNow?.rule))) {
      throw new Error(`${globalPath}: add or remove ${url} in source manifests`);
    }
    if (globalChanged && sourceChanged && !sameRequirement(sourceNow?.rule, globalNow?.rule)) {
      const location = sourceNow ? `${sourceNow.file}:${sourceNow.line}` : 'source removed';
      throw new Error(`sync conflict for ${url}: ${location} and ${globalPath}:${globalNow!.line}`);
    }

    const dependency = globalChanged ? globalNow : sourceNow;
    if (dependency) dependencies.set(url, dependency);
    if (globalChanged && globalNow) sourceUpdates.set(url, globalNow.rule);
  }

  return { dependencies, sourceUpdates };
}

export function sameDependencies(a: Dependencies, b: Dependencies): boolean {
  return a.size === b.size && [...a].every(([url, dependency]) =>
    sameRequirement(dependency.rule, b.get(url)?.rule));
}

function validateBaseline(base: DependencyState, head: DependencyState, globalPath: string): void {
  if (base.global) assertInSync(base.sources, base.global, 'base commit');
  if (!base.global && head.global) assertInSync(head.sources, head.global, 'initial global manifest');
  if (base.global && !head.global) {
    throw new Error(`${globalPath}: global manifest was removed; remove packages in source files instead`);
  }
}

function assertInSync(sources: Dependencies, global: Dependencies, description: string): void {
  for (const url of new Set([...sources.keys(), ...global.keys()])) {
    if (!sameRequirement(sources.get(url)?.rule, global.get(url)?.rule)) {
      throw new Error(`${description} is out of sync for ${url}`);
    }
  }
}
