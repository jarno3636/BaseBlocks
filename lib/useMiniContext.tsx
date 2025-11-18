// lib/useMiniContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type MiniUser = {
  fid: number;
  username?: string | null;
  displayName?: string | null;
  pfpUrl?: string | null;
};

type MiniState = {
  fid: number | null;
  user: MiniUser | null;
  inMini: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const Ctx = createContext<MiniState | null>(null);

function readQueryFid(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const u = new URL(window.location.href);
    const qfid = u.searchParams.get("fid");
    const n = qfid ? Number(qfid) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function MiniContextProvider({ children }: { children: React.ReactNode }) {
  const [fid, setFid] = useState<number | null>(null);
  const [user, setUser] = useState<MiniUser | null>(null);
  const [inMini, setInMini] = useState(false);
  const [loading, setLoading] = useState(true);
  const first = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      let resolved = false;

      // 1) Try to detect Farcaster / mini environments from globals
      if (typeof window !== "undefined") {
        const w: any = window as any;

        // Farcaster mini (via farcaster.miniapp or miniApp.context.user)
        let miniUser: any =
          w?.farcaster?.miniapp?.user ??
          w?.miniApp?.context?.user ??
          null;

        if (miniUser?.fid) {
          const f = Number(miniUser.fid);
          setFid(f);
          setUser({
            fid: f,
            username: miniUser.username ?? null,
            displayName:
              miniUser.displayName ??
              miniUser.display_name ??
              null,
            pfpUrl: miniUser.pfpUrl ?? miniUser.pfp_url ?? null,
          });
          setInMini(true);
          try {
            localStorage.setItem(
              "fc:minUser",
              JSON.stringify({
                fid: f,
                username: miniUser.username ?? null,
                pfpUrl: miniUser.pfpUrl ?? miniUser.pfp_url ?? null,
              }),
            );
          } catch {
            // ignore storage errors
          }
          resolved = true;
        }

        // Base app style detection (very rough)
        if (!resolved) {
          const looksMini =
            !!w?.farcaster?.miniapp ||
            !!w?.miniApp ||
            !!w?.coinbase?.miniKit ||
            !!w?.MiniKit;
          setInMini(looksMini);
        }
      }

      if (resolved) {
        return;
      }

      // 2) Fallback via ?fid= query param
      const qfid = readQueryFid();
      if (qfid) {
        setFid(qfid);
        try {
          const r = await fetch(`/api/neynar/user/${qfid}`);
          const j = await r.json();
          const p = j?.result?.user;
          setUser(
            p
              ? {
                  fid: qfid,
                  username: p?.username ?? null,
                  displayName: p?.display_name ?? null,
                  pfpUrl: p?.pfp_url ?? null,
                }
              : { fid: qfid },
          );
        } catch {
          setUser({ fid: qfid });
        }
        return;
      }

      // 3) Persisted from previous session in localStorage
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("fc:minUser");
          if (raw) {
            const v = JSON.parse(raw);
            if (v?.fid) {
              const f = Number(v.fid);
              setFid(f);
              setUser({
                fid: f,
                username: v.username ?? null,
                pfpUrl: v.pfpUrl ?? null,
              });
              return;
            }
          }
        } catch {
          // ignore
        }
      }

      // Nothing found
      setFid(null);
      setUser(null);
    } finally {
      setLoading(false);
      first.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();

    const onShow = () => refresh();
    const onVis = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const value = useMemo<MiniState>(
    () => ({
      fid,
      user,
      inMini,
      loading,
      refresh,
    }),
    [fid, user, inMini, loading, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMiniContext(): MiniState {
  const v = useContext(Ctx);
  if (!v) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("useMiniContext called outside of MiniContextProvider");
    }
    return {
      fid: null,
      user: null,
      inMini: false,
      loading: true,
      refresh: async () => {},
    };
  }
  return v;
}
