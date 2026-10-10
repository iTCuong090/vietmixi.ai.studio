import { handleApi, readBody, requireUser } from "@/server/http";
import { setSharing } from "@/server/shares";
import { shareSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleApi(async () => {
    const user = await requireUser(request, true);
    const input = await readBody(request, shareSchema);
    return { token: await setSharing(user.id, input) };
  });
}
