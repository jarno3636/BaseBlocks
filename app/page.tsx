// app/page.tsx

export default function Home() {
  // Placeholder data – you can later swap for real API calls
  const demoProfile = {
    name: "Proof",
    handle: "@jarno12-base",
    fid: "1121193",
    cubeId: "#0001",
    followers: "116",
    following: "223",
    casts: "99+",
    rank: "#375.4K",
  };

  return (
    <section className="w-full max-w-md flex flex-col gap-6">
      {/* Header ABOVE the card, like “Stats Peek” */}
      <header className="text-center space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300/80">
          BaseBlocks
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Your blockchain identity in a Base cube
        </h1>
        <p className="text-sm text-slate-300/80 max-w-sm mx-auto">
          One evolving cube per wallet. Track your age, prestige, and primary
          token in a single onchain identity.
        </p>
      </header>

      {/* Main stats card */}
      <div className="stats-card stats-appear px-5 py-6 sm:px-6 sm:py-7">
        {/* Top row – avatar + user info (like Stats Peek’s main panel) */}
        <div className="flex items-center gap-4">
          {/* Cube avatar placeholder */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-lg shadow-sky-900/70 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg border border-white/60 bg-sky-100/90" />
            <div className="absolute -inset-[2px] rounded-2xl border border-cyan-300/40 opacity-60" />
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold leading-tight">
                {demoProfile.name}
              </h2>
              <span className="pill bg-sky-500/15 text-sky-200 border border-sky-500/40">
                Cube Active
              </span>
            </div>
            <p className="text-xs text-slate-300/90">
              {demoProfile.handle} · FID: {demoProfile.fid}
            </p>
            <p className="text-xs text-slate-400">
              BaseBlocks ID{" "}
              <span className="font-mono">{demoProfile.cubeId}</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-5 mb-4">
          <hr className="hr-soft" />
        </div>

        {/* Identity description row (no Neynar label) */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Identity Snapshot
            </p>
            <p className="text-sm text-slate-300/90">
              Your cube evolves over time as your onchain story unfolds.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-semibold leading-none">—</span>
            <span className="text-[10px] text-slate-400 mt-1">
              Score coming soon
            </span>
          </div>
        </div>

        {/* Stat grid like the original app */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
            <p className="text-[11px] text-slate-400 mb-1">Followers</p>
            <p className="text-lg font-semibold">{demoProfile.followers}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
            <p className="text-[11px] text-slate-400 mb-1">Following</p>
            <p className="text-lg font-semibold">{demoProfile.following}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
            <p className="text-[11px] text-slate-400 mb-1">Casts</p>
            <p className="text-lg font-semibold">{demoProfile.casts}</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 px-3 py-3">
            <p className="text-[11px] text-slate-400 mb-1">OpenRank</p>
            <p className="text-lg font-semibold">{demoProfile.rank}</p>
          </div>
        </div>

        {/* Links row – swap hrefs for your real URLs */}
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
            Links
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="#"
              className="text-xs px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-100 hover:bg-sky-500/25 transition"
            >
              View cube on Base
            </a>
            <a
              href="#"
              className="text-xs px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-600 text-slate-100 hover:bg-slate-800/90 transition"
            >
              Open Farcaster profile
            </a>
            <a
              href="#"
              className="text-xs px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-600 text-slate-100 hover:bg-slate-800/90 transition"
            >
              Visit BaseBlocks site
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
