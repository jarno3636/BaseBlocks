"use client";

import { useEffect } from "react";

export default function AppReady() {
  useEffect(() => {
    let cancelled = false;
    let iv: ReturnType<typeof setInterval> | null = null;

    const d = document.documentElement;
    const DEBUG = process.env.NEXT_PUBLIC_MINI_DEBUG === "true";

    async function getFarcasterSdk(): Promise<any | null> {
      const g: any = globalThis as any;
      if (g?.farcaster?.miniapp?.sdk) return g.farcaster.miniapp.sdk;
      if (g?.Farcaster?.mini?.sdk) return g.Farcaster.mini.sdk;
      try {
        const mod: any = await import("@farcaster/miniapp-sdk");
        return mod?.sdk ?? mod?.default ?? null;
      } catch {
        return null;
      }
    }

    function getMiniKit(): any | null {
      const w = window as any;
      return w?.miniKit || w?.coinbase?.miniKit || w?.MiniKit || w?.coinbase?.minikit || null;
    }

    async function fireReadyOnce() {
      if (cancelled) return;

      // 1) Farcaster MiniApp SDK
      try {
        const sdk = await getFarcasterSdk();
        if (sdk?.actions?.ready) {
          await Promise.race([
            Promise.resolve(sdk.actions.ready()),
            new Promise((r) => setTimeout(r, 500)),
          ]);
          // stamp context for debugging
          try {
            const ctx = typeof sdk.context === "function" ? await sdk.context() : await sdk.context;
            if (ctx?.client) d.setAttribute("data-fc-client", String(ctx.client));
            if (DEBUG) console.log("[Mini] Farcaster ready ✓ ctx:", ctx ?? null);
          } catch {}
        }
      } catch {}

      // 2) Base App MiniKit readiness (separate from Farcaster)
      try {
        const mk = getMiniKit();
        if (mk?.setFrameReady) {
          await Promise.race([
            Promise.resolve(mk.setFrameReady()),
            new Promise((r) => setTimeout(r, 500)),
          ]);
          if (DEBUG) console.log("[Mini] Base MiniKit setFrameReady ✓");
          d.setAttribute("data-base-minikit", "ready");
        }
      } catch {}
    }

    function startHeartbeat() {
      if (iv) return;
      let ticks = 0;
      iv = setInterval(async () => {
        if (cancelled) return;
        ticks += 1;
        try {
          const sdk = await getFarcasterSdk();
          sdk?.actions?.ready?.();
        } catch {}
        try {
          const mk = getMiniKit();
          mk?.setFrameReady?.();
        } catch {}
        if (ticks >= 40) { // ~6s @150ms
          clearInterval(iv!);
          iv = null;
        }
      }, 150);
    }

    fireReadyOnce();
    startHeartbeat();

    const again = () => fireReadyOnce();
    window.addEventListener("pageshow", again);
    window.addEventListener("focus", again);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) fireReadyOnce();
    });

    return () => {
      cancelled = true;
      if (iv) clearInterval(iv);
      window.removeEventListener("pageshow", again);
      window.removeEventListener("focus", again);
      document.removeEventListener("visibilitychange", again);
    };
  }, []);

  return null;
}
