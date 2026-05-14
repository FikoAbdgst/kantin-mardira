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

// Generate daftar tahun (misal: dari 2023 sampai tahun sekarang)
const currentYear = new Date().getFullYear()
const yearsList = computed(() => {
  const years = []
  for (let y = currentYear; y >= 2023; y--) {
    years.push(y)
  }
  return years
})

const showReportModal = ref(false)
const isGeneratingPdf = ref(false)
const pdfPreviewUrl = ref(null)
const pdfFilename = ref('')
const reportType = ref('monthly')
const reportDate = ref('')
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
    if (reportType.value === 'daily') {
      if (!reportDate.value) return alert('Pilih tanggal terlebih dahulu!')
      endpoint = `/reports/daily/pdf?date=${reportDate.value}`
      filename = `Laporan_Harian_Kantin_${reportDate.value}.pdf`
    } else {
      endpoint = `/reports/monthly/pdf?month=${reportMonth.value}&year=${reportYear.value}`
      filename = `Laporan_Bulanan_Kantin_${reportYear.value}_${reportMonth.value}.pdf`
    }
    const res = await api.get(endpoint, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    pdfPreviewUrl.value = window.URL.createObjectURL(blob)
    pdfFilename.value = filename
  } catch (e) {
    console.error(e)
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
    format: 'currency',
  },
  {
    key: 'transactions',
    label: 'Total Transaksi',
    icon: 'pi-receipt',
    accent: 'text-blue-500',
    iconBg: 'bg-blue-50',
    format: 'number',
  },
  {
    key: 'avgOrder',
    label: 'Rata-rata Transaksi',
    icon: 'pi-chart-line',
    accent: 'text-amber-500',
    iconBg: 'bg-amber-50',
    format: 'currency',
  },
  {
    key: 'itemsSold',
    label: 'Item Terjual',
    icon: 'pi-shopping-bag',
    accent: 'text-purple-500',
    iconBg: 'bg-purple-50',
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
  <div class="min-h-screen bg-amber-50 font-sans">
    <!-- Topbar -->
    <header
      class="flex items-center justify-between px-5 lg:px-8 py-4 bg-white border-b border-amber-100 sticky top-0 z-20"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-orange-400 rounded-xl flex items-center justify-center shadow-sm">
          <i class="pi pi-chart-bar text-white" style="font-size: 13px"></i>
        </div>
        <div>
          <h1 class="text-sm font-extrabold text-gray-800 leading-tight tracking-tight">
            KANTIN MARDIRA
          </h1>
          <p class="text-xs text-orange-400 font-semibold">Dashboard Manager</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-semibold text-gray-700">{{ authStore.user?.name }}</p>
          <p class="text-xs text-orange-400 font-medium">Manager</p>
        </div>
        <div
          class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm ring-2 ring-orange-200"
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
          class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <i class="pi pi-sign-out" style="font-size: 14px"></i>
        </button>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-5 lg:px-8 py-8 space-y-8">
      <!-- Hero + PDF CTA -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Welcome card -->
        <div
          class="md:col-span-2 bg-white rounded-3xl border border-amber-100 shadow-sm p-7 flex flex-col justify-between gap-4 relative overflow-hidden"
        >
          <div
            class="absolute -right-8 -top-8 w-40 h-40 bg-orange-50 rounded-full opacity-60 pointer-events-none"
          ></div>
          <div
            class="absolute right-16 -bottom-6 w-24 h-24 bg-amber-50 rounded-full opacity-60 pointer-events-none"
          ></div>

          <div class="z-10">
            <span
              class="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full mb-3"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              Live · {{ currentMonthLabel }}
            </span>
            <h2 class="text-2xl font-bold text-gray-800 leading-snug">
              Selamat datang, {{ authStore.user?.name?.split(' ')[0] }}! 👋
            </h2>
            <p class="mt-2 text-sm text-gray-400 max-w-sm">
              Pantau performa penjualan kantin secara real-time dan ekspor laporan PDF dengan sekali
              klik.
            </p>
          </div>

          <div class="flex items-center gap-4 z-10">
            <div class="flex items-center gap-2 px-4 py-2.5 bg-orange-50 rounded-2xl">
              <i class="pi pi-wallet text-orange-400"></i>
              <div>
                <p class="text-xs text-gray-400 leading-none">Pendapatan</p>
                <p v-if="isLoading" class="h-4 w-20 bg-gray-200 rounded animate-pulse mt-0.5"></p>
                <p v-else class="text-sm font-bold text-gray-800 leading-tight">
                  {{ formatRupiah(stats.revenue) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-2xl">
              <i class="pi pi-receipt text-blue-400"></i>
              <div>
                <p class="text-xs text-gray-400 leading-none">Transaksi</p>
                <p v-if="isLoading" class="h-4 w-12 bg-gray-200 rounded animate-pulse mt-0.5"></p>
                <p v-else class="text-sm font-bold text-gray-800 leading-tight">
                  {{ stats.transactions }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- PDF CTA -->
        <button
          @click="openReportModal"
          class="bg-white border border-amber-100 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group shadow-sm"
        >
          <div
            class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform"
          >
            <i class="pi pi-file-pdf text-red-400 text-3xl"></i>
          </div>
          <div class="text-center">
            <p class="font-bold text-gray-800 text-sm">Buat Laporan PDF</p>
            <p class="text-xs text-gray-400 mt-0.5">Harian & bulanan</p>
          </div>
          <span
            class="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full group-hover:bg-orange-100 transition-colors"
          >
            Klik di sini →
          </span>
        </button>
      </section>

      <!-- Stat Cards -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-gray-800">Performa Bulan Ini</h3>
          <span class="text-xs text-gray-400">{{ currentMonthLabel }}</span>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in statCards"
            :key="card.key"
            class="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-4">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center"
                :class="card.iconBg"
              >
                <i :class="`pi ${card.icon} ${card.accent}`" style="font-size: 16px"></i>
              </div>
              <i class="pi pi-arrow-up-right text-gray-200" style="font-size: 12px"></i>
            </div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {{ card.label }}
            </p>
            <div v-if="isLoading" class="h-7 bg-gray-100 rounded-lg animate-pulse w-3/4"></div>
            <p v-else class="text-xl font-bold text-gray-800">
              {{ formatStat(stats[card.key], card.format) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Top Menu Table -->
      <section>
        <div class="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-6 py-5 border-b border-amber-100">
            <div>
              <h3 class="font-bold text-gray-800">Menu Paling Laku</h3>
              <p class="text-xs text-gray-400 mt-0.5">Berdasarkan data {{ currentMonthLabel }}</p>
            </div>
            <span
              class="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full ring-1 ring-orange-100"
            >
              Top 5 Terlaris
            </span>
          </div>

          <div
            v-if="topMenus.length === 0 && !isLoading"
            class="flex flex-col items-center justify-center py-16 text-gray-400"
          >
            <i class="pi pi-chart-bar text-4xl mb-3 text-amber-200"></i>
            <p class="text-sm font-medium">Belum ada data penjualan</p>
          </div>

          <DataTable v-else :value="topMenus" :loading="isLoading" :rows="5" :rowHover="true">
            <Column header="#" style="width: 72px" align="center">
              <template #body="{ index }">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full"
                  :class="rankStyle(index)"
                >
                  {{ index + 1 }}
                </span>
              </template>
            </Column>
            <Column field="menu_name" header="Nama Menu">
              <template #body="{ data }">
                <span class="font-semibold text-gray-800">{{ data.menu_name }}</span>
              </template>
            </Column>
            <Column field="total_quantity_sold" header="Terjual">
              <template #body="{ data }">
                <span
                  class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full"
                >
                  <i class="pi pi-shopping-bag" style="font-size: 10px"></i>
                  {{ data.total_quantity_sold }} pcs
                </span>
              </template>
            </Column>
            <Column field="total_revenue" header="Pendapatan">
              <template #body="{ data }">
                <span class="font-bold text-orange-500">{{
                  formatRupiah(data.total_revenue)
                }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </section>
    </main>

    <!-- Report Modal -->
    <Dialog
      v-model:visible="showReportModal"
      @hide="closeReportModal"
      modal
      :showHeader="false"
      :style="{ width: '760px', maxWidth: '95vw', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <i class="pi pi-file-pdf text-red-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Dokumen Laporan PDF</h3>
        </div>
        <button
          @click="closeReportModal"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-6 py-5 space-y-5">
        <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >Tipe Laporan</label
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="
                  () => {
                    reportType = 'daily'
                    pdfPreviewUrl = null
                  }
                "
                class="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                :class="
                  reportType === 'daily'
                    ? 'border-orange-300 bg-orange-50 text-orange-700 ring-2 ring-orange-100'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                "
              >
                <i
                  class="pi pi-calendar"
                  :class="reportType === 'daily' ? 'text-orange-500' : 'text-gray-400'"
                ></i>
                Laporan Harian
              </button>
              <button
                @click="
                  () => {
                    reportType = 'monthly'
                    pdfPreviewUrl = null
                  }
                "
                class="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                :class="
                  reportType === 'monthly'
                    ? 'border-orange-300 bg-orange-50 text-orange-700 ring-2 ring-orange-100'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                "
              >
                <i
                  class="pi pi-calendar-plus"
                  :class="reportType === 'monthly' ? 'text-orange-500' : 'text-gray-400'"
                ></i>
                Laporan Bulanan
              </button>
            </div>
          </div>

          <!-- Daily Picker -->
          <div v-if="reportType === 'daily'" class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
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

          <!-- Monthly Picker (Fixed Year Input to Dropdown) -->
          <div v-if="reportType === 'monthly'" class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >Bulan</label
              >
              <div class="relative">
                <i
                  class="pi pi-calendar absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <select
                  v-model="reportMonth"
                  class="w-full pl-9 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-gray-800 appearance-none"
                >
                  <option v-for="m in monthsList" :key="m.value" :value="m.value">
                    {{ m.label }}
                  </option>
                </select>
                <i
                  class="pi pi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 11px"
                ></i>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >Tahun</label
              >
              <div class="relative">
                <i
                  class="pi pi-hashtag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <!-- Perbaikan: Input number diganti Select -->
                <select
                  v-model="reportYear"
                  class="w-full pl-9 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all text-gray-800 appearance-none"
                >
                  <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
                </select>
                <i
                  class="pi pi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 11px"
                ></i>
              </div>
            </div>
          </div>

          <button
            @click="generatePdfPreview"
            :disabled="isGeneratingPdf"
            class="w-full flex items-center justify-center gap-2 py-3 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
          >
            <i v-if="isGeneratingPdf" class="pi pi-spin pi-spinner text-sm"></i>
            <i v-else class="pi pi-search text-sm"></i>
            {{ isGeneratingPdf ? 'Memuat dokumen...' : 'Tampilkan Preview' }}
          </button>
        </div>

        <div v-if="pdfPreviewUrl" class="animate-fadein">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-file-pdf text-red-400"></i>
              <span class="text-sm font-semibold text-gray-700">Preview Dokumen</span>
            </div>
            <button
              @click="downloadGeneratedPdf"
              class="inline-flex items-center gap-2 px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <i class="pi pi-download" style="font-size: 11px"></i> Unduh PDF
            </button>
          </div>
          <div
            class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
            style="height: 480px"
          >
            <iframe :src="pdfPreviewUrl" class="w-full h-full" title="PDF Preview"></iframe>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 px-6 pb-5">
        <button
          @click="closeReportModal"
          class="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors rounded-xl hover:bg-gray-50"
        >
          Tutup
        </button>
        <button
          @click="downloadGeneratedPdf"
          :disabled="!pdfPreviewUrl"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i class="pi pi-download" style="font-size: 11px"></i> Unduh File PDF
        </button>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.animate-fadein {
  animation: fadeIn 0.35s ease-out;
}
@keyframes fadeIn {
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
