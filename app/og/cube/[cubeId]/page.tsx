// app/og/cube/[cubeId]/page.tsx
import { redirect } from "next/navigation";

const MINI_APP_LINK =
  process.env.NEXT_PUBLIC_FC_MINIAPP_LINK ||
  process.env.NEXT_PUBLIC_FC_MINIAPP_URL ||
  "https://farcaster.xyz/miniapps/your-miniapp-id";

type PageProps = {
  params: { cubeId: string };
};

export default function Page({ params }: PageProps) {
  // Optional: if you want ?cube=... in the mini-app URL:
  const url = `${MINI_APP_LINK}?cube=${params.cubeId}`;
  redirect(url);
}
