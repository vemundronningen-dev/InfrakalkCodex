import { XMLParser } from "fast-xml-parser";

type ParsedNode = Record<string, unknown>;

type DescriptionPart = {
  nsCode: string | null;
  nsRevision: string | null;
  heading: string | null;
  rawXml: string;
  displayText: string;
  keywords: Array<{ label: string; value: string }>;
  matrixValues: Array<{ label: string; value: string }>;
  requirements: Array<{ type: string; heading: string | null; text: string | null; rtf: string | null }>;
};

type ParsedItem = {
  postNumber: string;
  nsCode: string | null;
  nsRevision: string | null;
  heading: string;
  quantity: number;
  unit: string | null;
  quantityRule: string | null;
  description: DescriptionPart;
};

export function parseNs3459(xmlText: string): { chapters: Array<{ code: string; title: string; level: number; sortOrder: number }>; items: ParsedItem[] } {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const parsed = parser.parse(xmlText) as ParsedNode;

  const root = asRecord(parsed.ProsjektNS) ?? parsed;
  const planNodes = toArray(asRecord(root.Postnrplan)?.Post ?? root.Postnrplan).map(asRecord).filter(isParsedNode);
  const posterNodes = toArray(asRecord(root.Poster)?.Post ?? root.Poster).map(asRecord).filter(isParsedNode);

  const chapters = planNodes.map((node, index) => ({
    code: String(node.Postnr ?? node.postnr ?? `K${index + 1}`),
    title: String(node.Tekst ?? node.Kodetekst ?? "Uten tittel"),
    level: depthFromCode(String(node.Postnr ?? "")),
    sortOrder: index + 1
  }));

  const items = posterNodes.map((node) => {
    const description = node.Beskrivelse ?? node.Kodetekst ?? "";
    const prisinfo = asRecord(node.Prisinfo) ?? {};

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
        requirements: toArray(node.Krav)
          .map(asRecord)
          .filter(isParsedNode)
          .map((k) => ({
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

function extractPairs(input: unknown) {
  return toArray(input)
    .map(asRecord)
    .filter(isParsedNode)
    .map((entry) => ({
      label: String(entry.Label ?? entry.Navn ?? ""),
      value: String(entry.Value ?? entry.Verdi ?? "")
    }));
}

function toArray(value: unknown): unknown[] {
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

function asRecord(value: unknown): ParsedNode | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as ParsedNode;
}

function isParsedNode(value: ParsedNode | null): value is ParsedNode {
  return value !== null;
}
