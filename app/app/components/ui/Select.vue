<template>
  <div class="space-y-1.5 flex-1">
    <label v-if="label" class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
      {{ label }}
    </label>
    <div class="relative group">
      <select
        v-bind="$attrs"
        :value="modelValue"
        :disabled="disabled"
        :class="[
          'w-full cursor-pointer rounded-xl border appearance-none transition-all duration-200',
          'bg-white dark:bg-[#1E293B]',
          'border-slate-200 dark:border-white/[0.12]',
          'px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400/50 dark:focus:border-primary-500/40',
          'disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-slate-300 dark:group-hover:border-white/20',
          error ? 'border-rose-500 focus:ring-rose-500/20' : '',
          selectClass
        ]"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          class="dark:bg-[#1E293B] font-medium"
        >
          {{ opt.label }}
        </option>
        <slot />
      </select>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
        <ChevronDown class="w-4 h-4" />
      </div>
    </div>
    <span v-if="error" class="text-[10px] font-bold text-rose-500 ml-2 mt-1 block">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number
  options?: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  selectClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  label: '',
  placeholder: '',
  disabled: false,
  error: '',
  selectClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = typeof props.modelValue === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<style scoped>
/* Remove default arrow for modern browsers */
select::-ms-expand {
  display: none;
}
</style>
