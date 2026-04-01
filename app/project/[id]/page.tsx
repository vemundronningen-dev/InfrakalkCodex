import { InviteForm } from "@/components/project/invite-form";
import { PriceItemTable } from "@/components/project/price-item-table";
import { XmlUpload } from "@/components/project/xml-upload";
import { prisma } from "@/lib/prisma";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      chapters: { orderBy: { sortOrder: "asc" } },
      priceItems: { include: { description: true }, orderBy: { postNumber: "asc" } }
    }
  });

  const templates = await prisma.resourceTemplate.findMany();

  if (!project) return <main className="p-8">Project not found</main>;

  const itemRows = project.priceItems.map((item) => ({
    id: item.id,
    postNumber: item.postNumber,
    heading: item.heading,
    quantity: item.quantity.toString(),
    unit: item.unit,
    costTotal: item.costTotal.toString(),
    salesPrice: item.salesPrice.toString(),
    description: item.description ? { displayText: item.description.displayText } : null
  }));

  const templateRows = templates.map((template) => ({
    id: template.id,
    name: template.name,
    category: template.category,
    defaultUnit: template.defaultUnit,
    defaultCost: template.defaultCost.toString()
  }));

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <XmlUpload projectId={project.id} />

      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-3">
          <h2 className="text-xl font-semibold">Price items</h2>
          <PriceItemTable projectId={project.id} items={itemRows} templates={templateRows} />
          <div className="flex gap-2">
            <a href={`/api/projects/${project.id}/export/pdf`} className="rounded bg-emerald-700 px-3 py-2 text-white">Export PDF</a>
            <a href={`/api/projects/${project.id}/export/xml`} className="rounded bg-slate-700 px-3 py-2 text-white">Export XML</a>
          </div>
        </div>
        <InviteForm
          projectId={project.id}
          itemOptions={project.priceItems.map((i) => ({ id: i.id, label: `${i.postNumber} ${i.heading}` }))}
        />
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Chapter tree</h2>
        <ul className="space-y-1 text-sm">
          {project.chapters.map((ch) => (
            <li key={ch.id} style={{ paddingLeft: `${ch.level * 16}px` }}>{ch.code} - {ch.title}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
