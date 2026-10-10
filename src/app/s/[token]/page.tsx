import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublicShare } from "@/server/shares";
import { SharedView } from "@/components/shared-view";
import { Footer } from "@/components/footer";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Một cảm hứng được chia sẻ",
  robots: { index: false, follow: false },
};

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await getPublicShare(token);
  if (share) {
    const slug = slugify(share.name);
    redirect(`/lookbook/${slug}/${token}`);
  }
  return (
    <>
      <SharedView initialShare={share} token={token} />
      <Footer />
    </>
  );
}
