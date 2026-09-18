interface AuthUser {
  id: number
  name: string
  email: string
  createdAt?: string
}

interface AuthResponse {
  success: boolean
  data: AuthUser
}

export const useAuth = () => {
  const { apiFetch } = useApi()

  const user = useState<AuthUser | null>('auth-user', () => null)

  const login = async (email: string, password: string) => {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    })

    user.value = response.data

    return response
  }

  const logout = async () => {
    await apiFetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    user.value = null
  }

  const me = async () => {
    const response = await apiFetch<AuthResponse>('/auth/me', {
      method: 'GET'
    })

    user.value = response.data

    return response
  }

  return {
    user,
    login,
    logout,
    me
  }
}