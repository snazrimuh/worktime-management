<template>
  <div class="mb-6 md:mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {{ title }}
        </h1>
        <p v-if="description" class="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
