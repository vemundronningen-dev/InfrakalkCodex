"use client";

import { useState } from "react";

export function InviteForm({ projectId, itemOptions }: { projectId: string; itemOptions: { id: string; label: string }[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const payload = {
      externalCompany: {
        name: formData.get("name"),
        orgNumber: formData.get("orgNumber"),
        contactName: formData.get("contactName"),
        email: formData.get("email")
      },
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      priceItemIds: selected
    };

    const res = await fetch(`/api/projects/${projectId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    setMessage(res.ok ? `Invitation sent: ${json.secureLink}` : json.error);
  }

  return (
    <form action={submit} className="space-y-3 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Send to subcontractor</h2>
      <div className="grid grid-cols-2 gap-2">
        <input name="name" placeholder="Company name" className="rounded border p-2" required />
        <input name="email" type="email" placeholder="Email" className="rounded border p-2" required />
        <input name="orgNumber" placeholder="Org number" className="rounded border p-2" />
        <input name="contactName" placeholder="Contact name" className="rounded border p-2" />
        <input name="title" placeholder="Package title" className="rounded border p-2" required />
        <input name="dueDate" type="date" className="rounded border p-2" required />
      </div>
      <textarea name="description" placeholder="Description" className="w-full rounded border p-2" />
      <div className="max-h-36 overflow-auto rounded border p-2">
        {itemOptions.map((item) => (
          <label key={item.id} className="block">
            <input
              type="checkbox"
              onChange={(e) => setSelected((prev) => (e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)))}
            /> {item.label}
          </label>
        ))}
      </div>
      <button type="submit" className="rounded bg-blue-700 px-3 py-2 text-white">Send invitation</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
