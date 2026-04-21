import { deleteCategoryAction, upsertCategoryAction } from "../actions";
import { prisma } from "@/lib/db/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.serviceCategory.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Service categories</h1>
      <form action={upsertCategoryAction} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input name="slug" placeholder="slug" className="rounded border px-3 py-2 text-sm" required />
        <input name="nameEn" placeholder="English name" className="rounded border px-3 py-2 text-sm" required />
        <input name="nameAr" placeholder="Arabic name" className="rounded border px-3 py-2 text-sm" required />
        <button className="rounded bg-navy px-3 py-2 text-sm text-white">Create category</button>
      </form>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl border bg-white p-4">
            <div className="grid gap-2 md:grid-cols-5">
              <form action={upsertCategoryAction} className="contents">
                <input type="hidden" name="id" value={category.id} />
                <input name="slug" defaultValue={category.slug} className="rounded border px-3 py-2 text-sm" required />
                <input name="nameEn" defaultValue={category.nameEn} className="rounded border px-3 py-2 text-sm" required />
                <input name="nameAr" defaultValue={category.nameAr} className="rounded border px-3 py-2 text-sm" required />
                <button className="rounded border px-3 py-2 text-sm">Update</button>
              </form>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <button className="rounded border px-3 py-2 text-sm">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
