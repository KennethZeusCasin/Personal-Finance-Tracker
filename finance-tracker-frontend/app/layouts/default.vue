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
  switch (route.path) {
    case '/dashboard':
      return 'Dashboard'
    case '/accounts':
      return 'Accounts'
    case '/categories':
      return 'Categories'
    case '/transactions':
      return 'Transactions'
    default:
      return 'Finance Tracker'
  }
})
</script>