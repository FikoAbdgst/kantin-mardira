<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('users')
const users = ref([])
const categories = ref([])
const menus = ref([])
const isLoading = ref(false)

const tabs = [
  { key: 'users', label: 'Manajemen User', icon: 'pi-users' },
  { key: 'categories', label: 'Kategori', icon: 'pi-tags' },
  { key: 'menus', label: 'Daftar Menu', icon: 'pi-shopping-bag' },
]

const fetchData = async () => {
  isLoading.value = true
  try {
    const [uRes, cRes, mRes] = await Promise.all([
      api.get('/users'),
      api.get('/categories'),
      api.get('/menus'),
    ])
    users.value = uRes.data.data
    categories.value = cRes.data.data
    menus.value = mRes.data.data
  } catch (e) {
    console.error('Gagal memuat data:', e)
  } finally {
    isLoading.value = false
  }
}

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

const roleSeverity = (role) => {
  if (role === 'admin') return 'danger'
  if (role === 'manager') return 'info'
  return 'success'
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(fetchData)
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
        <div v-if="activeTab === 'users'" class="animate-fadein">
          <div class="flex items-end justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-gray-900">Manajemen User</h2>
              <p class="mt-1 text-sm text-gray-500">
                Kelola hak akses akun karyawan dan staf kantin.
              </p>
            </div>
            <Button
              label="Tambah User"
              icon="pi pi-plus"
              class="bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm"
            />
          </div>
          <div class="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <DataTable :value="users" :loading="isLoading" hoverRows>
              <Column field="name" header="Nama Lengkap">
                <template #body="{ data }">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex items-center justify-center w-8 h-8 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100"
                    >
                      {{ data.name?.charAt(0)?.toUpperCase() }}
                    </div>
                    <span class="font-semibold text-gray-800">{{ data.name }}</span>
                  </div>
                </template>
              </Column>
              <Column field="email" header="Email Akses">
                <template #body="{ data }">
                  <span class="text-sm text-gray-500">{{ data.email }}</span>
                </template>
              </Column>
              <Column field="role" header="Jabatan">
                <template #body="{ data }">
                  <Tag
                    :value="data.role"
                    :severity="roleSeverity(data.role)"
                    class="px-3 py-1 font-bold tracking-wide uppercase shadow-sm"
                  />
                </template>
              </Column>
              <Column header="Aksi" style="width: 120px" align="center">
                <template #body>
                  <div class="flex justify-center gap-2">
                    <Button
                      icon="pi pi-pencil"
                      severity="info"
                      outlined
                      rounded
                      size="small"
                      class="bg-blue-50 hover:bg-blue-100 shadow-sm"
                    />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      outlined
                      rounded
                      size="small"
                      class="bg-red-50 hover:bg-red-100 shadow-sm"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <div v-if="activeTab === 'categories'" class="animate-fadein">
          <div class="flex items-end justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-gray-900">Kategori Menu</h2>
              <p class="mt-1 text-sm text-gray-500">
                Kelompokkan menu agar mudah dicari oleh kasir.
              </p>
            </div>
            <Button
              label="Tambah Kategori"
              icon="pi pi-plus"
              class="bg-teal-500 hover:bg-teal-600 border-none shadow-sm"
            />
          </div>
          <div class="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <DataTable :value="categories" :loading="isLoading" hoverRows>
              <Column field="name" header="Nama Kategori">
                <template #body="{ data }">
                  <div class="flex items-center gap-3">
                    <div class="w-2.5 h-2.5 bg-teal-400 rounded-full shadow-sm"></div>
                    <span class="font-semibold text-gray-800">{{ data.name }}</span>
                  </div>
                </template>
              </Column>
              <Column header="Aksi" style="width: 120px" align="center">
                <template #body>
                  <div class="flex justify-center">
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      outlined
                      rounded
                      size="small"
                      class="bg-red-50 hover:bg-red-100 shadow-sm"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>

        <div v-if="activeTab === 'menus'" class="animate-fadein">
          <div class="flex items-end justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-gray-900">Katalog Menu</h2>
              <p class="mt-1 text-sm text-gray-500">Atur harga, ketersediaan, dan stok harian.</p>
            </div>
            <Button
              label="Menu Baru"
              icon="pi pi-plus"
              class="bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm"
            />
          </div>
          <div class="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <DataTable :value="menus" :loading="isLoading" paginator :rows="8" hoverRows>
              <Column field="name" header="Nama Produk">
                <template #body="{ data }">
                  <span class="font-semibold text-gray-800">{{ data.name }}</span>
                </template>
              </Column>
              <Column field="price" header="Harga Jual">
                <template #body="{ data }">
                  <span class="font-bold text-teal-600">{{ formatRupiah(data.price) }}</span>
                </template>
              </Column>
              <Column field="stock" header="Sisa Stok">
                <template #body="{ data }">
                  <span
                    class="px-3 py-1 text-xs font-bold rounded-full border shadow-sm"
                    :class="
                      data.stock > 15
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : data.stock > 0
                          ? 'bg-orange-50 text-orange-600 border-orange-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                    "
                  >
                    {{ data.stock }} Pcs
                  </span>
                </template>
              </Column>
              <Column field="is_available" header="Status Etalase">
                <template #body="{ data }">
                  <Tag
                    :value="data.is_available ? 'Tersedia' : 'Kosong'"
                    :severity="data.is_available ? 'success' : 'danger'"
                    class="font-bold tracking-wide shadow-sm"
                  />
                </template>
              </Column>
              <Column header="Aksi" style="width: 120px" align="center">
                <template #body>
                  <div class="flex justify-center gap-2">
                    <Button
                      icon="pi pi-pencil"
                      severity="info"
                      outlined
                      rounded
                      size="small"
                      class="bg-blue-50 hover:bg-blue-100 shadow-sm"
                    />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      outlined
                      rounded
                      size="small"
                      class="bg-red-50 hover:bg-red-100 shadow-sm"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.animate-fadein {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
