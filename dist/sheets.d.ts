import type { SaveToSheetBody } from "./types";
/**
 * Maps the form payload to a single row (array of values).
 * personalidad array is joined with ", ".
 * Use this when implementing your save logic.
 */
export declare function payloadToRow(data: SaveToSheetBody): string[];
/**
 * Saves form data as a new row. Replace this implementation with your own (e.g. DB, Notion, etc.).
 */
export declare function appendRow(_data: SaveToSheetBody): Promise<{
    updates?: {
        updatedRows?: number | null;
    };
}>;
//# sourceMappingURL=sheets.d.ts.map