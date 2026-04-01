"use client";

import { useState } from "react";

export function XmlUpload({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<string>("");

  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/projects/${projectId}/import-xml`, { method: "POST", body: formData });
    const json = await res.json();
    setStatus(res.ok ? `Imported ${json.importedItems} items` : json.error);
  }

  return (
    <div
      className="rounded-lg border-2 border-dashed border-slate-400 bg-white p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      <p className="font-medium">Drag and drop NS3459 XML here</p>
      <input className="mt-3" type="file" accept=".xml,text/xml" onChange={(e) => e.target.files?.[0] && void handleFile(e.target.files[0])} />
      {status && <p className="mt-2 text-sm text-slate-700">{status}</p>}
    </div>
  );
}
