import { config } from '@/shared/config';
import { currentLanguage, i18n } from '@/shared/i18n';

/** 422 field errors from Laravel: `{ "email": ["The email field is required."] }`. */
export type FieldErrors = Record<string, string[]>;

type ApiErrorInit = {
  status: number;
  message: string;
  code: string;
  errors?: FieldErrors;
};

/**
 * Every failed request ends up as this one error, shaped like the backend error body
 * `{ message, code, errors }`. `message` is already translated by the backend: show it as is.
 */
export class ApiError extends Error {
  /** HTTP status; `0` when no response arrived (offline, DNS, CORS). */
  readonly status: number;
  /** Backend error code: `validation_failed`, `invalid_credentials`, `unauthenticated`... */
  readonly code: string;
  /** Field errors, only filled on 422. */
  readonly errors: FieldErrors;

  constructor({ status, message, code, errors = {} }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  /** Query string; `null`, `undefined` and `''` values are left out. */
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const apiPrefix = '/api/v1';

/** Used when the error body has no `code` (proxy errors, HTML error pages). */
const codeByStatus: Record<number, string> = {
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not_found',
  422: 'validation_failed',
  429: 'too_many_requests',
};

function buildUrl(path: string, query: RequestOptions['query'] = {}): URL {
  // Always absolute: the browser would accept a relative URL, but fetch in Node (tests) would not.
  const url = new URL(`${config.apiUrl}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const cookie = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return cookie === undefined ? undefined : decodeURIComponent(cookie.slice(prefix.length));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldErrors(value: unknown): value is FieldErrors {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (messages) => Array.isArray(messages) && messages.every((item) => typeof item === 'string'),
    )
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readJson(response);
  const { message, code, errors } = isRecord(body) ? body : {};

  return new ApiError({
    status: response.status,
    message: typeof message === 'string' && message !== '' ? message : i18n.t('errors.generic'),
    code: typeof code === 'string' ? code : (codeByStatus[response.status] ?? 'server_error'),
    errors: isFieldErrors(errors) ? errors : {},
  });
}

async function send<T>(
  method: Method,
  path: string,
  body: unknown,
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
    'Accept-Language': currentLanguage(),
  });
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  // Sanctum SPA auth: echo the XSRF-TOKEN cookie on every request that changes something.
  const xsrfToken = method === 'GET' ? undefined : readCookie('XSRF-TOKEN');
  if (xsrfToken !== undefined) {
    headers.set('X-XSRF-TOKEN', xsrfToken);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal: options.signal,
    });
  } catch (error) {
    // A cancelled request is not a failure: let TanStack Query see the AbortError.
    if (options.signal?.aborted) throw error;
    throw new ApiError({ status: 0, code: 'network_error', message: i18n.t('errors.network') });
  }

  // 419: the CSRF token expired (for example a tab left open for hours). Refresh it and retry once.
  if (response.status === 419 && !isRetry) {
    await fetchCsrfCookie();
    return send<T>(method, path, body, options, true);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await readJson(response);
  if (data === undefined) {
    throw new ApiError({
      status: response.status,
      code: 'invalid_response',
      message: i18n.t('errors.generic'),
    });
  }
  return data as T;
}

/** Sets the `XSRF-TOKEN` cookie. Call it before logging in (Sanctum SPA auth). */
export async function fetchCsrfCookie(): Promise<void> {
  await send<void>('GET', '/sanctum/csrf-cookie', undefined, {});
}

/**
 * The only way the app talks to the API. Paths are relative to `/api/v1`:
 * `api.get<Paginated<Item>>('/items', { query: { page: 2 } })`.
 */
export const api = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    send<T>('GET', `${apiPrefix}${path}`, undefined, options),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>('POST', `${apiPrefix}${path}`, body, options),
  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>('PUT', `${apiPrefix}${path}`, body, options),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    send<T>('PATCH', `${apiPrefix}${path}`, body, options),
  delete: <T>(path: string, options: RequestOptions = {}) =>
    send<T>('DELETE', `${apiPrefix}${path}`, undefined, options),
};
