export type Kpi = { label: string; value: number; suffix: string; tone: string };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(path, { ...init, signal: controller.signal });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(body || `${init?.method ?? "GET"} ${path} failed with ${response.status}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out: ${path}`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Could not reach the API for ${path}. Start Aashi Dreams with START.bat or npm run dev.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return requestJson<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
