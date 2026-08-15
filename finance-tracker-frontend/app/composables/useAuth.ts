export const useAuth = () => {
  const api = useApi()

  const login = async (email: string, password: string) => {
    return await api('/auth/login', {
      method: 'POST',
      body: {
        email,
        password
      }
    })
  }

  const logout = async () => {
    await api('/auth/logout', {
      method: 'POST'
    })
  }

  const me = async () => {
    return await api('/auth/me', {
      method: 'GET'
    })
  }

  return {
    login,
    logout,
    me
  }
}