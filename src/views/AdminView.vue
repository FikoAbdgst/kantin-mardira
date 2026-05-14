<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'

import UsersTab from '@/components/admin/UsersTab.vue'
import CategoriesTab from '@/components/admin/CategoriesTab.vue'
import MenusTab from '@/components/admin/MenusTab.vue'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('users')
const sidebarOpen = ref(false)

const tabs = [
  { key: 'users', label: 'Manajemen User', icon: 'pi-users', desc: 'Kelola akun karyawan' },
  { key: 'categories', label: 'Kategori', icon: 'pi-tags', desc: 'Grup menu makanan' },
  { key: 'menus', label: 'Daftar Menu', icon: 'pi-shopping-bag', desc: 'Katalog & stok' },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const navigate = (key) => {
  activeTab.value = key
  sidebarOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen bg-amber-50 font-sans">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-30 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-72 bg-white border-r border-amber-100 shadow-sm transition-transform duration-300 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-amber-100">
        <div class="flex items-center justify-center w-10 h-10 bg-orange-400 rounded-2xl shadow">
          <i class="pi pi-truck text-white text-base"></i>
        </div>
        <div>
          <h1 class="text-sm font-extrabold text-gray-800 leading-tight tracking-tight">
            KANTIN MARDIRA
          </h1>
          <p class="text-xs text-orange-400 font-semibold mt-0.5">Admin Panel</p>
        </div>
      </div>

      <!-- Nav -->
      <div class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p class="px-3 mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Menu Utama
        </p>

        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="navigate(tab.key)"
          class="flex items-center w-full gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group"
          :class="
            activeTab === tab.key
              ? 'bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          "
        >
          <div
            class="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 transition-colors"
            :class="
              activeTab === tab.key ? 'bg-orange-400 shadow' : 'bg-gray-100 group-hover:bg-gray-200'
            "
          >
            <i
              :class="`pi ${tab.icon} text-sm`"
              :style="activeTab === tab.key ? 'color:white' : ''"
            ></i>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold leading-tight truncate">{{ tab.label }}</p>
            <p
              class="text-xs mt-0.5 truncate"
              :class="activeTab === tab.key ? 'text-orange-400' : 'text-gray-400'"
            >
              {{ tab.desc }}
            </p>
          </div>
          <i
            v-if="activeTab === tab.key"
            class="pi pi-chevron-right text-xs text-orange-400 ml-auto flex-shrink-0"
          ></i>
        </button>
      </div>

      <!-- Footer sidebar -->
      <div class="px-6 py-4 border-t border-amber-100">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0"
          >
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-700 truncate">
              {{ authStore.user?.name || 'Administrator' }}
            </p>
            <p class="text-xs text-gray-400">Super Admin</p>
          </div>
          <button
            @click="handleLogout"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
            title="Logout"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header
        class="flex items-center justify-between px-5 lg:px-8 py-4 bg-white border-b border-amber-100 sticky top-0 z-20"
      >
        <div class="flex items-center gap-3">
          <!-- Mobile hamburger -->
          <button
            class="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            @click="sidebarOpen = true"
          >
            <i class="pi pi-bars"></i>
          </button>

          <div>
            <h2 class="text-base font-bold text-gray-800 leading-tight">
              {{ tabs.find((t) => t.key === activeTab)?.label }}
            </h2>
            <p class="text-xs text-gray-400 hidden sm:block">
              {{ tabs.find((t) => t.key === activeTab)?.desc }}
            </p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block text-right">
            <p class="text-sm font-semibold text-gray-700">{{ authStore.user?.name || 'Admin' }}</p>
            <p class="text-xs text-orange-400 font-medium">Super Admin</p>
          </div>
          <div
            class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm ring-2 ring-orange-200"
          >
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-5 lg:p-8 overflow-y-auto">
        <UsersTab v-if="activeTab === 'users'" />
        <CategoriesTab v-else-if="activeTab === 'categories'" />
        <MenusTab v-else-if="activeTab === 'menus'" />
      </main>

      <!-- Footer -->
      <footer class="px-8 py-3 border-t border-amber-100 bg-white">
        <p class="text-xs text-center text-gray-400">
          © 2025 Kantin Mardira Fiko Abdigusti & Teguh Bagas M
        </p>
      </footer>
    </div>
  </div>
</template>
