<script setup lang="ts">
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    }
  ],
  link: [
    {
      rel: 'icon',
      href: '/favicon.ico'
    }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Personal Finance Tracker'
const description = 'Manage your personal finances with ease.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>