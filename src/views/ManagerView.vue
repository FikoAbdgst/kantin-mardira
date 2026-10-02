<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'
import { showError, showWarning } from '@/utils/notify'

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
      if (!reportDate.value) return showWarning('Pilih tanggal terlebih dahulu!')
      endpoint = `/reports/daily/pdf?date=${reportDate.value}`
      filename = `Laporan_Harian_Kantin_${reportDate.value}.pdf`
    } else if (reportType.value === 'weekly') {
      if (!reportStartDate.value || !reportEndDate.value) {
        return showWarning('Pilih tanggal mulai dan tanggal akhir terlebih dahulu!')
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
    showError('Gagal memuat dokumen PDF. Pastikan terdapat data transaksi pada waktu tersebut.')
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
    bar: '#a63a26',
    format: 'currency',
  },
  {
    key: 'transactions',
    label: 'Total Transaksi',
    bar: '#20493a',
    format: 'number',
  },
  {
    key: 'avgOrder',
    label: 'Rata-rata Transaksi',
    bar: '#c99a12',
    format: 'currency',
  },
  {
    key: 'itemsSold',
    label: 'Item Terjual',
    bar: '#2a2118',
    format: 'number',
  },
]

const formatStat = (val, format) =>
  format === 'currency' ? formatRupiah(val) : (val || 0).toLocaleString('id-ID')

onMounted(fetchData)
</script>

