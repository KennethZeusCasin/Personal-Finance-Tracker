<template>
  <div class="min-h-screen bg-gray-100">
    <LayoutSidebar />

    <div class="lg:pl-64">
      <LayoutHeader :title="pageTitle" />

      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  const route = useRoute()

  const pageTitle = computed(() => {
    if (route.path === '/dashboard') {
      return 'Dashboard'
    }

    if (route.path.startsWith('/accounts')) {
      return 'Accounts'
    }

    if (route.path.startsWith('/categories')) {
      return 'Categories'
    }

    if (route.path.startsWith('/transactions')) {
      return 'Transactions'
    }

    return 'Finance Tracker'
  })
</script>