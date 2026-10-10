import { handleApi, readBody, requireUser } from "@/server/http";
import { createLook, listLooks } from "@/server/looks";
import { createLookSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleApi(async () => {
    const user = await requireUser(request);
    return { looks: await listLooks(user.id) };
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const input = await readBody(request, createLookSchema);
    return { look: await createLook(user.id, input) };
  }, 201);
}
