import type { FormData } from "./types";
/**
 * Saves form data as a new row in the configured Notion database.
 * Requires NOTION_TOKEN and NOTION_DB_ID in .env.
 *
 * Property names must match the Notion database:
 * Name, Last Name, Email, Gender, Location, Fit, Personality, Characteristics,
 * Time, Communications Accepted, Data Processing Accepted
 */
export declare function saveRow(data: FormData): Promise<void>;
//# sourceMappingURL=saveData.d.ts.map