export const useAuth = () => {
  const { apiFetch } = useApi()

  const login = async (email: string, password: string) => {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    })
  }

  const logout = async () => {
    await apiFetch('/auth/logout', {
      method: 'POST'
    })
  }

  const me = async () => {
    return await apiFetch('/auth/me', {
      method: 'GET'
    })
  }

  return {
    login,
    logout,
    me
  }
}