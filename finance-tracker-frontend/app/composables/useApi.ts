export const useApi = () => {
  const config = useRuntimeConfig()

  const apiFetch = async <T>(
    endpoint : string,
    options : Parameters<typeof $fetch<T>>[1] = {}
  ) => {
    return await $fetch<T>(
      `${config.public.apiBaseUrl}${endpoint}`,
      {
        ...options,
        credentials : 'include'
      }
    )
  }

  return {
    apiFetch
  }
}