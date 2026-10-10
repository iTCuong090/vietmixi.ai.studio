import type { Metadata } from "next";
import { getPublicShare } from "@/server/shares";
import { SharedView } from "@/components/shared-view";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const token = slug && slug.length > 0 ? slug[slug.length - 1] : "";
  const share = token ? await getPublicShare(token) : null;

  if (!share) {
    return {
      title: "Một cảm hứng được chia sẻ",
      robots: { index: false, follow: false },
    };
  }

  const title = `${share.name} — Việt Mixi`;
  const description =
    share.description ||
    `Khám phá bản phối ${share.name} của ${share.author} trên Việt Mixi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "vi_VN",
      type: "website",
    },
    robots: { index: false, follow: false },
  };
}

export default async function SharedLookbookPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const token = slug && slug.length > 0 ? slug[slug.length - 1] : "";
  const share = token ? await getPublicShare(token) : null;

  return (
    <>
      <SharedView initialShare={share} token={token} />
      <Footer />
    </>
  );
}
