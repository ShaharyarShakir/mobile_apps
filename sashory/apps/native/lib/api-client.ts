import { env } from "@sashory/env/native";
import type { AppType } from "@sashory/server";
import { hc } from "hono/client";
import { authClient } from "@/lib/auth-client";

export const api = hc<AppType>(env.EXPO_PUBLIC_SERVER_URL, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const cookie = await authClient.getCookie();

    const headers = new Headers(init?.headers);

    headers.set("Content-Type", "application/json");

    if (cookie) {
      headers.set("Cookie", cookie);
    }

    return fetch(input, {
      ...init,
      headers,
      credentials: "omit",
    });
  },
});

export type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function getApiError(response: {
  status: number;
  json: () => Promise<unknown>;
}): Promise<ApiRequestError> {
  let errorData: ApiErrorResponse | undefined;

  try {
    errorData = (await response.json()) as ApiErrorResponse;
  } catch {
    // Response was not JSON.
  }

  return new ApiRequestError(
    errorData?.error?.message ?? `Request failed with ${response.status}`,
    response.status,
    errorData?.error?.code,
  );
}

