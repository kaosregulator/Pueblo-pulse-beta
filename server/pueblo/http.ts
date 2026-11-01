/**
 * Bounded outbound HTTP for the hub: a timeout, a size cap, an identifying
 * User-Agent (api.weather.gov requires one), and errors that say which host
 * failed without leaking query strings that may carry keys.
 */

const USER_AGENT =
  "PuebloPulse/1.0 (+https://github.com/kaosregulator/Pueblo-pulse-beta; community map)";
const TIMEOUT_MS = 20_000;
const MAX_BYTES = 40 * 1024 * 1024;

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "upstream";
  }
}

async function request(url: string, signal: AbortSignal, headers: Record<string, string> = {}) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = AbortSignal.any([signal, timeout]);
  let response: Response;
  try {
    response = await fetch(url, {
      signal: combined,
      headers: { "User-Agent": USER_AGENT, Accept: "application/json, */*", ...headers },
      redirect: "follow",
    });
  } catch (error: any) {
    if (timeout.aborted) throw new Error(`${hostOf(url)} timed out`);
    throw new Error(`${hostOf(url)} unreachable (${error?.cause?.code || error?.name || "network"})`);
  }
  if (!response.ok) throw new Error(`${hostOf(url)} answered HTTP ${response.status}`);
  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_BYTES) throw new Error(`${hostOf(url)} response too large`);
  return response;
}

export async function fetchBytes(
  url: string,
  signal: AbortSignal,
  init: { headers?: Record<string, string> } = {},
): Promise<Uint8Array> {
  const response = await request(url, signal, init.headers);
  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) throw new Error(`${hostOf(url)} response too large`);
  return buffer;
}

export async function fetchJson(
  url: string,
  signal: AbortSignal,
  init: { headers?: Record<string, string> } = {},
): Promise<any> {
  const bytes = await fetchBytes(url, signal, init);
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error(`${hostOf(url)} sent data that is not JSON`);
  }
}
