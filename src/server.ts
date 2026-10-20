import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { validateServerFunctionRequest } from "./lib/payload-guard";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleSupabaseProxy(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/supabase-proxy/")) return null;

  const targetBase = (
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    ""
  ).replace(/\/+$/, "");
  const apiKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    "";

  if (!targetBase || !apiKey) {
    return new Response(
      JSON.stringify({ message: "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY on server" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const subPath = url.pathname.slice("/api/supabase-proxy".length) + url.search;
  const targetUrl = `${targetBase}${subPath}`;

  const headers = new Headers();
  const forwardHeaders = [
    "accept",
    "accept-profile",
    "authorization",
    "content-profile",
    "content-type",
    "prefer",
    "range",
    "x-client-info",
    "x-supabase-api-version",
  ];
  for (const name of forwardHeaders) {
    const val = request.headers.get(name);
    if (val) headers.set(name, val);
  }

  if (
    (apiKey.startsWith("sb_publishable_") || apiKey.startsWith("sb_secret_")) &&
    headers.get("authorization") === `Bearer ${apiKey}`
  ) {
    headers.delete("authorization");
  }
  headers.set("apikey", apiKey);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k !== "content-encoding" && k !== "transfer-encoding" && k !== "content-length") {
      resHeaders.set(key, value);
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const proxied = await handleSupabaseProxy(request);
      if (proxied) return proxied;

      const rejected = await validateServerFunctionRequest(request);
      if (rejected) return rejected;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
