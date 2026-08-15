<script setup lang="ts">
const { user, getCurrentUser } = useAuth()

onMounted(async () => {
  await getCurrentUser()

  if (!user.value) {
    await navigateTo('/login')
  }
})
</script>

<template>
  <div>
    <h1>Dashboard</h1>

    <div v-if="user">
      <h2>Welcome, {{ user.name }}!</h2>

      <p>Email: {{ user.email }}</p>
    </div>
  </div>
</template>