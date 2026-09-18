export default defineNuxtRouteMiddleware(async () => {
  const { user, me } = useAuth()

  if (user.value) {
    return
  }

  try {
    await me()
  } catch (error) {
    console.error('Auth middleware error:', error)

    return navigateTo('/login')
  }
})