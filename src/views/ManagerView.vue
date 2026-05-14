<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

const authStore = useAuthStore()
const router = useRouter()

const stats = ref({ revenue: 0, transactions: 0, avgOrder: 0, itemsSold: 0 })
const topMenus = ref([])
const isLoading = ref(true)

const currentMonthLabel = computed(() =>
  new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
)

const monthsList = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

const currentYear = new Date().getFullYear()
const yearsList = computed(() => {
  const years = []
  for (let y = currentYear; y >= 2023; y--) years.push(y)
  return years
})

const showReportModal = ref(false)
const isGeneratingPdf = ref(false)
const pdfPreviewUrl = ref(null)
const pdfFilename = ref('')

// State untuk filter laporan
const reportType = ref('monthly')
const reportDate = ref('')
const reportStartDate = ref('') // Tambahan untuk Mingguan
const reportEndDate = ref('') // Tambahan untuk Mingguan
const reportMonth = ref(new Date().getMonth() + 1)
const reportYear = ref(currentYear)

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0)

const getApiDateFormat = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const openReportModal = () => {
  showReportModal.value = true
  pdfPreviewUrl.value = null
}
const closeReportModal = () => {
  showReportModal.value = false
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = null
  }
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startDate = getApiDateFormat(firstDay)
    const endDate = getApiDateFormat(lastDay)

    const [reportRes, menuRes] = await Promise.all([
      api
        .get(`/reports/summary?start_date=${startDate}&end_date=${endDate}`)
        .catch(() => ({ data: { data: {} } })),
      api.get('/reports/top-selling').catch(() => ({ data: { data: [] } })),
    ])

    const report = reportRes.data.data || {}
    stats.value = {
      revenue: report.total_revenue || 0,
      transactions: report.total_transactions || 0,
      avgOrder: report.average_transaction || 0,
      itemsSold: report.total_items_sold || 0,
    }
    topMenus.value = menuRes.data.data || []
  } catch (e) {
    console.error('Gagal memuat data manager:', e)
  } finally {
    isLoading.value = false
  }
}

const generatePdfPreview = async () => {
  isGeneratingPdf.value = true
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
    pdfPreviewUrl.value = null
  }
  try {
    let endpoint = '',
      filename = ''

    // Logika pengkondisian untuk 3 tipe laporan
    if (reportType.value === 'daily') {
      if (!reportDate.value) return alert('Pilih tanggal terlebih dahulu!')
      endpoint = `/reports/daily/pdf?date=${reportDate.value}`
      filename = `Laporan_Harian_Kantin_${reportDate.value}.pdf`
    } else if (reportType.value === 'weekly') {
      if (!reportStartDate.value || !reportEndDate.value) {
        return alert('Pilih tanggal mulai dan tanggal akhir terlebih dahulu!')
      }
      endpoint = `/reports/weekly/pdf?start_date=${reportStartDate.value}&end_date=${reportEndDate.value}`
      filename = `Laporan_Mingguan_Kantin_${reportStartDate.value}_sd_${reportEndDate.value}.pdf`
    } else {
      endpoint = `/reports/monthly/pdf?month=${reportMonth.value}&year=${reportYear.value}`
      filename = `Laporan_Bulanan_Kantin_${reportYear.value}_${reportMonth.value}.pdf`
    }

    const res = await api.get(endpoint, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    pdfPreviewUrl.value = window.URL.createObjectURL(blob)
    pdfFilename.value = filename
  } catch (e) {
    alert('Gagal memuat dokumen PDF. Pastikan terdapat data transaksi pada waktu tersebut.')
  } finally {
    isGeneratingPdf.value = false
  }
}

