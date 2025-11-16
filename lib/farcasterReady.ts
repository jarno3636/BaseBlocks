// lib/farcasterReady.ts
type MiniSDKLike = {
  actions?: { ready?: () => Promise<void> | void };
  // some builds expose a function, others a promise/value
  context?: any | (() => any | Promise<any>) | Promise<any>;
};

export async function farcasterReady(): Promise<any | null> {
  try {
    const mod: any = await import("@farcaster/miniapp-sdk");
    // handle different module shapes: { sdk }, default export, or the module itself
    const sdk: MiniSDKLike = (mod?.sdk ?? mod?.default ?? mod) as MiniSDKLike;

    // best-effort “ready” without tripping TS or hanging the build
    await Promise.race([
      Promise.resolve(sdk?.actions?.ready?.()),
      new Promise((r) => setTimeout(r, 800)), // don’t block if host ignores ready()
    ]);

    // normalize context access (function | promise | value)
    const ctx =
      typeof sdk?.context === "function"
        ? await (sdk.context as () => any | Promise<any>)()
        : await (sdk?.context as Promise<any> | any);

    if (ctx) {
      // eslint-disable-next-line no-console
      console.log("✅ MiniApp SDK context:", ctx);
      return ctx;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Farcaster SDK not available:", err);
  }
  return null;
}
