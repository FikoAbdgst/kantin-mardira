<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

// State Riwayat
const transactionsHistory = ref([])
const isLoadingHistory = ref(false)
const selectedTransaction = ref(null)
const isHistoryDetailVisible = ref(false)
const fetchingDetailId = ref(null)

// Format Uang & Tanggal
const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

// API
const fetchHistory = async () => {
  isLoadingHistory.value = true
  try {
    const res = await api.get('/transactions')
    transactionsHistory.value = res.data.data || []
  } catch (e) {
    console.error('Gagal memuat riwayat:', e)
  } finally {
    isLoadingHistory.value = false
  }
}

const openHistoryDetail = async (id) => {
  if (fetchingDetailId.value !== null) return
  fetchingDetailId.value = id
  try {
    const res = await api.get(`/transactions/${id}`)
    selectedTransaction.value = res.data.data
    isHistoryDetailVisible.value = true
  } catch (e) {
    alert('Gagal memuat detail transaksi')
  } finally {
    fetchingDetailId.value = null
  }
}

onMounted(fetchHistory)
</script>

<template>
  <div class="flex-1 overflow-y-auto p-5 lg:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <p class="text-sm text-gray-400 mt-0.5">Semua transaksi yang diproses hari ini.</p>
        </div>
        <button
          @click="fetchHistory"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
        >
          <i class="pi pi-refresh text-xs"></i>
          Refresh
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-5 border-b border-amber-100">
          <div>
            <h3 class="font-bold text-gray-800">Daftar Transaksi</h3>
            <p class="text-xs text-gray-400 mt-0.5">Klik ikon mata untuk lihat detail struk</p>
          </div>
          <span
            class="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full ring-1 ring-orange-100"
          >
            {{ transactionsHistory.length }} transaksi
          </span>
        </div>

        <DataTable
          :value="transactionsHistory"
          :loading="isLoadingHistory"
          scrollable
          scrollHeight="calc(100vh - 320px)"
          :rowHover="true"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 text-gray-400">
              <i class="pi pi-receipt text-4xl mb-3 text-amber-200"></i>
              <p class="text-sm font-medium">Belum ada riwayat transaksi.</p>
            </div>
          </template>

          <Column field="created_at" header="Waktu">
            <template #body="{ data }">
              <span class="text-sm text-gray-500">
                {{ formatDate(data.transaction_time || data.created_at) }}
              </span>
            </template>
          </Column>

          <Column field="transaction_code" header="Kode Struk">
            <template #body="{ data }">
              <span class="font-mono text-sm font-semibold text-gray-700">
                {{ data.transaction_code }}
              </span>
            </template>
          </Column>

          <Column field="customer_name" header="Pemesan">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div
                  class="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0"
                >
                  {{ (data.customer_name || 'U').charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium text-gray-800">
                  {{ data.customer_name || 'Pelanggan Umum' }}
                </span>
              </div>
            </template>
          </Column>

          <Column field="payment_method" header="Metode">
            <template #body="{ data }">
              <span
                class="px-2.5 py-1 text-xs font-bold tracking-wide uppercase rounded-lg"
                :class="
                  data.payment_method === 'cash'
                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                    : 'bg-purple-50 text-purple-600 ring-1 ring-purple-100'
                "
              >
                <i
                  :class="data.payment_method === 'cash' ? 'pi pi-money-bill' : 'pi pi-qrcode'"
                  class="mr-1"
                  style="font-size: 10px"
                ></i>
                {{ data.payment_method }}
              </span>
            </template>
          </Column>

          <Column field="total_amount" header="Total">
            <template #body="{ data }">
              <span class="font-bold text-orange-500">
                {{ formatRupiah(data.total_amount) }}
              </span>
            </template>
          </Column>

          <Column header="Aksi" align="center" style="width: 80px">
            <template #body="{ data }">
              <button
                @click="openHistoryDetail(data.id)"
                :disabled="fetchingDetailId !== null"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-colors disabled:opacity-40"
                title="Lihat Detail"
              >
                <i
                  :class="fetchingDetailId === data.id ? 'pi pi-spin pi-spinner' : 'pi pi-eye'"
                  style="font-size: 13px"
                ></i>
              </button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Detail Dialog -->
    <Dialog
      v-model:visible="isHistoryDetailVisible"
      modal
      :showHeader="false"
      :style="{ width: '420px', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <!-- Dialog Header -->
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <i class="pi pi-receipt text-orange-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Struk Pembelian</h3>
        </div>
        <button
          @click="isHistoryDetailVisible = false"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div v-if="selectedTransaction" class="px-6 py-5 space-y-4">
        <!-- Info -->
        <div class="bg-amber-50 rounded-2xl p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Kode Transaksi</span>
            <span class="font-bold font-mono text-gray-800">{{
              selectedTransaction.transaction_code
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Nama Pemesan</span>
            <span class="font-medium text-gray-800">{{
              selectedTransaction.customer_name || 'Pelanggan Umum'
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Kasir</span>
            <span class="text-gray-800">{{ selectedTransaction.cashier?.name || 'Kasir' }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Item Pesanan</p>
          <div
            v-for="item in selectedTransaction.items"
            :key="item.id"
            class="flex justify-between items-center text-sm py-2 border-b border-dashed border-gray-100 last:border-0"
          >
            <div class="flex gap-2 items-center">
              <span
                class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0"
              >
                {{ item.quantity }}
              </span>
              <span class="text-gray-800">{{ item.menu?.name || 'Menu Terhapus' }}</span>
            </div>
            <span class="font-semibold text-gray-700">{{ formatRupiah(item.subtotal) }}</span>
          </div>
        </div>

        <!-- Totals -->
        <div class="bg-gray-50 rounded-2xl p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Total Tagihan</span>
            <span class="font-bold text-gray-800">{{
              formatRupiah(selectedTransaction.total_amount)
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">
              Uang Diterima
              <span
                class="uppercase font-semibold text-xs ml-1 px-1.5 py-0.5 bg-white rounded-md ring-1 ring-gray-200"
              >
                {{ selectedTransaction.payment_method }}
              </span>
            </span>
            <span class="text-gray-800">{{ formatRupiah(selectedTransaction.paid_amount) }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-dashed border-gray-200 pt-2 mt-1"
          >
            <span class="font-semibold text-gray-600">Kembalian</span>
            <span class="font-bold text-orange-500">{{
              formatRupiah(selectedTransaction.change_amount)
            }}</span>
          </div>
        </div>
      </div>

      <div class="flex gap-2 px-6 pb-5">
        <button
          @click="isHistoryDetailVisible = false"
          class="flex-1 py-2.5 text-sm text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Tutup
        </button>
      </div>
    </Dialog>
  </div>
</template>
