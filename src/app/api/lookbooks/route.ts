import { handleApi, readBody, requireUser } from "@/server/http";
import { createLookbook, listLookbooks } from "@/server/lookbooks";
import { createLookbookSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleApi(async () => {
    const user = await requireUser(request);
    return { lookbooks: await listLookbooks(user.id) };
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const input = await readBody(request, createLookbookSchema);
    return { lookbook: await createLookbook(user.id, input) };
  }, 201);
}
