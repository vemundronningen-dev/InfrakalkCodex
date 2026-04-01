import { XMLParser } from "fast-xml-parser";

type AnyRecord = Record<string, any>;

export function parseNs3459(xmlText: string) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const parsed = parser.parse(xmlText) as AnyRecord;

  const root = parsed.ProsjektNS ?? parsed;
  const planNodes = toArray(root.Postnrplan?.Post ?? root.Postnrplan ?? []);
  const posterNodes = toArray(root.Poster?.Post ?? root.Poster ?? []);

  const chapters = planNodes.map((node: AnyRecord, index: number) => ({
    code: String(node.Postnr ?? node.postnr ?? `K${index + 1}`),
    title: String(node.Tekst ?? node.Kodetekst ?? "Uten tittel"),
    level: depthFromCode(String(node.Postnr ?? "")),
    sortOrder: index + 1
  }));

  const items = posterNodes.map((node: AnyRecord) => {
    const description = node.Beskrivelse ?? node.Kodetekst ?? "";
    const prisinfo = node.Prisinfo ?? {};

    return {
      postNumber: String(node.Postnr ?? ""),
      nsCode: valueOrNull(node.Kode),
      nsRevision: valueOrNull(node.Revisjon),
      heading: String(node.Kodetekst ?? "Uten heading"),
      quantity: Number(prisinfo.Mengde ?? node.Mengde ?? 0),
      unit: valueOrNull(prisinfo.Enhet ?? node.Enhet),
      quantityRule: valueOrNull(prisinfo.Regel ?? node.Regel),
      description: {
        nsCode: valueOrNull(node.Kode),
        nsRevision: valueOrNull(node.Revisjon),
        heading: valueOrNull(node.Kodetekst),
        rawXml: JSON.stringify(node),
        displayText: String(description),
        keywords: extractPairs(node.Nokkelord),
        matrixValues: extractPairs(node.Matrise),
        requirements: toArray(node.Krav).map((k: AnyRecord) => ({
          type: String(k.Type ?? "generell"),
          heading: valueOrNull(k.Overskrift),
          text: valueOrNull(k.Tekst),
          rtf: valueOrNull(k.Rtf)
        }))
      }
    };
  });

  return { chapters, items };
}

function extractPairs(input: any) {
  return toArray(input).map((entry: any) => ({
    label: String(entry.Label ?? entry.Navn ?? ""),
    value: String(entry.Value ?? entry.Verdi ?? "")
  }));
}

function toArray<T>(value: T | T[]): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function depthFromCode(code: string) {
  return code ? code.split(".").length : 1;
}

function valueOrNull(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}
