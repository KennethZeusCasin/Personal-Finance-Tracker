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
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <span>📊</span>
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/accounts"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <span>💳</span>
          Accounts
        </NuxtLink>

        <NuxtLink
          to="/categories"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <span>🏷️</span>
          Categories
        </NuxtLink>

        <NuxtLink
          to="/transactions"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
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

        <button
          class="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  </aside>
</template>