<template>
  <div>
    <UiPageHeader
      title="User Management"
      description="Manage application users, assign roles, and control system access."
    >
      <template #actions v-if="canManageUsers">
        <UiButton @click="openAssignModal">
          <UserPlus class="w-4 h-4 mr-2" />
          Assign User
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="space-y-6">
      <!-- Toolbar -->
      <UiCard class="p-4 border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or email..."
              class="h-10 w-full rounded-xl border-none bg-slate-50 dark:bg-white/[0.04] pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
             <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Role:</span>
             <UiSelect v-model="roleFilter" class="h-10 text-sm">
               <option value="ALL">All Roles</option>
               <option value="ADMIN">Admin</option>
               <option value="MANAGER">Manager</option>
               <option value="EMPLOYEE">Employee</option>
             </UiSelect>
          </div>
        </div>
        <p v-if="errorMessage" class="mt-3 text-xs font-medium text-rose-500">{{ errorMessage }}</p>
      </UiCard>

      <!-- Users Table -->
      <UiCard class="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Employee</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Access Role</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 text-center">System Admin</th>
                <th class="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Joined Date</th>
                <th class="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-white/[0.03]">
              <tr v-if="isLoading">
                <td colspan="5" class="px-6 py-16 text-center text-slate-400 dark:text-slate-500 font-medium">Loading user database...</td>
              </tr>
              <tr v-else-if="!filteredUsers.length">
                <td colspan="5" class="px-6 py-16 text-center text-slate-400 dark:text-slate-500 font-medium italic">No users found matching your search.</td>
              </tr>
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :name="user.name" size="sm" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white leading-tight">{{ user.name }}</span>
                      <span class="text-[11px] text-slate-400">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <UiBadge variant="secondary" class="font-bold text-[10px]">{{ roleLabel(user.role) }}</UiBadge>
                </td>
                <td class="px-6 py-4 text-center">
                  <UiBadge :variant="user.isSystemAdmin ? 'success' : 'secondary'" class="font-bold text-[10px] min-w-[50px] justify-center">
                    {{ user.isSystemAdmin ? 'Full Access' : 'Restricted' }}
                  </UiBadge>
                </td>
                <td class="px-6 py-4 text-slate-500 font-medium">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div v-if="canManageUsers" class="flex items-center justify-end gap-1">
                    <button class="p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.08] text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all shadow-none hover:shadow-sm" title="Edit Role" @click="openEditModal(user)">
                      <Pencil class="w-4.5 h-4.5" />
                    </button>
                    <button class="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all" title="Demote to Employee" @click="setEmployeeRole(user)">
                      <UserMinus class="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- Modals skipped for brevity but would follow same modal style -->
    <UiModal v-model="isAssignModalOpen" :title="isEditMode ? 'Edit User Role' : 'Assign User Role'" size="md">
      <div class="space-y-6">
        <div class="space-y-2">
           <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Select Employee</label>
           <UiSelect v-model="selectedUserId" :disabled="isEditMode">
             <option value="">Choose an account...</option>
             <option v-for="user in modalUsers" :key="`assign-${user.id}`" :value="user.id">
               {{ user.name }} ({{ user.email }})
             </option>
           </UiSelect>
        </div>

        <div class="space-y-2">
           <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Assign Access Role</label>
           <UiSelect v-model="selectedRole">
             <option value="" disabled>Choose role...</option>
             <option value="ADMIN">Administrator</option>
             <option value="MANAGER">Manager</option>
             <option value="EMPLOYEE">Employee</option>
           </UiSelect>
        </div>

        <p v-if="modalError" class="text-xs font-medium text-rose-500 text-center">{{ modalError }}</p>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-white/[0.05]">
          <UiButton variant="outline" @click="closeAssignModal" class="px-6">Cancel</UiButton>
          <UiButton :disabled="!canAssign" :loading="isSaving" @click="saveRole" class="px-8">{{ isEditMode ? 'Save Changes' : 'Assign Role' }}</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Pencil, UserMinus, UserPlus, Search } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  isSystemAdmin: boolean
  createdAt: string
}

const api = useApi()
const authStore = useAuthStore()

const users = ref<ManagedUser[]>([])
const assignableUsers = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const isAssignModalOpen = ref(false)
const selectedUserId = ref('')
const selectedRole = ref<'' | UserRole>('')
const isEditMode = ref(false)
const modalError = ref('')
const searchQuery = ref('')
const roleFilter = ref<'ALL' | UserRole>('ALL')

const canManageUsers = computed(() => authStore.user?.isSystemAdmin || authStore.user?.role === 'ADMIN')

const filteredUsers = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  return users.value.filter((user) => {
    const roleMatch = roleFilter.value === 'ALL' || user.role === roleFilter.value
    const kwMatch = !keyword || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword)
    return roleMatch && kwMatch
  })
})

const modalUsers = computed(() => isEditMode.value ? users.value.filter(u => u.id === selectedUserId.value) : assignableUsers.value)
const canAssign = computed(() => Boolean(selectedUserId.value && selectedRole.value && canManageUsers.value))

const roleLabel = (role: UserRole) => {
  if (role === 'MANAGER') return 'Manager'
  if (role === 'ADMIN') return 'Admin'
  return 'Employee'
}

const formatDate = (value: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fetchUsers = async () => {
  if (!canManageUsers.value) return
  isLoading.value = true
  try {
    const res = await api.get<any>('/users')
    users.value = (res as any)?.data ?? res ?? []
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Failed to load users.'
  } finally {
    isLoading.value = false
  }
}

const fetchAssignableUsers = async () => {
  try {
    const res = await api.get<any>('/users/assignable')
    assignableUsers.value = (res as any)?.data ?? res ?? []
  } catch {
    assignableUsers.value = []
  }
}

const closeAssignModal = () => {
  isAssignModalOpen.value = false
  selectedUserId.value = ''
  selectedRole.value = ''
  modalError.value = ''
  isEditMode.value = false
}

const openAssignModal = async () => {
  isEditMode.value = false
  await fetchAssignableUsers()
  isAssignModalOpen.value = true
}

const openEditModal = (user: ManagedUser) => {
  isEditMode.value = true
  isAssignModalOpen.value = true
  selectedUserId.value = user.id
  selectedRole.value = user.role
}

const saveRole = async () => {
  modalError.value = ''
  if (!canAssign.value) return
  isSaving.value = true
  try {
    await api.patch(`/users/${selectedUserId.value}/role`, { role: selectedRole.value })
    await fetchUsers()
    closeAssignModal()
  } catch (error: any) {
    modalError.value = error?.data?.message || 'Failed to update user.'
  } finally {
    isSaving.value = false
  }
}

const setEmployeeRole = async (user: ManagedUser) => {
  if (!confirm(`Are you sure you want to demote ${user.name} to Employee role?`)) return
  isSaving.value = true
  try {
    await api.patch(`/users/${user.id}/role`, { role: 'EMPLOYEE' })
    await fetchUsers()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || 'Failed to demote user.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
