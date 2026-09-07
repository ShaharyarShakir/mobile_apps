export type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type ApiResponseLike = {
  status?: number;
  json: () => Promise<unknown>;
};

export async function getApiErrorMessage(
  response: ApiResponseLike,
  fallback: string,
) {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    return body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

