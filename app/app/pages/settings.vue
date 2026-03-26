<template>
  <div class="space-y-5">
    <UiCard class="p-5">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">System Settings</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Basic platform configuration for notifications and governance.</p>
    </UiCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <UiCard class="p-4 space-y-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Notification Preferences</h2>
        <label class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>Maintenance due alerts</span>
          <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-[#415A77]" />
        </label>
        <label class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>Incident escalation alerts</span>
          <input type="checkbox" checked class="h-4 w-4 rounded border-slate-300 text-[#415A77]" />
        </label>
        <label class="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>Warranty expiry reminders</span>
          <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-[#415A77]" />
        </label>
      </UiCard>

      <UiCard class="p-4 space-y-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Asset Governance</h2>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Default lifecycle stage after procurement</p>
          <UiSelect model-value="Registered">
            <option>Registered</option>
            <option>Assigned</option>
          </UiSelect>
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Auto-close resolved incidents after</p>
          <UiSelect model-value="7 days">
            <option>3 days</option>
            <option>7 days</option>
            <option>14 days</option>
          </UiSelect>
        </div>
        <UiButton size="sm" class="w-fit">Save Settings</UiButton>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
