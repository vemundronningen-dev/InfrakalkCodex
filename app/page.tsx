import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold">InfraKalk MVP</h1>
      <div className="space-y-3">
        {projects.map((project) => (
          <Link className="block rounded border bg-white p-4 hover:bg-slate-100" key={project.id} href={`/project/${project.id}`}>
            <p className="font-semibold">{project.name}</p>
            <p className="text-sm text-slate-600">{project.id}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
