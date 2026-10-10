import { GoogleGenAI } from "@google/genai";
import { getGarment, getPalette } from "./catalog";
import type { OutfitConfig } from "./types";

export interface GenerateRealLifeParams {
  config: OutfitConfig;
  mode: "model" | "photo";
  userImageBase64?: string;
  userImageMime?: string;
  customPrompt?: string;
  setting?: "studio" | "hoi-an" | "hue" | "lotus-pond" | "modern-street";
  shotType?: "full" | "medium";
}

export interface GenerateRealLifeResult {
  imageUrl: string;
  prompt: string;
  model: string;
  note?: string;
  isFallback?: boolean;
  editorialAnalysis?: string;
}

const SETTING_DESCRIPTIONS: Record<string, string> = {
  studio:
    "a high-end fashion editorial photography studio with warm ivory cream backdrop, soft flattering diffuse natural daylight, subtle organic shadows",
  "hoi-an":
    "an atmospheric sunlit street in the ancient town of Hội An, warm yellow weathered walls, wooden shutters, hanging lanterns in soft golden hour light",
  hue: "the historic Imperial Citadel courtyard in Huế, ancient stone flagstones, majestic weathered pavilion with traditional Vietnamese lacquer wood pillars",
  "lotus-pond":
    "a serene Vietnamese lotus pond garden in early morning, soft morning mist, floating green lily pads and blooming pink lotus blossoms",
  "modern-street":
    "a vibrant tree-lined avenue in contemporary Hanoi or Saigon, elegant blend of French colonial heritage and modern urban aesthetics",
};

const GARMENT_LOOK_IMAGES: Record<string, string> = {
  "ao-dai": "/images/looks/ao-dai.png",
  "ngu-than": "/images/looks/ngu-than.png",
  "tu-than": "/images/looks/tu-than.png",
  "nhat-binh": "/images/looks/nhat-binh-v2.png",
  "ba-ba": "/images/looks/ba-ba.png",
  "ao-cham": "/images/looks/ao-cham.png",
};