const downloadGeneratedPdf = () => {
  if (!pdfPreviewUrl.value) return
  const link = document.createElement('a')
  link.href = pdfPreviewUrl.value
  link.setAttribute('download', pdfFilename.value)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const statCards = [
  {
    key: 'revenue',
    label: 'Total Pendapatan',
    icon: 'pi-wallet',
    accent: 'text-orange-500',
    iconBg: 'bg-orange-50',
    bar: '#f97316',
    format: 'currency',
  },
  {
    key: 'transactions',
    label: 'Total Transaksi',
    icon: 'pi-receipt',
    accent: 'text-blue-500',
    iconBg: 'bg-blue-50',
    bar: '#3b82f6',
    format: 'number',
  },
  {
    key: 'avgOrder',
    label: 'Rata-rata Transaksi',
    icon: 'pi-chart-line',
    accent: 'text-amber-500',
    iconBg: 'bg-amber-50',
    bar: '#f59e0b',
    format: 'currency',
  },
  {
    key: 'itemsSold',
    label: 'Item Terjual',
    icon: 'pi-shopping-bag',
    accent: 'text-purple-500',
    iconBg: 'bg-purple-50',
    bar: '#a855f7',
    format: 'number',
  },
]

const rankStyle = (i) =>
  ['bg-amber-400 text-white', 'bg-gray-300 text-gray-700', 'bg-orange-300 text-white'][i] ||
  'bg-gray-100 text-gray-500'

const formatStat = (val, format) =>
  format === 'currency' ? formatRupiah(val) : (val || 0).toLocaleString('id-ID')

onMounted(fetchData)
</script>

<template>
  <div
    class="min-h-screen bg-[#faf8f5]"
    style="font-family: 'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif"
  >
    <header
      class="flex items-center justify-between px-4 sm:px-5 lg:px-8 py-3 sm:py-4 bg-white border-b border-amber-100 sticky top-0 z-20 shadow-sm"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
          style="background: linear-gradient(135deg, #f97316, #ea580c)"
        >
          <i class="pi pi-chart-bar text-white" style="font-size: 13px"></i>
        </div>
        <div class="hidden sm:block">
          <h1 class="text-sm font-extrabold text-gray-900 leading-none tracking-tight">
            KANTIN MARDIRA
          </h1>
          <p class="text-xs font-semibold mt-0.5" style="color: #f97316">Dashboard Manager</p>
        </div>
        <span class="sm:hidden text-sm font-extrabold text-gray-900">Dashboard</span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="openReportModal"
          class="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
          style="background: linear-gradient(135deg, #f97316, #ea580c)"
        >
          <i class="pi pi-file-pdf" style="font-size: 11px"></i> PDF
        </button>

        <div class="hidden sm:block text-right">
          <p class="text-sm font-semibold text-gray-700">{{ authStore.user?.name }}</p>
          <p class="text-xs font-medium" style="color: #f97316">Manager</p>
        </div>
        <div
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm ring-2 ring-orange-200 flex-shrink-0"
        >
          {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'M' }}
        </div>
        <button
          @click="
            () => {
              authStore.logout()
              router.push('/login')
            }
          "
          class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <i class="pi pi-sign-out" style="font-size: 13px"></i>
        </button>
      </div>
    </header>

    <main
      class="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-5 sm:py-7 lg:py-8 space-y-5 sm:space-y-7 lg:space-y-8"
    >
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div
          class="sm:col-span-2 bg-white rounded-3xl border border-amber-100 shadow-sm p-5 sm:p-7 flex flex-col justify-between gap-4 relative overflow-hidden"
        >
          <div
            class="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-[0.06] pointer-events-none"
            style="background: radial-gradient(circle, #f97316, transparent)"
          ></div>
          <div
            class="absolute right-20 -bottom-8 w-28 h-28 rounded-full opacity-[0.05] pointer-events-none"
            style="background: radial-gradient(circle, #f59e0b, transparent)"
          ></div>

          <div class="relative z-10">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-3"
              style="background: #fff7ed; color: #ea580c"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              Live · {{ currentMonthLabel }}
            </span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
              Halo, {{ authStore.user?.name?.split(' ')[0] }}! 👋
            </h2>
            <p class="mt-1.5 text-sm text-gray-400 max-w-sm leading-relaxed">
              Pantau performa penjualan dan ekspor laporan PDF dengan sekali klik.
            </p>
          </div>

          <div class="flex items-center gap-3 relative z-10 flex-wrap">
            <div
              class="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-orange-100"
              style="background: #fff7ed"
            >
              <i class="pi pi-wallet text-sm" style="color: #f97316"></i>
              <div>
                <p class="text-xs text-gray-400 leading-none">Pendapatan</p>
                <div
                  v-if="isLoading"
                  class="h-3.5 w-20 bg-gray-200 rounded animate-pulse mt-0.5"
                ></div>
                <p v-else class="text-sm font-extrabold text-gray-900 leading-tight">
                  {{ formatRupiah(stats.revenue) }}
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-blue-100 bg-blue-50"
            >
              <i class="pi pi-receipt text-sm text-blue-500"></i>
              <div>
                <p class="text-xs text-gray-400 leading-none">Transaksi</p>
                <div
                  v-if="isLoading"
                  class="h-3.5 w-10 bg-gray-200 rounded animate-pulse mt-0.5"
                ></div>
                <p v-else class="text-sm font-extrabold text-gray-900 leading-tight">
                  {{ stats.transactions }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="openReportModal"
          class="hidden sm:flex bg-white border border-amber-100 rounded-3xl p-6 flex-col items-center justify-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group shadow-sm"
        >
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"
            style="background: linear-gradient(135deg, #fff1f2, #ffe4e6)"
          >
            <i class="pi pi-file-pdf text-red-400 text-3xl"></i>
          </div>
          <div class="text-center">
            <p class="font-extrabold text-gray-800 text-sm">Laporan PDF</p>
            <p class="text-xs text-gray-400 mt-0.5">Harian, Mingguan & Bulanan</p>
          </div>
          <span
            class="text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
            style="background: #fff7ed; color: #ea580c"
            >Buat laporan →</span
          >
        </button>
      </section>

      <section>
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-sm sm:text-base font-extrabold text-gray-900">Performa Bulan Ini</h3>
          <span class="text-xs text-gray-400">{{ currentMonthLabel }}</span>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="(card, idx) in statCards"
            :key="card.key"
            class="bg-white border border-amber-100 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            :style="{ animationDelay: `${idx * 60}ms` }"
          >
            <div class="flex items-start justify-between mb-3 sm:mb-4">
              <div
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center"
                :class="card.iconBg"
              >
                <i :class="`pi ${card.icon} ${card.accent}`" style="font-size: 14px"></i>
              </div>
              <div
                class="w-2 h-2 rounded-full mt-1"
                :style="{ background: card.bar, opacity: 0.3 }"
              ></div>
            </div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight mb-1">
              {{ card.label }}
            </p>
            <div
              v-if="isLoading"
              class="h-6 sm:h-7 bg-gray-100 rounded-xl animate-pulse w-3/4 mt-1"
            ></div>
            <p v-else class="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              {{ formatStat(stats[card.key], card.format) }}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div class="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
          <div
            class="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-amber-100"
          >
            <div>
              <h3 class="font-extrabold text-gray-900 text-sm sm:text-base">Menu Paling Laku</h3>
              <p class="text-xs text-gray-400 mt-0.5">Berdasarkan data {{ currentMonthLabel }}</p>
            </div>
            <span
              class="text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ring-1 ring-orange-100"
              style="background: #fff7ed; color: #ea580c"
              >Top 5 Terlaris</span
            >
          </div>

          <div
            v-if="topMenus.length === 0 && !isLoading"
            class="flex flex-col items-center justify-center py-16 text-gray-400"
          >
            <i class="pi pi-chart-bar text-4xl mb-3 text-amber-200"></i>
            <p class="text-sm font-medium">Belum ada data penjualan</p>
          </div>

          <div v-else-if="!isLoading" class="md:hidden divide-y divide-amber-50">
            <div
              v-for="(item, index) in topMenus.slice(0, 5)"
              :key="index"
              class="flex items-center gap-3 px-4 py-3.5"
            >
              <span
                class="w-8 h-8 flex items-center justify-center text-xs font-extrabold rounded-full flex-shrink-0"
                :class="rankStyle(index)"
                >{{ index + 1 }}</span
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-800 truncate">{{ item.menu_name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  <i class="pi pi-shopping-bag mr-1" style="font-size: 10px"></i
                  >{{ item.total_quantity_sold }} pcs terjual
                </p>
              </div>
              <span class="text-sm font-extrabold flex-shrink-0" style="color: #f97316">{{
                formatRupiah(item.total_revenue)
              }}</span>
            </div>
          </div>

          <div v-else class="md:hidden divide-y divide-amber-50">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3 px-4 py-3.5 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 bg-gray-100 rounded w-2/3"></div>
                <div class="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
              <div class="h-4 bg-gray-100 rounded w-20 flex-shrink-0"></div>
            </div>
          </div>

          <div class="hidden md:block">
            <DataTable :value="topMenus" :loading="isLoading" :rows="5" :rowHover="true">
              <Column header="#" style="width: 72px" align="center">
                <template #body="{ index }">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 text-xs font-extrabold rounded-full"
                    :class="rankStyle(index)"
                    >{{ index + 1 }}</span
                  >
                </template>
              </Column>
              <Column field="menu_name" header="Nama Menu">
                <template #body="{ data }"
                  ><span class="font-bold text-gray-800">{{ data.menu_name }}</span></template
                >
              </Column>
              <Column field="total_quantity_sold" header="Terjual">
                <template #body="{ data }">
                  <span
                    class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full"
                  >
                    <i class="pi pi-shopping-bag" style="font-size: 10px"></i>
                    {{ data.total_quantity_sold }} pcs
                  </span>
                </template>
              </Column>
              <Column field="total_revenue" header="Pendapatan">
                <template #body="{ data }">
                  <span class="font-extrabold" style="color: #f97316">{{
                    formatRupiah(data.total_revenue)
                  }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </section>
    </main>

    <Dialog
      v-model:visible="showReportModal"
      @hide="closeReportModal"
      modal
      :showHeader="false"
      :style="{
        width: 'min(760px, calc(100vw - 2rem))',
        borderRadius: '1.5rem',
        overflow: 'hidden',
      }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.5rem; overflow: hidden' },
      }"
    >
      <div
        class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center"
            style="background: #fff1f2"
          >
            <i class="pi pi-file-pdf text-red-500" style="font-size: 13px"></i>
          </div>
          <h3 class="text-base font-extrabold text-gray-900">Dokumen Laporan PDF</h3>
        </div>
        <button
          @click="closeReportModal"
          class="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-5 sm:px-6 py-5 space-y-5">
        <div
          class="rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-4"
          style="background: #fafafa"
        >
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
              >Tipe Laporan</label
            >
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="type in [
                  { val: 'daily', icon: 'pi-calendar', label: 'Harian' },
                  { val: 'weekly', icon: 'pi-calendar-minus', label: 'Mingguan' },
                  { val: 'monthly', icon: 'pi-calendar-plus', label: 'Bulanan' },
                ]"
                :key="type.val"
                @click="
                  () => {
                    reportType = type.val
                    pdfPreviewUrl = null
                  }
                "
                class="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all"
                :class="
                  reportType === type.val
                    ? 'border-orange-300 text-orange-700 ring-2 ring-orange-100'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                "
                :style="reportType === type.val ? 'background: #fff7ed' : ''"
              >
                <i
                  :class="`pi ${type.icon} text-sm`"
                  :style="reportType === type.val ? 'color: #f97316' : 'color: #9ca3af'"
                ></i>
                {{ type.label }}
              </button>
            </div>
          </div>

          <div v-if="reportType === 'daily'" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
              >Tanggal Transaksi</label
            >
            <div class="relative">
              <i
                class="pi pi-calendar absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style="font-size: 13px"
              ></i>
              <input
                v-model="reportDate"
                type="date"
                class="w-full pl-9 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-gray-800"
              />
            </div>
          </div>

          <div v-if="reportType === 'weekly'" class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                >Mulai Tanggal</label
              >
              <div class="relative">
                <i
                  class="pi pi-calendar absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <input
                  v-model="reportStartDate"
                  type="date"
                  class="w-full pl-9 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-gray-800"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                >Sampai Tanggal</label
              >
              <div class="relative">
                <i
                  class="pi pi-calendar absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <input
                  v-model="reportEndDate"
                  type="date"
                  class="w-full pl-9 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-gray-800"
                />
              </div>
            </div>
          </div>

          <div v-if="reportType === 'monthly'" class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Bulan</label>
              <div class="relative">
                <i
                  class="pi pi-calendar absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <select
                  v-model="reportMonth"
                  class="w-full pl-9 pr-8 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-gray-800 appearance-none"
                >
                  <option v-for="m in monthsList" :key="m.value" :value="m.value">
                    {{ m.label }}
                  </option>
                </select>
                <i
                  class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 10px"
                ></i>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tahun</label>
              <div class="relative">
                <i
                  class="pi pi-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <select
                  v-model="reportYear"
                  class="w-full pl-9 pr-8 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-gray-800 appearance-none"
                >
                  <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
                </select>
                <i
                  class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 10px"
                ></i>
              </div>
            </div>
          </div>

          <button
            @click="generatePdfPreview"
            :disabled="isGeneratingPdf"
            class="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-60"
            style="background: linear-gradient(135deg, #f97316, #ea580c)"
          >
            <i v-if="isGeneratingPdf" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-search"></i>
            {{ isGeneratingPdf ? 'Memuat dokumen...' : 'Tampilkan Preview' }}
          </button>
        </div>

        <div v-if="pdfPreviewUrl" class="pdf-fadein">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-file-pdf text-red-400"></i>
              <span class="text-sm font-bold text-gray-700">Preview Dokumen</span>
            </div>
            <button
              @click="downloadGeneratedPdf"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
              style="background: linear-gradient(135deg, #f97316, #ea580c)"
            >
              <i class="pi pi-download" style="font-size: 10px"></i> Unduh PDF
            </button>
          </div>
          <div
            class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
            style="height: min(480px, 50vh)"
          >
            <iframe :src="pdfPreviewUrl" class="w-full h-full" title="PDF Preview"></iframe>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 px-5 sm:px-6 pb-5 pt-1">
        <button
          @click="closeReportModal"
          class="px-4 py-2.5 text-sm text-gray-500 font-bold transition-colors rounded-xl hover:bg-gray-100"
        >
          Tutup
        </button>
        <button
          @click="downloadGeneratedPdf"
          :disabled="!pdfPreviewUrl"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style="background: linear-gradient(135deg, #f97316, #ea580c)"
        >
          <i class="pi pi-download" style="font-size: 11px"></i> Unduh File PDF
        </button>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.pdf-fadein {
  animation: pdfFade 0.35s ease-out;
}
@keyframes pdfFade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
