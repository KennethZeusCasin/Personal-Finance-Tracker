<script setup lang="ts">
const apiMessage = ref('')
const apiLoading = ref(false)
const apiError = ref('')

const testApi = async () => {
  apiLoading.value = true
  apiError.value = ''
  apiMessage.value = ''

  try {
    const config = useRuntimeConfig()

    const response = await $fetch('/health', {
      baseURL: config.public.apiBaseUrl
    })

    apiMessage.value = response.message
  } catch (error) {
    apiError.value = 'Unable to connect to the backend.'
    console.error(error)
  } finally {
    apiLoading.value = false
  }
}
</script>

<template>
  <div>
    <h1>Personal Finance Login</h1>

    <button
      @click="testApi"
      :disabled="apiLoading"
    >
      {{ apiLoading ? 'Connecting...' : 'Test Backend' }}
    </button>

    <p v-if="apiMessage">
      {{ apiMessage }}
    </p>

    <p v-if="apiError">
      {{ apiError }}
    </p>
  </div>
</template>