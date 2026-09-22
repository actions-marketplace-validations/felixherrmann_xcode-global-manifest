import type { Files } from '../model';
import type { ActionConfig } from './config';
export type Repository = {
    readComparison(config: ActionConfig): {
        base: Files;
        head: Files;
    };
    commitAndPush(updates: Files, branch: string): string | undefined;
};
export declare function openRepository(root: string): Repository;
