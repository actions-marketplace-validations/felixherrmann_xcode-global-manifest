export type Token = {
    type: 'string' | 'symbol' | 'word';
    value: string;
    start: number;
    end: number;
};
export declare function fail(file: string, source: string, offset: number, message: string): never;
export declare function lineAt(source: string, offset: number): number;
export declare function tokens(source: string, file: string, from?: number, to?: number): Token[];
export declare function closing(ts: Token[], at: number, file: string, source: string): number;
export declare function pieces(ts: Token[], start: number, end: number, separator: string, file: string, source: string): Token[][];
export declare function literal(ts: Token[], file: string, source: string): string;
export declare function quote(value: string): string;
