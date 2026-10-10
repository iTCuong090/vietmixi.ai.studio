import { handleApi, readBody, requireUser } from "@/server/http";
import { deleteLook, getLook, updateLook } from "@/server/looks";
import { idSchema, updateLookSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  return handleApi(async () => {
    const user = await requireUser(request);
    const id = idSchema.parse((await context.params).id);
    return { look: await getLook(user.id, id) };
  });
}

export async function PATCH(request: Request, context: Context) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const id = idSchema.parse((await context.params).id);
    const input = await readBody(request, updateLookSchema);
    return { look: await updateLook(user.id, id, input) };
  });
}

export async function DELETE(request: Request, context: Context) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const id = idSchema.parse((await context.params).id);
    await deleteLook(user.id, id);
    return { ok: true };
  });
}
