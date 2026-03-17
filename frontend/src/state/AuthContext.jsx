import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../utils/api.js'

const STORAGE_KEY = 'ipt.auth.v1'

const AuthContext = createContext(null)

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? safeJsonParse(raw) : null
    return parsed?.token ? parsed : null
  })

  useEffect(() => {
    setAuthToken(auth?.token || null)
  }, [auth?.token])

  const value = useMemo(() => {
    async function login(role, { email, password }) {
      const path = role === 'manager' ? '/managers/login' : '/interns/login'
      const { data } = await api.post(path, { email, password })
      const next = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setAuth(next)
      return next
    }

    async function register(role, payload) {
      const path = role === 'manager' ? '/managers/register' : '/interns/register'
      const { data } = await api.post(path, payload)
      const next = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setAuth(next)
      return next
    }

    function logout() {
      localStorage.removeItem(STORAGE_KEY)
      setAuth(null)
    }

    return { auth, isAuthed: !!auth?.token, login, register, logout }
  }, [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

