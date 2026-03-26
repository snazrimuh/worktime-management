<template>
  <div
    v-bind="forwardedAttrs"
    :class="[
      'glass rounded-2xl card-hover',
      'shadow-sm dark:shadow-xl dark:shadow-black/20',
      'hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-black/40',
      'transition-all duration-300',
      attrs.class,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>
