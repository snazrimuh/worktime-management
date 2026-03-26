<template>
  <div class="space-y-1.5 flex-1">
    <label v-if="label" class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
      {{ label }}
    </label>
    <div class="relative group">
      <input
        ref="el"
        v-bind="$attrs"
        :type="type"
        :value="modelValue"
        :disabled="disabled"
        :class="[
          'w-full rounded-xl border bg-white dark:bg-[#1E293B]',
          'border-slate-200 dark:border-white/[0.12]',
          'px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400/50 dark:focus:border-primary-500/40',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
          error ? 'border-rose-500 focus:ring-rose-500/20' : 'group-hover:border-slate-300 dark:group-hover:border-white/20',
          inputClass
        ]"
        @input="onInput"
      />
      <div v-if="error" class="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500">
        <AlertCircle class="w-4 h-4" />
      </div>
    </div>
    <span v-if="error" class="text-[10px] font-bold text-rose-500 ml-2 mt-1 block">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  disabled?: boolean
  error?: string
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  type: 'text',
  disabled: false,
  error: '',
  inputClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>
