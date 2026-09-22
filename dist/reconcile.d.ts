import { type Dependencies, type DependencyState, type Requirements } from './model';
export type SyncPlan = {
    dependencies: Dependencies;
    sourceUpdates: Requirements;
};
/** Merge requirement changes per package; source files own package membership. */
export declare function reconcile(base: DependencyState, head: DependencyState, globalPath: string): SyncPlan;
export declare function sameDependencies(a: Dependencies, b: Dependencies): boolean;
