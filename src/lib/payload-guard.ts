const MAX_PAYLOAD_BYTES = 8_192;
const MAX_COLLECTION_LENGTH = 64;
const MAX_DEPTH = 16;
const MAX_NODES = 256;

interface ValidationState {
  nodes: number;
}

function isSafeDeserializedStructure(
  value: unknown,
  depth = 0,
  state: ValidationState = { nodes: 0 },
): boolean {
  if (depth > MAX_DEPTH) return false;
  state.nodes += 1;
  if (state.nodes > MAX_NODES) return false;

  if (value === null || typeof value !== "object") {
    return true;
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_COLLECTION_LENGTH) return false;
    for (let i = 0; i < value.length; i += 1) {
      if (!isSafeDeserializedStructure(value[i], depth + 1, state)) return false;
    }
    return true;
  }

  const record = value as Record<string, unknown>;

  // Reject array-like objects that spoof `.length` in place of real Array containers (CWE-400)
  if ("length" in record) {
    return false;
  }

  // Validate Seroval array/collection item containers (`a`) and declared sizes (`l`, `s`)
  if ("a" in record && record.a !== undefined && !Array.isArray(record.a)) {
    return false;
  }
  if ("l" in record && record.l !== undefined) {
    if (
      typeof record.l !== "number" ||
      !Number.isInteger(record.l) ||
      record.l < 0 ||
      record.l > MAX_COLLECTION_LENGTH
    ) {
      return false;
    }
  }

  const keys = Object.keys(record);
  if (keys.length > MAX_COLLECTION_LENGTH) return false;

  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i]!;
    if (k === "__proto__" || k === "constructor" || k === "prototype") {
      return false;
    }
    if (!isSafeDeserializedStructure(record[k], depth + 1, state)) {
      return false;
    }
  }

  return true;
}

export function isSafeSerializedPayload(raw: string): boolean {
  if (raw.length > MAX_PAYLOAD_BYTES) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSafeDeserializedStructure(parsed);
  } catch {
    return false;
  }
}

export async function validateServerFunctionRequest(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);
  const queryPayload = url.searchParams.get("payload");

  if (queryPayload !== null && !isSafeSerializedPayload(queryPayload)) {
    return new Response(
      JSON.stringify({ error: "Invalid or oversized serialized payload" }),
      {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }

  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    url.pathname.includes("_server")
  ) {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({ error: "Payload too large" }),
        {
          status: 413,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const bodyText = await request.clone().text();
      if (bodyText.length > 0 && !isSafeSerializedPayload(bodyText)) {
        return new Response(
          JSON.stringify({ error: "Invalid or oversized serialized payload" }),
          {
            status: 400,
            headers: { "content-type": "application/json; charset=utf-8" },
          },
        );
      }
    }
  }

  return null;
}
