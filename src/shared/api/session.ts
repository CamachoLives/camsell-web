/**
 * Puente entre el cliente HTTP y la sesion. Vive aparte del store de
 * autenticacion para que el interceptor de axios no importe ese store y se
 * genere una dependencia circular.
 */

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

/** Registra que hacer cuando el backend responde 401 con sesion vencida. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

export function notifyUnauthorized(): void {
  onUnauthorized?.()
}
