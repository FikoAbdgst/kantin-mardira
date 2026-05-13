<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'

// Import komponen yang sudah dipisah
import UsersTab from '@/components/admin/UsersTab.vue'
import CategoriesTab from '@/components/admin/CategoriesTab.vue'
import MenusTab from '@/components/admin/MenusTab.vue'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('users')

const tabs = [
  { key: 'users', label: 'Manajemen User', icon: 'pi-users' },
  { key: 'categories', label: 'Kategori', icon: 'pi-tags' },
  { key: 'menus', label: 'Daftar Menu', icon: 'pi-shopping-bag' },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans text-gray-800">
    <aside class="flex flex-col w-64 bg-emerald-900 shadow-xl z-20">
      <div class="flex items-center gap-3 px-6 py-5 border-b border-emerald-800">
        <div class="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-lg shadow-sm">
          <i class="text-sm text-white pi pi-shield"></i>
        </div>
        <div>
          <h1 class="text-base font-bold leading-none text-white tracking-wide">KANTIN MARDIRA</h1>
          <p class="mt-1 text-xs font-medium text-emerald-300">Panel Administrator</p>
        </div>
      </div>

      <div class="flex-1 px-4 py-6 overflow-y-auto">
        <p class="px-2 mb-3 text-xs font-bold tracking-widest uppercase text-emerald-400">
          Master Data
        </p>
        <nav class="space-y-1.5">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xl"
            :class="
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
            "
          >
            <i :class="`pi ${tab.icon}`" class="text-lg"></i>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="p-4 border-t border-emerald-800">
        <p class="text-xs text-center text-emerald-400">v1.0.0 - Fiko Abdigusti</p>
      </div>
    </aside>

    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <header
        class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 z-10"
      >
        <div
          class="flex items-center gap-2 text-gray-400 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <i class="pi pi-bars text-xl"></i>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-bold text-gray-800">
              {{ authStore.user?.name || 'Administrator' }}
            </p>
            <p class="text-xs font-semibold text-emerald-600">Super Admin</p>
          </div>
          <div
            class="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-bold shadow-sm border border-emerald-200"
          >
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
          <Button
            icon="pi pi-sign-out"
            severity="danger"
            text
            rounded
            aria-label="Logout"
            @click="handleLogout"
          />
        </div>
      </header>

      <main class="flex-1 p-8 overflow-y-auto">
        <UsersTab v-if="activeTab === 'users'" />
        <CategoriesTab v-else-if="activeTab === 'categories'" />
        <MenusTab v-else-if="activeTab === 'menus'" />
      </main>
    </div>
  </div>
</template>
