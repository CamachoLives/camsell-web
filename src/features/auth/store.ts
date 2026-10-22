import { create } from 'zustand'

import { authApi, type LoginInput, type RegisterInput } from '@/features/auth/api'
import { setAccessToken, setUnauthorizedHandler } from '@/shared/api/session'
import type { Session, User } from '@/shared/api/types'

const STORAGE_KEY = 'camsell.session'

interface PersistedSession {
  accessToken: string
  expiresAt: number
  user: User
}

function readPersisted(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as PersistedSession
    // Una sesion vencida se descarta en el arranque, sin esperar un 401.
    if (!parsed.accessToken || parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function persist(session: PersistedSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Sin almacenamiento la sesion dura lo que dure la pestania.
  }
}

interface AuthState {
  user: User | null
  initializing: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  refreshProfile: () => Promise<void>
  setUser: (user: User) => void
}

const initial = readPersisted()
setAccessToken(initial?.accessToken ?? null)

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial?.user ?? null,
  initializing: Boolean(initial),

  login: async (input) => {
    const session = await authApi.login(input)
    applySession(session, set)
    return session.user
  },

  register: async (input) => {
    const session = await authApi.register(input)
    applySession(session, set)
    return session.user
  },

  logout: () => {
    setAccessToken(null)
    persist(null)
    set({ user: null, initializing: false })
  },

  /**
   * Revalida el perfil contra el backend al arrancar: el token guardado puede
   * seguir vigente pero el rol o los datos pueden haber cambiado.
   */
  refreshProfile: async () => {
    if (!initial) {
      set({ initializing: false })
      return
    }
    try {
      const user = await authApi.me()
      set({ user, initializing: false })
      persist({ ...initial, user })
    } catch {
      get().logout()
    }
  },

  setUser: (user) => {
    set({ user })
    const current = readPersisted()
    if (current) {
      persist({ ...current, user })
    }
  },
}))

function applySession(session: Session, set: (partial: Partial<AuthState>) => void): void {
  setAccessToken(session.accessToken)
  persist({
    accessToken: session.accessToken,
    expiresAt: Date.now() + session.expiresIn * 1000,
    user: session.user,
  })
  set({ user: session.user, initializing: false })
}

// Un 401 del backend cierra la sesion local: el token ya no sirve.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout()
})

/** Atajos de lectura usados en la interfaz. */
export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ADMIN')
