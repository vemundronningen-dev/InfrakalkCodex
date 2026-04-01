"use client";

import { useState } from "react";

type Item = {
  id: string;
  postNumber: string;
  heading: string;
  quantity: string;
  unit: string | null;
  costTotal: string;
  salesPrice: string;
  description: { displayText: string | null } | null;
};

type Template = { id: string; name: string; category: string; defaultUnit: string; defaultCost: string };

export function PriceItemTable({ projectId, items, templates }: { projectId: string; items: Item[]; templates: Template[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  async function addTemplateLine(priceItemId: string, templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    await fetch(`/api/projects/${projectId}/resource-lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceItemId,
        name: template.name,
        category: template.category,
        unit: template.defaultUnit,
        quantity: 1,
        unitCost: Number(template.defaultCost)
      })
    });
    location.reload();
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="p-2">Post</th><th className="p-2">Heading</th><th className="p-2">Qty</th><th className="p-2">Unit</th><th className="p-2">Cost</th><th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <>
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.postNumber}</td><td className="p-2">{item.heading}</td><td className="p-2">{item.quantity}</td><td className="p-2">{item.unit}</td><td className="p-2">{item.costTotal}</td>
                <td className="p-2">
                  <button className="mr-2 rounded bg-slate-700 px-2 py-1 text-white" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>Expand</button>
                  <select className="rounded border p-1" onChange={(e) => e.target.value && void addTemplateLine(item.id, e.target.value)}>
                    <option value="">Add resource template</option>
                    {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                  </select>
                </td>
              </tr>
              {expanded === item.id && (
                <tr className="bg-slate-50">
                  <td colSpan={6} className="p-4">
                    <p className="font-semibold">Description (NS3420)</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-700">{item.description?.displayText ?? "No description"}</p>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
