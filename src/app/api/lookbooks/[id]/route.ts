import { handleApi, readBody, requireUser } from "@/server/http";
import { deleteLookbook, updateLookbook } from "@/server/lookbooks";
import { idSchema, updateLookbookSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const id = idSchema.parse((await context.params).id);
    const input = await readBody(request, updateLookbookSchema);
    return { lookbook: await updateLookbook(user.id, id, input) };
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const id = idSchema.parse((await context.params).id);
    await deleteLookbook(user.id, id);
    return { ok: true };
  });
}
