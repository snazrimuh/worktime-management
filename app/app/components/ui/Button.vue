<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none',
      sizeClasses,
      variantClasses,
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary:   'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 active:shadow-inner font-semibold',
    secondary: 'bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/[0.12] active:bg-slate-300 dark:active:bg-white/[0.16] shadow-sm',
    outline:   'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.05] active:bg-slate-100 dark:active:bg-white/[0.08] shadow-sm',
    ghost:     'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] active:bg-slate-200 dark:active:bg-white/[0.12]',
    danger:    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 font-semibold',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'text-sm px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  }
  return sizes[props.size]
})
</script>