export function buildOutfitPrompt(
  config: OutfitConfig,
  mode: "model" | "photo",
  customPrompt?: string,
  settingKey: string = "studio",
  shotType: "full" | "medium" = "full",
): string {
  const garment = getGarment(config.garment);
  const primary = getPalette(config.primaryColor);
  const accent = getPalette(config.accentColor);

  let garmentDesc = "";
  if (config.garment === "ao-dai") {
    garmentDesc = `${garment.name} (modern Vietnamese Áo Dài with an elegant high mandarin collar, tailored upper bodice, side slits opening from the waist down to the ankles, long form-fitting sleeves, made of fine flowing silk)`;
  } else if (config.garment === "ngu-than") {
    garmentDesc = `${garment.name} (authentic Vietnamese Áo Ngũ Thân five-panel traditional robe with standing collar, traditional five-button diagonal front closure on the right side, straight tunic panels extending gracefully below knees, tailored sleeves)`;
  } else if (config.garment === "tu-than") {
    garmentDesc = `${garment.name} (traditional Northern Vietnamese Áo Tứ Thân four-panel ensemble featuring open outer flowing panels tied loosely at the waist, contrasting traditional yếm bodice underneath, wide fabric sash belt)`;
  } else if (config.garment === "nhat-binh") {
    garmentDesc = `${garment.name} (regal Vietnamese royal Áo Nhật Bình court robe featuring the signature prominent rectangular embroidered collar cổ áo chữ nhật, wide flared sleeves with concentric colored ribbon cuff trims, delicate circular floral and cloud embroidery medallions)`;
  } else if (config.garment === "ba-ba") {
    garmentDesc = `${garment.name} (authentic Southern Vietnamese Áo Bà Ba silk blouse with round collarless neckline, central button line, two subtle front patch pockets, hip-length hem with side slits)`;
  } else if (config.garment === "ao-cham") {
    garmentDesc = `${garment.name} (traditional Northern highlands Áo Chàm ethnic ensemble dyed in natural indigo hues, featuring a diagonal right-lapel closure with refined contrasting piping trim, matched with a fabric waist belt sash)`;
  }

  const colorDesc = `The primary garment color is ${primary.name} (${primary.hex}), accented with refined details and trims in ${accent.name} (${accent.hex})`;

  const bottomDesc =
    config.bottom === "skirt"
      ? `paired with an ankle-length flowing pleated skirt in ${accent.name}`
      : `paired with wide-leg loose silk trousers in ${accent.name}`;

  const accList: string[] = [];
  if (config.accessories.head === "khan-dong") {
    accList.push("wearing a matching cylindrical wrapped fabric headpiece (khăn đóng)");
  } else if (config.accessories.head === "khan-van") {
    accList.push("wearing a traditional folded Vietnamese headwrap (khăn vấn)");
  } else if (config.accessories.head === "non-la") {
    accList.push("wearing or holding an iconic Vietnamese conical palm leaf hat (nón lá)");
  } else if (config.accessories.head === "non-quai-thao") {
    accList.push(
      "wearing a large flat circular Quan Họ festival hat with long hanging silk tassels (nón quai thao)",
    );
  }

  if (config.accessories.hand === "lotus") {
    accList.push("gently holding a single fresh pink lotus flower with stem");
  } else if (config.accessories.hand === "fan") {
    accList.push("holding a delicate Vietnamese bamboo folding fan");
  } else if (config.accessories.hand === "tote") {
    accList.push("carrying a minimalist contemporary natural canvas tote bag");
  }

  if (config.accessories.shoes === "sneakers") {
    accList.push("wearing clean minimalist white contemporary sneakers");
  } else if (config.accessories.shoes === "sandals") {
    accList.push("wearing simple traditional leather strap sandals");
  } else if (config.accessories.shoes === "flats") {
    accList.push("wearing elegant flat traditional closed slip-on shoes");
  }

  const jewelryList: string[] = [];
  if (config.garment === "ao-cham") {
    if (config.jewelry?.kieng) {
      jewelryList.push("a polished traditional solid silver torc neck ring (kiềng bạc)");
    }
    if (config.jewelry?.xatich) {
      jewelryList.push("an ornate silver waist chatelaine chain accessory hanging at hip (xà tích bạc)");
    }
    if (config.jewelry?.bangles) {
      jewelryList.push("handcrafted silver bangles on the wrist");
    }
  } else if (config.garment === "ao-dai") {
    jewelryList.push("a lustrous white natural pearl necklace and a translucent jade bangle");
  } else if (config.garment === "ngu-than") {
    jewelryList.push("an imperial Hue carved jade plaque tablet with crimson silk tassels");
  } else if (config.garment === "nhat-binh") {
    jewelryList.push("an ornate imperial Vietnamese court jade collar plaque with five-color silk fringe and golden dragon-phoenix bangles");
  } else if (config.garment === "tu-than") {
    jewelryList.push("multi-colored flowing silk waist sashes tied in traditional Kinh Bac folk style");
  } else if (config.garment === "ba-ba") {
    jewelryList.push("a natural agarwood bead necklace and Southern Vietnamese green jadeite bangle");
  }

  const settingText = SETTING_DESCRIPTIONS[settingKey] || SETTING_DESCRIPTIONS.studio;
  const shotDesc =
    shotType === "medium"
      ? "medium portrait shot from waist up, showing facial details and upper garment neckline"
      : "full-body vertical fashion shot from head to toe, standing pose in frame";

  if (mode === "photo") {
    return [
      `Use the person from the input image as the subject. Preserve their exact facial features, face shape, natural expression, and distinctive characteristics.`,
      `Dress the subject in an authentic, high-fashion Vietnamese outfit ensemble:`,
      `- Garment: ${garmentDesc}`,
      `- Palette: ${colorDesc}`,
      `- Bottom: ${bottomDesc}`,
      accList.length > 0 ? `- Accessories: ${accList.join(", ")}` : "",
      jewelryList.length > 0 ? `- Traditional Jewelry: ${jewelryList.join(", ")}` : "",
      `- Setting: ${settingText}`,
      `- Photography: ${shotDesc}, high-resolution fashion editorial photography, natural skin texture, tactile fabric weaves with silk sheen, soft cinematic lighting.`,
      customPrompt ? `- Additional artistic direction: ${customPrompt}` : "",
      `No distorted anatomy, no weird hands, no logos, photorealistic 4k quality.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const genderSubject =
    config.avatar === "male"
      ? "one Vietnamese young adult male, age 22-26, handsome dignified posture, natural warm skin tone"
      : "one Vietnamese young adult female, age 20-25, elegant graceful posture, radiant natural warm skin tone";

  return [
    `Full-body Vietnamese fashion editorial photograph featuring ${genderSubject}.`,
    `Contemporary luxury fashion interpretation of traditional Vietnamese attire:`,
    `- Garment: ${garmentDesc}`,
    `- Colors: ${colorDesc}`,
    `- Bottom wear: ${bottomDesc}`,
    accList.length > 0 ? `- Accessories: ${accList.join(", ")}` : "",
    jewelryList.length > 0 ? `- Jewelry: ${jewelryList.join(", ")}` : "",
    `- Environment: ${settingText}`,
    `- Composition: ${shotDesc}, centered vertical 3:4 framing, professional studio or natural daylight illumination, authentic fabric draping and rich tactile texture.`,
    customPrompt ? `- Custom notes: ${customPrompt}` : "",
    `Pristine photorealistic quality, no watermark, no text, no AI artifacts.`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function getGeminiEditorialAnalysis(
  ai: GoogleGenAI,
  config: OutfitConfig,
  mode: "model" | "photo",
  customPrompt?: string,
): Promise<string> {
  try {
    const garment = getGarment(config.garment);
    const primary = getPalette(config.primaryColor);
    const accent = getPalette(config.accentColor);

    const promptText = `Bạn là Giám tuyển Thời trang và Chuyên gia Di sản Việt Mixi. Hãy viết lời bình ngắn gọn (3-4 câu, súc tích, đậm chất nghệ thuật và truyền cảm hứng) phân tích vẻ đẹp khi mang bộ phối này ra đời thực:
- Trang phục: ${garment.name}
- Sắc màu: ${primary.name} phối cùng ${accent.name}
- Dáng mặc: ${config.bottom === "skirt" ? "Váy đầm thướt tha" : "Quần lụa suông"}
- Chế độ: ${mode === "photo" ? "Mặc thử trên ảnh cá nhân của người dùng" : "Người mẫu thực tế"}
${customPrompt ? `- Lưu ý thêm từ người phối: ${customPrompt}` : ""}

Hãy nhấn mạnh sự hòa quyện giữa chất liệu vải ngoài đời thực, ánh sáng và nét duyên dáng Việt.`;

    const res = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
    });
    return res.text?.trim() || "";
  } catch (error) {
    console.warn("Không thể tạo phân tích qua gemini-3.8-flash:", error);
    return "";
  }
}

export async function generateRealLifeImage(
  params: GenerateRealLifeParams,
): Promise<GenerateRealLifeResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Dịch vụ AI chưa có khóa kết nối. Vui lòng kiểm tra biến GEMINI_API_KEY trên máy chủ.",
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const prompt = buildOutfitPrompt(
    params.config,
    params.mode,
    params.customPrompt,
    params.setting,
    params.shotType,
  );

  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

  if (params.mode === "photo" && params.userImageBase64) {
    const rawBase64 = params.userImageBase64.replace(/^data:[^;]+;base64,/, "");
    const mime = params.userImageMime || "image/jpeg";
    parts.push({
      inlineData: {
        data: rawBase64,
        mimeType: mime,
      },
    });
  }

  parts.push({ text: prompt });

  const primaryModel = "gemini-nano-banana-2.1";
  const fallbackModel = "gemini-3.1-flash-lite-image";

  let response;
  let modelUsed = primaryModel;
  let liveImageGenerated = false;
  let imageUrl: string | null = null;
  let textResponse = "";

  try {
    response = await ai.models.generateContent({
      model: primaryModel,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K",
        },
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          liveImageGenerated = true;
          break;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }
  } catch (primaryErr: unknown) {
    console.warn(`Mô hình ${primaryModel} không khả dụng, thử fallback:`, primaryErr);
    try {
      modelUsed = fallbackModel;
      response = await ai.models.generateContent({
        model: fallbackModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
          },
        },
      });

      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            liveImageGenerated = true;
            break;
          } else if (part.text) {
            textResponse += part.text;
          }
        }
      }
    } catch (fallbackErr: unknown) {
      console.warn("Mô hình tạo ảnh trả phí chưa được kích hoạt, chuyển sang chế độ Giám tuyển AI:", fallbackErr);
    }
  }

  // If live image model generated an image successfully:
  if (liveImageGenerated && imageUrl) {
    return {
      imageUrl,
      prompt,
      model: modelUsed,
      note: textResponse.trim() || undefined,
      isFallback: false,
    };
  }

  // If live generative image creation is unavailable (e.g. user declined paid API key):
  // Fall back gracefully to high-res editorial lookbook photo matching the garment,
  // accompanied by an intelligent Gemini 3.8 Flash fashion critique and styling analysis!
  const editorialImage =
    GARMENT_LOOK_IMAGES[params.config.garment] || "/images/looks/ao-dai.png";

  const editorialAnalysis = await getGeminiEditorialAnalysis(
    ai,
    params.config,
    params.mode,
    params.customPrompt,
  );

  return {
    imageUrl: editorialImage,
    prompt,
    model: "gemini-3.8-flash",
    note: "Đang hiển thị ảnh người mẫu thực tế tiêu chuẩn kèm bản giám tuyển từ Gemini 3.8 Flash (khóa trả phí tạo ảnh trực tiếp chưa kích hoạt).",
    isFallback: true,
    editorialAnalysis:
      editorialAnalysis ||
      `Bản phối ${getGarment(params.config.garment).name} với sắc ${getPalette(params.config.primaryColor).name} mang nét chấm phá đương đại trên phom dáng di sản, tạo nên vẻ thanh lịch và cuốn hút khi xuất hiện ngoài đời thực.`,
  };
}
