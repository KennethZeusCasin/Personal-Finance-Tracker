export const useApi = () => {
  const config = useRuntimeConfig()
  // Server-side requests must explicitly forward the incoming session cookie.
  const requestHeaders = useRequestHeaders(['cookie'])

  const apiFetch = async <T>(
    endpoint: string,
    options: Parameters<typeof $fetch<T>>[1] = {}
  ) => {
    const headers = new Headers(requestHeaders)
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value)
    })

    return await $fetch<T>(
      `${config.public.apiBaseUrl}${endpoint}`,
      {
        ...options,
        headers,
        credentials: 'include'
      }
    )
  }

  return {
    apiFetch
  }
}
