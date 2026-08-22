<script setup lang="ts">
withDefaults(
    defineProps<{
        show: boolean
        message?: string
    }>(),
    {
        message: 'Loading...'
    }
)
</script>

<template>
    <Teleport to="body">
        <div
            v-if="show"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            <div
                class="flex min-w-[180px] flex-col items-center gap-4 rounded-xl bg-white px-8 py-6 shadow-xl"
            >
                <!-- Spinner -->
                <div
                    class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
                ></div>

                <p class="text-sm font-medium text-gray-700">
                    {{ message }}
                </p>
            </div>
        </div>
    </Teleport>
</template>