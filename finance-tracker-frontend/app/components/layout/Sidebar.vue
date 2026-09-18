<script setup lang="ts">
  const route = useRoute()
  const { logout } = useAuth()
  const isLoggingOut = ref(false)

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return route.path === '/dashboard'
    }

    return route.path.startsWith(path)
  }

  const handleLogout = async () => {
    if (isLoggingOut.value) return

    isLoggingOut.value = true

    try {
      await logout()
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      isLoggingOut.value = false
    }
  }
</script>
<template>
  <aside
    class="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:block"
  >
    <div class="flex h-full flex-col">
      <!-- Logo -->
      <div class="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 class="text-xl font-bold text-gray-900">
          Finance Tracker
        </h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 px-4 py-6">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition"
          :class="
            isActive('/dashboard')
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          "
        >
          <span>📊</span>
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/accounts"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition"
          :class="
            isActive('/accounts')
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          "
        >
          <span>💳</span>
          Accounts
        </NuxtLink>

        <NuxtLink
          to="/categories"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition"
          :class="
            isActive('/categories')
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          "
        >
          <span>🏷️</span>
          Categories
        </NuxtLink>

        <NuxtLink
          to="/transactions"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition"
          :class="
            isActive('/transactions')
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          "
        >
          <span>💸</span>
          Transactions
        </NuxtLink>
      </nav>

      <!-- Bottom -->
      <div class="border-t border-gray-200 p-4">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <span>⚙️</span>
          Settings
        </button>

        <UButton
          type="button"
          color="error"
          variant="ghost"
          class="mt-1 flex w-full items-center justify-start gap-3 px-4 py-3 text-sm font-medium"
          @click="handleLogout"
        >
          Logout
        </UButton>
      </div>
    </div>
  </aside>
</template>