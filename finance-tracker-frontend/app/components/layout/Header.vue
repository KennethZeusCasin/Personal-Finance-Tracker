<script setup lang="ts">
  defineProps<{
    title: string
  }>()

  const { user } = useAuth()
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-gray-200 bg-white">
    <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ title }}
      </h2>

      <div class="flex items-center gap-3">
        <button
          class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
        >
          🔔
        </button>

        <div class="flex items-center gap-3">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
          >
           {{ user?.name?.charAt(0).toUpperCase() ?? 'U' }}
          </div>

          <div class="hidden sm:block">
            <p class="text-sm font-medium text-gray-900">
              {{ user?.name ?? 'User' }}
            </p>

            <p class="text-xs text-gray-500">
              Personal Account
            </p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>