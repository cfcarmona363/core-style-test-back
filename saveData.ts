import { Client } from "@notionhq/client";
import type { FormData } from "./types";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

/** Allowed Gender options in Notion (select). */
const GENDER_OPTIONS = [
  "mujer",
  "hombre",
  "no-binario",
  "otro",
  "prefiero-no-decir",
] as const;

/** Fit options in Notion (select). Form "ajuste" is mapped to these. */
const FIT_MAP: Record<string, string> = {
  suelta: "Más bien suelta",
  "mas bien suelta": "Más bien suelta",
  ajustada: "Más bien ajustada",
  "mas bien ajustada": "Más bien ajustada",
};

function toFitSelect(ajuste: string): string {
  const key = ajuste.trim().toLowerCase();
  return FIT_MAP[key] ?? "Más bien suelta";
}

/**
 * Maps a string value to Notion rich_text property.
 */
function richText(value: string): {
  rich_text: [{ text: { content: string } }];
} {
  return {
    rich_text: [{ text: { content: value || "—" } }],
  };
}

/**
 * Saves form data as a new row in the configured Notion database.
 * Requires NOTION_TOKEN and NOTION_DB_ID in .env.
 *
 * Property names must match the Notion database:
 * Name, Last Name, Email, Gender, Location, Fit, Personality, Characteristics,
 * Time, Communications Accepted, Data Processing Accepted
 */
export async function saveRow(data: FormData): Promise<void> {
  const databaseId = process.env.NOTION_DB_ID;
  if (!databaseId) {
    throw new Error("Missing NOTION_DB_ID in environment.");
  }
  if (!process.env.NOTION_TOKEN) {
    throw new Error("Missing NOTION_TOKEN in environment.");
  }

  const generoNormalized = data.genero.trim().toLowerCase();
  const genderSelect =
    generoNormalized &&
    GENDER_OPTIONS.includes(generoNormalized as (typeof GENDER_OPTIONS)[number])
      ? generoNormalized
      : "prefiero-no-decir";

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: data.nombre || "—" } }],
      },
      "Last Name": richText(data.apellido),
      Email: {
        email: data.email.trim() ? data.email.trim() : null,
      },
      Gender: {
        select: { name: genderSelect },
      },
      Location: richText(data.ubicacion),
      Fit: {
        select: { name: toFitSelect(data.ajuste) },
      },
      Personality: {
        multi_select: data.personalidad
          .filter(Boolean)
          .map((name) => ({ name: String(name).trim() })),
      },
      Characteristics: richText(data.caracteristicas),
      Time: richText(data.tiempo),
      "Communications Accepted": { checkbox: data.comunicaciones },
      "Data Processing Accepted": { checkbox: data.procesamiento },
    },
  });
}
