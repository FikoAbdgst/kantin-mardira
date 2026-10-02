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
  { key: 'users', label: 'Manajemen User', desc: 'Kelola akun karyawan' },
  { key: 'categories', label: 'Kategori', desc: 'Grup menu makanan' },
  { key: 'menus', label: 'Daftar Menu', desc: 'Katalog & stok' },
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

<!-- Ruang admin: lemari arsip kantin. Struktur sama, kulit tinta-nota. -->
<template>
  <div class="dinding flex min-h-screen">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-30 lg:hidden"
      @click="sidebarOpen = false"
    />

    <aside
      class="kertas fixed lg:static inset-y-0 left-0 z-40 flex flex-col w-72 border-r-2 transition-transform duration-300 lg:translate-x-0"
      style="border-color: var(--tinta)"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div
        class="flex items-center gap-3 px-6 h-20 flex-shrink-0 border-b-2"
        style="border-color: var(--tinta)"
      >
        <div
          class="flex items-center justify-center w-10 h-10 rounded angka-nota font-extrabold text-sm flex-shrink-0"
          style="background: var(--bata); color: #fdf6e9"
        >
          KM
        </div>
        <div>
          <h1
            class="text-sm font-extrabold leading-tight tracking-[0.08em] uppercase"
            style="color: var(--tinta)"
          >
            Kantin Mardira
          </h1>
          <p
            class="angka-nota text-[11px] uppercase tracking-[0.2em]"
            style="color: var(--tinta-soft)"
          >
            Ruang admin
          </p>
        </div>
      </div>

      <div class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <button
          v-for="(tab, i) in tabs"
          :key="tab.key"
          @click="navigate(tab.key)"
          class="flex items-center w-full gap-3 px-4 py-3 rounded text-left transition-all duration-200 border-2"
          :style="
            activeTab === tab.key
              ? 'background: var(--tinta); border-color: var(--tinta); color: var(--kertas)'
              : 'background: transparent; border-color: transparent; color: var(--tinta)'
          "
        >
          <span
            class="angka-nota text-[11px] font-extrabold"
            :style="activeTab === tab.key ? 'color: var(--nota)' : 'color: var(--tinta-soft)'"
          >
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <div class="min-w-0">
            <p class="text-sm font-bold leading-tight truncate">{{ tab.label }}</p>
            <p
              class="angka-nota text-[11px] mt-0.5 truncate"
              :style="
                activeTab === tab.key ? 'color: var(--krem-deep)' : 'color: var(--tinta-soft)'
              "
            >
              {{ tab.desc }}
            </p>
          </div>
        </button>
      </div>

      <div class="px-6 py-4 border-t-2" style="border-color: var(--tinta)">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 border-2"
            style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
          >
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold truncate" style="color: var(--tinta)">
              {{ authStore.user?.name || 'Administrator' }}
            </p>
            <p
              class="angka-nota text-[11px] uppercase tracking-[0.18em]"
              style="color: var(--tinta-soft)"
            >
              Admin
            </p>
          </div>
          <button
            @click="handleLogout"
            class="h-9 px-3 flex items-center gap-1.5 rounded text-xs font-bold uppercase tracking-wider border-2 transition-colors hover:text-white"
            style="border-color: var(--tinta); color: var(--tinta)"
            onmouseover="this.style.background = 'red'"
            onmouseout="this.style.background = 'transparent'"
            title="Keluar"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>
    </aside>

    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <header
        class="kertas flex items-center justify-between px-5 lg:px-8 h-20 flex-shrink-0 border-b-2 sticky top-0 z-20"
        style="border-color: var(--tinta)"
      >
        <div class="flex items-center gap-3">
          <button
            class="lg:hidden w-9 h-9 flex items-center justify-center rounded border-2 transition-colors"
            style="border-color: var(--tinta); color: var(--tinta)"
            @click="sidebarOpen = true"
            aria-label="Buka arsip"
          >
            <i class="pi pi-bars"></i>
          </button>

          <div>
            <h2 class="text-base font-extrabold leading-tight" style="color: var(--tinta)">
              {{ tabs.find((t) => t.key === activeTab)?.label }}
            </h2>
            <p
              class="angka-nota text-[11px] uppercase tracking-[0.18em] hidden sm:block"
              style="color: var(--tinta-soft)"
            >
              {{ tabs.find((t) => t.key === activeTab)?.desc }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block text-right">
            <p class="text-sm font-bold" style="color: var(--tinta)">
              {{ authStore.user?.name || 'Admin' }}
            </p>
            <p
              class="angka-nota text-[11px] uppercase tracking-[0.18em]"
              style="color: var(--tinta-soft)"
            >
              Admin
            </p>
          </div>
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border-2"
            style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
          >
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
        </div>
      </header>

      <main class="flex-1 p-5 lg:p-8 overflow-y-auto">
        <UsersTab v-if="activeTab === 'users'" />
        <CategoriesTab v-else-if="activeTab === 'categories'" />
        <MenusTab v-else-if="activeTab === 'menus'" />
      </main>

      <footer class="kertas px-8 py-3 border-t" style="border-color: var(--garis)">
        <p
          class="angka-nota text-[11px] text-center uppercase tracking-[0.18em]"
          style="color: var(--tinta-soft)"
        >
          Kantin Mardira · STMIK Mardira Indonesia
        </p>
      </footer>
    </div>
  </div>
</template>
