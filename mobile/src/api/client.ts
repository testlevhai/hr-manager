import { STRINGS } from '@/constants/strings';
import {
  BEARER_PREFIX,
  CONTENT_TYPE_JSON,
  HTTP_HEADER,
  HTTP_METHOD,
} from '@/constants/http';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ErrorBody = {
  error?: {
    message?: string;
  };
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export const apiRequest = async <TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> => {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers[HTTP_HEADER.CONTENT_TYPE] = CONTENT_TYPE_JSON;
  }
  if (options.token) {
    headers[HTTP_HEADER.AUTHORIZATION] = `${BEARER_PREFIX}${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? HTTP_METHOD.GET,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(response.status, body?.error?.message ?? STRINGS.REQUEST_FAILED);
  }

  return (await response.json()) as TResponse;
};
