// app/page.tsx

export default function Page() {
  // You can later wire this up to real Neynar / mini-app data
  const user = {
    name: "Proof",
    handle: "@jarno12-base",
    fid: "1121193",
    followers: "116",
    following: "223",
    casts: "99+",
    openRank: "#375.4K",
  };

  return (
    <main className="w-full px-4">
      <div className="mx-auto max-w-md py-8">
        {/* Outer gradient frame */}
        <section className="rounded-3xl bg-gradient-to-br from-indigo-800 via-purple-800 to-blue-900 p-[1px] shadow-2xl">
          {/* Inner card */}
          <div className="rounded-[22px] bg-slate-950/95 p-6 space-y-6">
            {/* Title / subtitle */}
            <header className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300">
                Stats Peek
              </p>
              <h1 className="text-2xl font-semibold leading-tight">
                Your Farcaster community snapshot
              </h1>
              <p className="text-xs text-slate-300">
                Quick view of your presence on Base & Farcaster.
              </p>
            </header>

            {/* User info right after title */}
            <section className="flex items-center gap-4 rounded-2xl bg-slate-900/80 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl">
                🟩
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-300">{user.handle}</p>
                <p className="text-[11px] text-slate-400">FID {user.fid}</p>
              </div>
              <a
                href="https://warpcast.com/jarno12-base"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-cyan-300 underline underline-offset-2"
              >
                View profile
              </a>
            </section>

            {/* Featured drop card – similar to top card in screenshot */}
            <section className="rounded-2xl bg-gradient-to-br from-purple-700/80 via-fuchsia-600/80 to-indigo-600/80 p-[1px]">
              <div className="flex gap-4 rounded-[18px] bg-slate-950/95 p-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-300 to-pink-400 shadow-md" />
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                    New Artist Drop
                  </p>
                  <p className="text-sm font-semibold">
                    BaseBlocks Identity Cubes
                  </p>
                  <p className="text-[11px] text-slate-200">
                    Mint an evolving on-chain cube tied to your wallet and
                    Farcaster identity.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    0.00016 ETH • Tap to mint
                  </p>
                </div>
                <a
                  href="https://basescan.org/address/0xaa27a2f268bf92e533166fba559f09eef4d84c60"
                  target="_blank"
                  rel="noreferrer"
                  className="self-center rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow-md hover:bg-pink-400"
                >
                  View
                </a>
              </div>
            </section>

            {/* Stats grid – no Neynar badge, just simple boxes */}
            <section className="space-y-4 rounded-2xl bg-slate-900/80 p-4">
              <div className="grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    Followers
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {user.followers}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    Following
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {user.following}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    Casts
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {user.casts}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    OpenRank
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {user.openRank}
                  </div>
                </div>
              </div>

              {/* Link pills at bottom */}
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://basescan.org/address/0xaa27a2f268bf92e533166fba559f09eef4d84c60"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] text-slate-200 hover:border-slate-500"
                >
                  BaseBlocks contract
                </a>
                <a
                  href="https://warpcast.com/~/compose"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] text-slate-200 hover:border-slate-500"
                >
                  Cast about your stats
                </a>
                <a
                  href="https://warpcast.com/miniapps"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] text-slate-200 hover:border-slate-500"
                >
                  Explore more mini apps
                </a>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
