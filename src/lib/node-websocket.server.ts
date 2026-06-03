let nodeWebSocketReady: Promise<void> | undefined;

type RuntimeProcess = {
  versions?: {
    node?: string;
  };
};

function getNodeMajorVersion(): number | null {
  const runtime = globalThis as typeof globalThis & { process?: RuntimeProcess };
  const version = runtime.process?.versions?.node;
  if (!version) return null;

  const major = Number.parseInt(version.replace(/^v/, "").split(".")[0] ?? "", 10);
  return Number.isFinite(major) ? major : null;
}

export function ensureNodeWebSocketSupport(): Promise<void> {
  if (typeof globalThis.WebSocket !== "undefined") {
    return Promise.resolve();
  }

  const nodeMajor = getNodeMajorVersion();
  if (!nodeMajor || nodeMajor >= 22) {
    return Promise.resolve();
  }

  nodeWebSocketReady ??= import("ws")
    .then(({ default: WebSocket }) => {
      if (typeof globalThis.WebSocket === "undefined") {
        (globalThis as typeof globalThis & { WebSocket: typeof globalThis.WebSocket }).WebSocket =
          WebSocket as unknown as typeof globalThis.WebSocket;
      }
    })
    .catch((error) => {
      console.error("[server] failed to install Node WebSocket transport", error);
    });

  return nodeWebSocketReady;
}