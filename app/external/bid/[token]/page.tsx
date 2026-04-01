"use client";

import { useEffect, useState } from "react";

type BidData = {
  invitation: { token: string; dueDate: string };
  packages: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      priceItem: { postNumber: string; heading: string; quantity: string; unit: string | null };
      submissions: Array<{ unitPrice: string; totalPrice: string; comment: string | null }>;
    }>;
  }>;
};

export default function ExternalBidPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<BidData | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/bid/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.token })
    })
      .then((r) => r.json())
      .then(setData);
  }, [params.token]);

  async function save(status: "draft" | "submitted") {
    if (!data) return;
    const inputs = Array.from(document.querySelectorAll("[data-item]"));
    const entries = inputs.map((node) => {
      const itemId = node.getAttribute("data-item") as string;
      const unitPrice = Number((node.querySelector("[name=unitPrice]") as HTMLInputElement).value || 0);
      const totalPrice = Number((node.querySelector("[name=totalPrice]") as HTMLInputElement).value || 0);
      const comment = (node.querySelector("[name=comment]") as HTMLInputElement).value;
      return { bidPackageItemId: itemId, unitPrice, totalPrice, comment, status };
    });

    const res = await fetch(`/api/bid/${params.token}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries })
    });

    setMessage(res.ok ? `Saved (${status})` : "Failed");
  }

  if (!data) return <main className="p-8">Loading...</main>;

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Subcontractor bid</h1>
      {data.packages.map((pkg) => (
        <section key={pkg.id} className="rounded border bg-white p-4">
          <h2 className="font-semibold">{pkg.title}</h2>
          <div className="space-y-3 pt-2">
            {pkg.items.map((item) => (
              <div key={item.id} data-item={item.id} className="rounded border p-3">
                <p className="font-medium">{item.priceItem.postNumber} - {item.priceItem.heading}</p>
                <p className="text-sm">Qty {item.priceItem.quantity} {item.priceItem.unit}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <input name="unitPrice" placeholder="Unit price" className="rounded border p-2" />
                  <input name="totalPrice" placeholder="Total price" className="rounded border p-2" />
                  <input name="comment" placeholder="Comment" className="rounded border p-2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="flex gap-2">
        <button onClick={() => void save("draft")} className="rounded bg-slate-700 px-3 py-2 text-white">Save draft</button>
        <button onClick={() => void save("submitted")} className="rounded bg-blue-700 px-3 py-2 text-white">Submit</button>
      </div>
      {message && <p>{message}</p>}
    </main>
  );
}
