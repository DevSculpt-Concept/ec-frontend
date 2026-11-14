import {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  removeAuthToken,
} from "@/config/api";

/** e.g. https://ec.devsculptlimited.com/api/v1 */
export const API_URL: string = (
  import.meta.env.VITE_API_URL || "https://ec.devsculptlimited.com/api/v1"
).replace(/\/+$/, "");

/** Origin that serves the API, Socket.IO and /uploads (API_URL without the /api/v1 suffix). */
export const API_ORIGIN: string = API_URL.replace(/\/api(\/v\d+)?$/, "");

export const AUTH_LOGOUT_EVENT = "auth:logout";

export interface ApiEnvelope<T = unknown> {
  status: string;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
  [key: string]: unknown;
}

export class HttpError extends Error {
  status: number;
  errors?: unknown;
  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown; // object → JSON, FormData → multipart
  auth?: boolean; // attach bearer token (default true)
  signal?: AbortSignal;
}

export function buildQuery(query?: Query): string {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

let refreshing: Promise<boolean> | null = null;

/** Exchange the refresh token for a new session. Concurrent callers share one request. */
async function refreshSession(): Promise<boolean> {
  if (refreshing) return refreshing;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  refreshing = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const json = (await res.json()) as ApiEnvelope<{ session: { accessToken: string; refreshToken: string } }>;
      const s = json.data?.session;
      if (!s?.accessToken) return false;
      setAuthToken(s.accessToken);
      setRefreshToken(s.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => (refreshing = null), 0);
    }
  })();
  return refreshing;
}

function forceLogout() {
  removeAuthToken();
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

async function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (opts.body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (opts.auth !== false) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${API_URL}${path}${buildQuery(opts.query)}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    signal: opts.signal,
  });
}

/** Typed request helper. Returns the full `{status,message,data,...}` envelope; throws HttpError on failure. */
export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await send(path, opts);
  } catch {
    throw new HttpError("Unable to reach the server. Please check your connection and try again.", 0);
  }

  if (res.status === 401 && opts.auth !== false && getRefreshToken()) {
    if (await refreshSession()) {
      res = await send(path, opts);
    } else {
      forceLogout();
    }
  } else if (res.status === 401 && opts.auth !== false && getAuthToken()) {
    forceLogout();
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    const errs = (json as { errors?: unknown } | null)?.errors;
    let message = json?.message || `Request failed (${res.status})`;
    if (Array.isArray(errs) && errs.length && typeof errs[0] === "string") message = errs[0] as string;
    throw new HttpError(message, res.status, errs);
  }
  return (json ?? { status: "success", message: "", data: null as T }) as ApiEnvelope<T>;
}

export const http = {
  get: <T = unknown>(path: string, query?: Query, o: Omit<RequestOptions, "method" | "query" | "body"> = {}) =>
    request<T>(path, { ...o, method: "GET", query }),
  post: <T = unknown>(path: string, body?: unknown, o: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...o, method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown, o: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...o, method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: unknown, o: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...o, method: "PATCH", body }),
  delete: <T = unknown>(path: string, body?: unknown, o: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...o, method: "DELETE", body }),
};
