import { z } from "zod";
import { outfitSchema } from "@/server/validation";
import { generateRealLifeImage } from "@/lib/gemini-real-life";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const realLifeRequestSchema = z.object({
  config: outfitSchema,
  mode: z.enum(["model", "photo"]),
  userImageBase64: z.string().optional(),
  userImageMime: z.string().optional(),
  customPrompt: z.string().max(1000).optional(),
  setting: z
    .enum(["studio", "hoi-an", "hue", "lotus-pond", "modern-street"])
    .optional(),
  shotType: z.enum(["full", "medium"]).optional(),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Dữ liệu gửi lên không đúng định dạng JSON." },
        { status: 400 },
      );
    }

    const parseResult = realLifeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        {
          error:
            "Dữ liệu bản phối hoặc tùy chọn chưa hợp lệ. Vui lòng kiểm tra lại.",
          details: parseResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { config, mode, userImageBase64, userImageMime, customPrompt, setting, shotType } =
      parseResult.data;

    if (mode === "photo" && !userImageBase64) {
      return Response.json(
        { error: "Vui lòng chọn hoặc tải lên một bức ảnh chân dung để bắt đầu." },
        { status: 400 },
      );
    }

    const result = await generateRealLifeImage({
      config,
      mode,
      userImageBase64,
      userImageMime,
      customPrompt,
      setting,
      shotType,
    });

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error("Lỗi khi tạo ảnh thực tế:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Không thể tạo hình ảnh ngoài đời thực lúc này.";
    return Response.json({ error: message }, { status: 500 });
  }
}
