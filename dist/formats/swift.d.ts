import type { Rule } from '../model';
import { type DependencyFormat, type Occurrence } from './document';
export declare const swiftManifest: DependencyFormat;
export declare function parseSwift(source: string, file: string): Occurrence[];
export declare function renderSwiftRule(rule: Rule): string;
export declare function generate(byURL: ReadonlyMap<string, {
    rule: Rule;
}>): string;
