import type { Rule } from '../model';
import { type DependencyFormat, type Occurrence } from './document';
export declare const pbxproj: DependencyFormat;
export declare function parseProject(source: string, file: string): Occurrence[];
export declare function renderProjectRule(rule: Rule, source: string, start: number, file: string): string;