<template>
  <div class="dinding min-h-screen">
    <header
      class="kertas flex items-center justify-between px-4 sm:px-5 lg:px-8 py-3 sm:py-4 border-b-2 sticky top-0 z-20"
      style="border-color: var(--tinta)"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 sm:w-9 sm:h-9 rounded flex items-center justify-center flex-shrink-0 angka-nota font-extrabold text-sm"
          style="background: var(--bata); color: #fdf6e9"
        >
          KM
        </div>
        <div class="hidden sm:block">
          <h1
            class="text-sm font-extrabold leading-none tracking-[0.08em] uppercase"
            style="color: var(--tinta)"
          >
            Kantin Mardira
          </h1>
          <p
            class="angka-nota text-[11px] uppercase tracking-[0.2em] mt-0.5"
            style="color: var(--tinta-soft)"
          >
            Buku besar manager
          </p>
        </div>
        <span class="sm:hidden text-sm font-extrabold" style="color: var(--tinta)">Buku besar</span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="openReportModal"
          class="btn-bata sm:hidden flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all active:scale-95"
        >
          PDF
        </button>

        <div class="hidden sm:block text-right">
          <p class="text-sm font-bold" style="color: var(--tinta)">{{ authStore.user?.name }}</p>
          <p
            class="angka-nota text-[11px] uppercase tracking-[0.18em]"
            style="color: var(--tinta-soft)"
          >
            Manager
          </p>
        </div>
        <div
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 border-2"
          style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
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
          class="h-9 px-3 flex items-center gap-1.5 rounded text-xs font-bold uppercase tracking-wider border-2 transition-colors hover:text-white"
          style="border-color: var(--tinta); color: var(--tinta)"
          onmouseover="this.style.background = 'red'"
          onmouseout="this.style.background = 'transparent'"
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
          class="papan-tulis sm:col-span-2 rounded-md p-5 sm:p-7 flex flex-col justify-between gap-4 relative overflow-hidden"
        >
          <div class="relative z-10">
            <p class="angka-nota kapur-redup text-[11px] uppercase tracking-[0.22em] mb-2">
              Rekap · {{ currentMonthLabel }}
            </p>
            <h2 class="tulisan-kapur text-xl sm:text-2xl font-extrabold leading-snug">
              Halo, {{ authStore.user?.name?.split(' ')[0] }}!
            </h2>
            <p class="kapur-redup mt-1.5 text-sm max-w-sm leading-relaxed">
              Catatan kapur bulan berjalan — pantau laci, lalu cetak laporan PDF.
            </p>
          </div>

          <div class="flex items-center gap-3 relative z-10 flex-wrap">
            <div class="rounded px-3.5 py-2.5" style="background: rgba(255, 255, 255, 0.07)">
              <p class="kapur-redup angka-nota text-[10px] uppercase tracking-[0.2em] leading-none">
                Pendapatan
              </p>
              <div
                v-if="isLoading"
                class="h-3.5 w-20 rounded animate-pulse mt-1"
                style="background: rgba(255, 255, 255, 0.2)"
              ></div>
              <p
                v-else
                class="angka-nota tulisan-kapur text-base font-extrabold leading-tight mt-0.5"
              >
                {{ formatRupiah(stats.revenue) }}
              </p>
            </div>
            <div class="rounded px-3.5 py-2.5" style="background: rgba(255, 255, 255, 0.07)">
              <p class="kapur-redup angka-nota text-[10px] uppercase tracking-[0.2em] leading-none">
                Transaksi
              </p>
              <div
                v-if="isLoading"
                class="h-3.5 w-10 rounded animate-pulse mt-1"
                style="background: rgba(255, 255, 255, 0.2)"
              ></div>
              <p
                v-else
                class="angka-nota tulisan-kapur text-base font-extrabold leading-tight mt-0.5"
              >
                {{ stats.transactions }}
              </p>
            </div>
          </div>
        </div>

        <button
          @click="openReportModal"
          class="nota-slip hidden sm:flex rounded-md border p-6 flex-col items-center justify-center gap-3 transition-all hover:-translate-y-0.5 group"
          style="border-color: rgba(42, 33, 24, 0.45); box-shadow: 0 2px 0 rgba(42, 33, 24, 0.45)"
        >
          <span class="cap" style="color: var(--bata-deep)">Arsip PDF</span>
          <div class="text-center">
            <p class="font-extrabold text-sm" style="color: var(--tinta)">Laporan PDF</p>
            <p
              class="angka-nota text-[11px] uppercase tracking-[0.16em] mt-0.5"
              style="color: var(--tinta-soft)"
            >
              Harian · Mingguan · Bulanan
            </p>
          </div>
          <span
            class="text-xs font-extrabold uppercase tracking-[0.14em] underline underline-offset-4"
            style="color: var(--bata-deep)"
            >Buat laporan</span
          >
        </button>
      </section>

      <section>
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h3 class="text-sm sm:text-base font-extrabold" style="color: var(--tinta)">
            Performa bulan ini
          </h3>
          <span
            class="angka-nota text-xs uppercase tracking-[0.16em]"
            style="color: var(--tinta-soft)"
            >{{ currentMonthLabel }}</span
          >
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="(card, idx) in statCards"
            :key="card.key"
            class="kertas rounded-md border-2 p-4 sm:p-5 transition-all hover:-translate-y-0.5"
            style="border-color: var(--tinta)"
            :style="{ animationDelay: `${idx * 60}ms` }"
          >
            <div class="flex items-start justify-between mb-3 sm:mb-4">
              <span class="angka-nota text-[11px] font-extrabold" :style="{ color: card.bar }">
                {{ String(idx + 1).padStart(2, '0') }}
              </span>
              <div
                class="w-8 h-1 rounded-full mt-1.5"
                :style="{ background: card.bar, opacity: 0.85 }"
              ></div>
            </div>
            <p
              class="angka-nota text-[11px] font-bold uppercase tracking-[0.16em] leading-tight mb-1"
              style="color: var(--tinta-soft)"
            >
              {{ card.label }}
            </p>
            <div
              v-if="isLoading"
              class="h-6 sm:h-7 rounded animate-pulse w-3/4 mt-1"
              style="background: var(--krem-deep)"
            ></div>
            <p
              v-else
              class="angka-nota text-lg sm:text-xl font-extrabold leading-tight"
              style="color: var(--tinta)"
            >
              {{ formatStat(stats[card.key], card.format) }}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div class="kertas rounded-md border-2 overflow-hidden" style="border-color: var(--tinta)">
          <div
            class="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-dashed"
            style="border-color: var(--garis)"
          >
            <div>
              <h3 class="font-extrabold text-sm sm:text-base" style="color: var(--tinta)">
                Menu paling laku
              </h3>
              <p
                class="angka-nota text-[11px] uppercase tracking-[0.16em] mt-0.5"
                style="color: var(--tinta-soft)"
              >
                Data {{ currentMonthLabel }}
              </p>
            </div>
            <span class="cap" style="color: var(--bata-deep)">Top 5</span>
          </div>

          <div
            v-if="topMenus.length === 0 && !isLoading"
            class="flex flex-col items-center justify-center py-16"
            style="color: var(--tinta-soft)"
          >
            <p class="angka-nota text-[11px] uppercase tracking-[0.22em]">Belum ada catatan</p>
            <p class="text-sm font-medium mt-1">Belum ada data penjualan.</p>
          </div>

          <div
            v-else-if="!isLoading"
            class="md:hidden divide-y divide-dashed"
            style="border-color: var(--garis)"
          >
            <div
              v-for="(item, index) in topMenus.slice(0, 5)"
              :key="index"
              class="flex items-center gap-3 px-4 py-3.5"
            >
              <span
                class="angka-nota w-8 h-8 flex items-center justify-center text-xs font-extrabold rounded-full border-2 flex-shrink-0"
                :style="
                  index === 0
                    ? 'background: var(--nota); border-color: var(--tinta); color: var(--tinta)'
                    : 'border-color: var(--garis); color: var(--tinta-soft)'
                "
                >{{ index + 1 }}</span
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate" style="color: var(--tinta)">
                  {{ item.menu_name }}
                </p>
                <p class="angka-nota text-xs mt-0.5" style="color: var(--tinta-soft)">
                  {{ item.total_quantity_sold }} pcs terjual
                </p>
              </div>
              <span
                class="angka-nota text-sm font-extrabold flex-shrink-0"
                style="color: var(--tinta)"
                >{{ formatRupiah(item.total_revenue) }}</span
              >
            </div>
          </div>

          <div v-else class="md:hidden divide-y divide-dashed" style="border-color: var(--garis)">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3 px-4 py-3.5 animate-pulse">
              <div
                class="w-8 h-8 rounded-full flex-shrink-0"
                style="background: var(--krem-deep)"
              ></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 rounded w-2/3" style="background: var(--krem-deep)"></div>
                <div class="h-3 rounded w-1/3" style="background: var(--krem-deep)"></div>
              </div>
              <div
                class="h-4 rounded w-20 flex-shrink-0"
                style="background: var(--krem-deep)"
              ></div>
            </div>
          </div>

          <div class="hidden md:block">
            <DataTable :value="topMenus" :loading="isLoading" :rows="5" :rowHover="true">
              <Column header="#" style="width: 72px" align="center">
                <template #body="{ index }">
                  <span
                    class="angka-nota inline-flex items-center justify-center w-8 h-8 text-xs font-extrabold rounded-full border-2"
                    :style="
                      index === 0
                        ? 'background: var(--nota); border-color: var(--tinta); color: var(--tinta)'
                        : 'border-color: var(--garis); color: var(--tinta-soft)'
                    "
                    >{{ index + 1 }}</span
                  >
                </template>
              </Column>
              <Column field="menu_name" header="Nama Menu">
                <template #body="{ data }"
                  ><span class="font-bold" style="color: var(--tinta)">{{
                    data.menu_name
                  }}</span></template
                >
              </Column>
              <Column field="total_quantity_sold" header="Terjual">
                <template #body="{ data }">
                  <span class="angka-nota text-xs font-extrabold">
                    {{ data.total_quantity_sold }} pcs
                  </span>
                </template>
              </Column>
              <Column field="total_revenue" header="Pendapatan">
                <template #body="{ data }">
                  <span class="angka-nota font-extrabold" style="color: var(--tinta)">{{
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
        borderRadius: '0.6rem',
        overflow: 'hidden',
      }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-5 sm:px-6 pt-5 pb-4">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase"
              style="color: var(--bata-deep)"
            >
              Dokumen laporan
            </p>
            <p class="text-sm font-bold" style="color: var(--tinta)">Cetak PDF rekap kantin</p>
          </div>
          <button
            @click="closeReportModal"
            class="w-7 h-7 flex items-center justify-center rounded border-2"
            style="border-color: var(--tinta); color: var(--tinta)"
            aria-label="Tutup"
          >
            <i class="pi pi-times" style="font-size: 11px"></i>
          </button>
        </div>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>

      <div class="kertas px-5 sm:px-6 py-5 space-y-5">
        <div class="rounded-md border-2 p-4 sm:p-5 space-y-4" style="border-color: var(--garis)">
          <div class="flex flex-col gap-2">
            <span
              class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]"
              style="color: var(--tinta-soft)"
              >Tipe laporan</span
            >
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="type in [
                  { val: 'daily', label: 'Harian' },
                  { val: 'weekly', label: 'Mingguan' },
                  { val: 'monthly', label: 'Bulanan' },
                ]"
                :key="type.val"
                @click="
                  () => {
                    reportType = type.val
                    pdfPreviewUrl = null
                  }
                "
                class="px-3 sm:px-4 py-3 rounded-md border-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all"
                :style="
                  reportType === type.val
                    ? 'border-color: var(--tinta); background: var(--tinta); color: var(--kertas)'
                    : 'border-color: var(--garis); color: var(--tinta-soft); background: transparent'
                "
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <div v-if="reportType === 'daily'" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
              >Tanggal Transaksi</label
            >
            <div class="relative">
              <input
                v-model="reportDate"
                type="date"
                class="w-full px-4 py-3 text-sm rounded-md border-2 bg-white/70 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div v-if="reportType === 'weekly'" class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                >Mulai Tanggal</label
              >
              <div>
                <input
                  v-model="reportStartDate"
                  type="date"
                  class="w-full px-4 py-3 text-sm rounded-md border-2 bg-white/70 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                >Sampai Tanggal</label
              >
              <div>
                <input
                  v-model="reportEndDate"
                  type="date"
                  class="w-full px-4 py-3 text-sm rounded-md border-2 bg-white/70 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div v-if="reportType === 'monthly'" class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Bulan</label>
              <div>
                <select
                  v-model="reportMonth"
                  class="w-full px-4 py-3 text-sm rounded-md border-2 bg-white/70 focus:outline-none transition-colors"
                >
                  <option v-for="m in monthsList" :key="m.value" :value="m.value">
                    {{ m.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tahun</label>
              <div>
                <select
                  v-model="reportYear"
                  class="w-full px-4 py-3 text-sm rounded-md border-2 bg-white/70 focus:outline-none transition-colors"
                >
                  <option v-for="year in yearsList" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>
          </div>

          <button
            @click="generatePdfPreview"
            :disabled="isGeneratingPdf"
            class="btn-bata w-full flex items-center justify-center gap-2 py-3 text-sm font-extrabold uppercase tracking-[0.12em] rounded-md transition-all active:scale-95 disabled:opacity-60"
          >
            <i v-if="isGeneratingPdf" class="pi pi-spin pi-spinner"></i>
            {{ isGeneratingPdf ? 'Memuat dokumen...' : 'Tampilkan Preview' }}
          </button>
        </div>

        <div v-if="pdfPreviewUrl" class="pdf-fadein">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span
                class="angka-nota text-[11px] font-extrabold uppercase tracking-[0.2em]"
                style="color: var(--bata-deep)"
                >Pratinjau</span
              >
              <span class="text-sm font-bold" style="color: var(--tinta)">Dokumen</span>
            </div>
            <button
              @click="downloadGeneratedPdf"
              class="btn-bata inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider rounded transition-all active:scale-95"
            >
              Unduh PDF
            </button>
          </div>
          <div
            class="rounded-md overflow-hidden border-2"
            style="height: min(480px, 50vh); border-color: var(--tinta)"
          >
            <iframe :src="pdfPreviewUrl" class="w-full h-full" title="PDF Preview"></iframe>
          </div>
        </div>
      </div>

      <div class="kertas flex items-center justify-end gap-2 px-5 sm:px-6 pb-5 pt-1">
        <button
          @click="closeReportModal"
          class="px-4 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          Tutup
        </button>
        <button
          @click="downloadGeneratedPdf"
          :disabled="!pdfPreviewUrl"
          class="btn-bata inline-flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold uppercase tracking-[0.12em] rounded-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Unduh File PDF
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
