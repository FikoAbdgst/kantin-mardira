<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const authStore = useAuthStore()
const router = useRouter()

const stats = ref({
  revenue: 0,
  transactions: 0,
  avgOrder: 0,
  activeMenus: 0,
})
const topMenus = ref([])
const recentTransactions = ref([])
const isLoading = ref(false)

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

const fetchData = async () => {
  isLoading.value = true
  try {
    // Adjust endpoints to match your backend
    const [reportRes, menuRes] = await Promise.all([
      api.get('/reports/summary').catch(() => ({ data: { data: {} } })),
      api.get('/reports/top-selling').catch(() => ({ data: { data: [] } })),
    ])
    const report = reportRes.data.data
    stats.value = {
      revenue: report.total_revenue || 0,
      transactions: report.total_transactions || 0,
      avgOrder: report.average_order || 0,
      activeMenus: report.active_menus || 0,
    }
    topMenus.value = menuRes.data.data || []
  } catch (e) {
    console.error('Gagal memuat laporan:', e)
  } finally {
    isLoading.value = false
  }
}

const statCards = [
  {
    key: 'revenue',
    label: 'Total Pendapatan',
    icon: 'pi-wallet',
    color: '#1a6b3a',
    bg: '#f0f7f3',
    format: 'currency',
  },
  {
    key: 'transactions',
    label: 'Total Transaksi',
    icon: 'pi-receipt',
    color: '#1e3a5f',
    bg: '#eef2f7',
    format: 'number',
  },
  {
    key: 'avgOrder',
    label: 'Rata-rata Order',
    icon: 'pi-chart-line',
    color: '#92400e',
    bg: '#fef3e2',
    format: 'currency',
  },
  {
    key: 'activeMenus',
    label: 'Menu Aktif',
    icon: 'pi-shopping-bag',
    color: '#5b21b6',
    bg: '#f3f0ff',
    format: 'number',
  },
]

const formatStat = (val, format) =>
  format === 'currency' ? formatRupiah(val) : val.toLocaleString('id-ID')

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen" style="background: #f8f7f4; font-family: 'DM Sans', sans-serif">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          style="background: #1a6b3a"
        >
          <i class="pi pi-chart-bar text-white text-sm"></i>
        </div>
        <div>
          <h1 class="font-bold text-gray-900 text-base leading-none">Kantin Mardira</h1>
          <p class="text-xs text-gray-400 mt-0.5">Dashboard Manager</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-sm font-medium text-gray-700">{{ authStore.user?.name }}</p>
          <p class="text-xs text-gray-400">Manager</p>
        </div>
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          size="small"
          outlined
          rounded
          @click="
            () => {
              authStore.logout()
              router.push('/login')
            }
          "
        />
      </div>
    </header>

    <main class="p-6 max-w-7xl mx-auto">
      <!-- Page Title -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Ringkasan Laporan</h2>
        <p class="text-gray-400 text-sm mt-1">Performa kantin bulan ini</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
            :style="`background: ${card.bg};`"
          >
            <i :class="`pi ${card.icon}`" :style="`color: ${card.color}; font-size: 1.1rem;`"></i>
          </div>
          <p class="text-gray-400 text-xs font-medium mb-1">{{ card.label }}</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatStat(stats[card.key], card.format) }}
          </p>
          <p class="text-xs mt-1" style="color: #1a6b3a">▲ Bulan ini</p>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Top Selling Menu -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="font-bold text-gray-800">Menu Paling Laku</h3>
            <span class="text-xs text-gray-400">Bulan ini</span>
          </div>
          <div v-if="topMenus.length === 0 && !isLoading" class="p-10 text-center">
            <i class="pi pi-chart-bar text-4xl text-gray-200 mb-2 block"></i>
            <p class="text-gray-400 text-sm">Belum ada data penjualan</p>
          </div>
          <DataTable v-else :value="topMenus" :loading="isLoading" :rows="5">
            <Column header="#" style="width: 48px">
              <template #body="{ index }">
                <span
                  class="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white"
                  :style="`background: ${index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#a16207' : '#e5e7eb'}; color: ${index > 2 ? '#374151' : 'white'};`"
                  >{{ index + 1 }}</span
                >
              </template>
            </Column>
            <Column field="name" header="Nama Menu">
              <template #body="{ data }">
                <span class="font-medium text-gray-800">{{ data.name }}</span>
              </template>
            </Column>
            <Column field="total_sold" header="Terjual">
              <template #body="{ data }">
                <span class="font-semibold text-gray-700">{{ data.total_sold }} pcs</span>
              </template>
            </Column>
            <Column field="total_revenue" header="Pendapatan">
              <template #body="{ data }">
                <span class="font-semibold text-green-700">{{
                  formatRupiah(data.total_revenue)
                }}</span>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 class="font-bold text-gray-800 mb-4">Aksi Cepat</h3>
          <div class="space-y-3">
            <button
              v-for="action in [
                {
                  label: 'Unduh Laporan PDF',
                  icon: 'pi-download',
                  color: '#1a6b3a',
                  bg: '#f0f7f3',
                },
                {
                  label: 'Lihat Semua Transaksi',
                  icon: 'pi-list',
                  color: '#1e3a5f',
                  bg: '#eef2f7',
                },
                { label: 'Manajemen Stok', icon: 'pi-box', color: '#92400e', bg: '#fef3e2' },
              ]"
              :key="action.label"
              class="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all hover:opacity-80 text-left"
              :style="`background: ${action.bg}; color: ${action.color};`"
            >
              <i :class="`pi ${action.icon}`"></i>
              {{ action.label }}
            </button>
          </div>

          <div class="mt-6 pt-5 border-t border-gray-100">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Info Sistem
            </h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Versi Aplikasi</span>
                <span class="font-medium text-gray-700">v1.0.0</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status Server</span>
                <span class="flex items-center gap-1 font-medium text-green-700">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span> Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
