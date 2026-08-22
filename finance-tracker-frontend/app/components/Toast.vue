<script setup lang="ts">
defineProps<{
  message: string
  type?: 'error' | 'success'
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      class="fixed right-5 top-5 z-50 flex w-96 items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg"
    >
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
      >
        !
      </div>

      <p class="flex-1 text-sm font-medium text-gray-700">
        {{ message }}
      </p>

      <button
        type="button"
        class="text-gray-400 hover:text-gray-600"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>