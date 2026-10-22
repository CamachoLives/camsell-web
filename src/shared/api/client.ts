import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

import { getAccessToken, notifyUnauthorized } from './session'

/** Campo invalido reportado por la validacion del backend. */
export interface FieldIssue {
  field: string
  message: string
}

/** Forma de `ProblemDetail` (RFC 9457) que devuelve camsell-api. */
interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  code?: string
  errors?: FieldIssue[]
}

/**
 * Error normalizado de la API. La interfaz reacciona a `code`, que es estable,
 * en lugar de interpretar el texto del mensaje.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldIssues: FieldIssue[]

  constructor(message: string, status: number, code: string, fieldIssues: FieldIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldIssues = fieldIssues
  }

  get isValidation(): boolean {
    return this.code === 'invalid_payload' || this.fieldIssues.length > 0
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetail>) => {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Promise.reject(
        new ApiError('La petición tardó demasiado. Revisa tu conexión.', 0, 'timeout'),
      )
    }

    if (!error.response) {
      return Promise.reject(
        new ApiError(
          'No pudimos contactar el servidor. Verifica que el backend esté corriendo.',
          0,
          'network_error',
        ),
      )
    }

    const { status, data } = error.response
    if (status === 401) {
      notifyUnauthorized()
    }

    const message =
      data?.detail ?? data?.title ?? error.message ?? 'Ocurrió un error procesando la petición'

    return Promise.reject(
      new ApiError(message, status, data?.code ?? `http_${status}`, data?.errors ?? []),
    )
  },
)

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await http.get<T>(url, config)
  return data
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.post<T>(url, body, config)
  return data
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.put<T>(url, body, config)
  return data
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await http.patch<T>(url, body, config)
  return data
}

export async function apiDelete(url: string, config?: AxiosRequestConfig): Promise<void> {
  await http.delete(url, config)
}

export { http }
