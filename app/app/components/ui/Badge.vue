<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full whitespace-nowrap',
      sizeClasses,
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'todo' | 'progress' | 'review' | 'done'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default:   'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300',
    secondary: 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500',
    success:   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning:   'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger:    'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    info:      'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    todo:      'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400',
    progress:  'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
    review:    'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    done:      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1 text-[11px] leading-none',
    md: 'px-3 py-1 text-xs leading-none',
  }
  return sizes[props.size]
})
</script>
