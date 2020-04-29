export interface WordPart {
    word: string;
    remainder: string;
}
export interface Token {
    id: string;
    raw: string;
    prefix: string;
    type: string;
    value: string | number;
    remainder: string;
}
export interface DeepResults {
    trackers: Array<any>;
    context: Array<any>;
    people: Array<any>;
    tokens: Array<Token>;
}
/**
 * Deep Tokenization
 * Parse, and calculate base stats
 * @param nums Array
 */
declare function deep(str: string): DeepResults;
export declare const tokenizeDeep: typeof deep;
export declare const tokenize: (str?: string) => Token[];
export {};
