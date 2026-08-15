<script setup lang="ts">
const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')

const { login } = useAuth()

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await login(email.value, password.value)

    await navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ?? 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">
            Welcome Back
          </h1>

          <p class="mt-1 text-sm text-muted">
            Sign in to your Personal Finance Tracker
          </p>
        </div>
      </template>

      <form class="space-y-5" @submit.prevent="handleLogin">

        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            icon="i-lucide-mail"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
        >
          <UInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            icon="i-lucide-lock"
            class="w-full"
            required
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
        />

        <UButton
          type="submit"
          label="Login"
          class="w-full justify-center"
          :loading="loading"
          :disabled="loading"
        />
      </form>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Don't have an account?
          <NuxtLink
            to="/register"
            class="text-primary font-medium hover:underline"
          >
            Create an account
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>