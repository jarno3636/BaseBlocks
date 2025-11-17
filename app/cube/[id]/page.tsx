// app/cube/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";

type CubePageProps = {
  params: { id: string };
};

// Dynamic metadata per cube id
export async function generateMetadata(
  { params }: CubePageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  const origin = envUrl
    ? `https://${envUrl.replace(/\/$/, "")}`
    : "https://baseblox.vercel.app";

  // For now we just reuse share.PNG.
  // Later you could swap this to a per-cube image URL from your contract.
  const image = `${origin}/share.PNG`;

  const title = `BaseBlox Cube #${id}`;
  const description = `View BaseBlox identity cube #${id} on Base. One evolving onchain identity cube per wallet.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${origin}/cube/${id}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `BaseBlox cube #${id}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function CubePage({ params }: CubePageProps) {
  const { id } = params;

  // You can later replace this with a real viewer component that
  // reads onchain data for this cube ID.
  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-10 text-slate-50">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        BaseBlox Cube #{id}
      </h1>
      <p className="text-sm text-slate-300 mb-4">
        Public view for this BaseBlox identity cube. A dedicated viewer can be
        wired up here to show its age, prestige, and primary token.
      </p>

      <p className="text-xs text-slate-500">
        (Placeholder page: plug in your onchain read logic / existing cube
        components here.)
      </p>
    </section>
  );
}
