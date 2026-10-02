<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import { showError } from '@/utils/notify'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

const transactionsHistory = ref([])
const isLoadingHistory = ref(false)
const selectedTransaction = ref(null)
const isHistoryDetailVisible = ref(false)
const fetchingDetailId = ref(null)

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
    showError('Gagal memuat detail transaksi')
  } finally {
    fetchingDetailId.value = null
  }
}

onMounted(fetchHistory)
</script>

<!-- Arsip bon hari ini: baris buku kas + detail berupa struk. -->
<template>
  <div class="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-8">
    <div class="max-w-6xl mx-auto space-y-5 sm:space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="angka-nota text-[11px] font-bold uppercase tracking-[0.22em]" style="color: var(--bata)">Arsip bon</p>
          <h2 class="text-lg sm:text-xl font-extrabold" style="color: var(--tinta)">Riwayat transaksi</h2>
          <p class="text-xs sm:text-sm mt-0.5" style="color: var(--tinta-soft)">
            Semua yang tercatat hari ini, berurutan seperti tumpukan struk.
          </p>
        </div>
        <button
          @click="fetchHistory"
          class="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-md border-2 transition-colors flex-shrink-0"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          <span class="hidden sm:inline">Muat ulang</span>
          <span class="sm:hidden">Muat</span>
        </button>
      </div>

      <div class="tabel-bon kertas rounded-md border-2 overflow-hidden" style="border-color: var(--tinta)">
        <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-dashed" style="border-color: var(--garis)">
          <div>
            <h3 class="font-extrabold text-sm sm:text-base" style="color: var(--tinta)">Tumpukan struk</h3>
            <p class="angka-nota text-[11px] uppercase tracking-[0.18em] mt-0.5" style="color: var(--tinta-soft)">
              Ketuk baris untuk membuka struk
            </p>
          </div>
          <span class="cap" style="color: var(--bata-deep)">{{ transactionsHistory.length }} bon</span>
        </div>

        <div v-if="isLoadingHistory" class="divide-y divide-dashed" style="border-color: var(--garis)">
          <div v-for="i in 5" :key="i" class="px-4 py-3.5 animate-pulse flex gap-3 items-center">
            <div class="w-9 h-9 rounded-full flex-shrink-0" style="background: var(--krem-deep)"></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3 rounded w-2/3" style="background: var(--krem-deep)"></div>
              <div class="h-3 rounded w-1/3" style="background: var(--krem-deep)"></div>
            </div>
            <div class="h-4 rounded w-20 flex-shrink-0" style="background: var(--krem-deep)"></div>
          </div>
        </div>

        <div
          v-else-if="transactionsHistory.length === 0"
          class="flex flex-col items-center justify-center py-16"
          style="color: var(--tinta-soft)"
        >
          <p class="angka-nota text-[11px] uppercase tracking-[0.22em]">Belum ada bon</p>
          <p class="text-sm font-medium mt-1">Transaksi pertama hari ini belum tercatat.</p>
        </div>

        <!-- Mobile -->
        <div v-else class="md:hidden divide-y divide-dashed" style="border-color: var(--garis)">
          <div
            v-for="trx in transactionsHistory"
            :key="trx.id"
            @click="openHistoryDetail(trx.id)"
            class="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-black/[0.03]"
            :class="{ 'opacity-60': fetchingDetailId === trx.id }"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 border-2"
              style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
            >
              {{ (trx.customer_name || 'U').charAt(0).toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <p class="text-sm font-bold truncate" style="color: var(--tinta)">
                  {{ trx.customer_name || 'Pelanggan umum' }}
                </p>
                <span class="angka-nota text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0" style="color: var(--tinta-soft)">
                  {{ trx.payment_method === 'cash' ? 'Tunai' : 'QRIS' }}
                </span>
              </div>
              <p class="angka-nota text-xs" style="color: var(--tinta-soft)">{{ trx.transaction_code }}</p>
              <p class="text-xs mt-0.5" style="color: var(--tinta-soft)">
                {{ formatDate(trx.transaction_time || trx.created_at) }}
              </p>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="angka-nota text-sm font-extrabold" style="color: var(--tinta)">{{
                formatRupiah(trx.total_amount)
              }}</span>
              <i
                :class="fetchingDetailId === trx.id ? 'pi pi-spin pi-spinner' : 'pi pi-chevron-right'"
                style="font-size: 11px; color: var(--tinta-soft)"
              ></i>
            </div>
          </div>
        </div>

        <!-- Desktop -->
        <div class="hidden md:block">
          <div v-if="isLoadingHistory" class="px-6 py-2" aria-label="Memuat riwayat">
            <div v-for="i in 6" :key="i" class="flex items-center gap-3 py-3.5 border-b border-dashed last:border-0 animate-pulse" style="border-color: var(--garis)">
              <div class="w-9 h-9 rounded-full flex-shrink-0" style="background: var(--krem-deep)"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3 rounded w-2/5" style="background: var(--krem-deep)"></div>
                <div class="h-3 rounded w-1/4" style="background: var(--krem-deep)"></div>
              </div>
              <div class="h-4 rounded w-24 flex-shrink-0" style="background: var(--krem-deep)"></div>
            </div>
          </div>
          <DataTable
            v-else
            :value="transactionsHistory"
            scrollable
            scrollHeight="calc(100vh - 280px)"
            :rowHover="true"
          >
            <template #empty>
              <div class="flex flex-col items-center justify-center py-16" style="color: var(--tinta-soft)">
                <p class="angka-nota text-[11px] uppercase tracking-[0.22em]">Belum ada bon</p>
              </div>
            </template>

            <Column field="created_at" header="Waktu">
              <template #body="{ data }">
                <span class="text-sm" style="color: var(--tinta-soft)">{{
                  formatDate(data.transaction_time || data.created_at)
                }}</span>
              </template>
            </Column>

            <Column field="transaction_code" header="Kode struk">
              <template #body="{ data }">
                <span class="angka-nota text-sm font-bold" style="color: var(--tinta)">{{
                  data.transaction_code
                }}</span>
              </template>
            </Column>

            <Column field="customer_name" header="Pemesan">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs flex-shrink-0 border"
                    style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
                  >
                    {{ (data.customer_name || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-bold" style="color: var(--tinta)">{{
                    data.customer_name || 'Pelanggan umum'
                  }}</span>
                </div>
              </template>
            </Column>

            <Column field="payment_method" header="Cara bayar">
              <template #body="{ data }">
                <span class="angka-nota text-xs font-extrabold uppercase tracking-wider">
                  {{ data.payment_method === 'cash' ? 'Tunai' : 'QRIS' }}
                </span>
              </template>
            </Column>

            <Column field="total_amount" header="Total">
              <template #body="{ data }">
                <span class="angka-nota font-extrabold" style="color: var(--tinta)">{{ formatRupiah(data.total_amount) }}</span>
              </template>
            </Column>

            <Column header="Struk" align="center" style="width: 80px">
              <template #body="{ data }">
                <button
                  @click="openHistoryDetail(data.id)"
                  :disabled="fetchingDetailId !== null"
                  class="w-8 h-8 inline-flex items-center justify-center rounded border transition-colors disabled:opacity-40"
                  style="border-color: var(--garis); color: var(--tinta)"
                  title="Lihat struk"
                >
                  <i
                    :class="fetchingDetailId === data.id ? 'pi pi-spin pi-spinner' : 'pi pi-receipt'"
                    style="font-size: 13px"
                  ></i>
                </button>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Struk pembelian -->
    <Dialog
      v-model:visible="isHistoryDetailVisible"
      modal
      :showHeader="false"
      :style="{ width: 'min(420px, calc(100vw - 2rem))', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-5 sm:px-6 pt-5 pb-4 text-center">
        <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Kantin Mardira</p>
        <p class="angka-nota text-[11px] tracking-[0.14em] uppercase" style="color: var(--tinta)">Struk pembelian · STMIK Mardira</p>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>

      <div v-if="selectedTransaction" class="kertas px-5 sm:px-6 py-5 space-y-4">
        <div class="angka-nota text-[13px] space-y-1.5">
          <div class="flex justify-between gap-3">
            <span style="color: var(--tinta-soft)">Kode</span>
            <span class="font-bold text-right" style="color: var(--tinta)">{{
              selectedTransaction.transaction_code
            }}</span>
          </div>
          <div class="flex justify-between gap-3">
            <span style="color: var(--tinta-soft)">Pemesan</span>
            <span class="font-bold" style="color: var(--tinta)">{{
              selectedTransaction.customer_name || 'Pelanggan umum'
            }}</span>
          </div>
          <div class="flex justify-between gap-3">
            <span style="color: var(--tinta-soft)">Kasir</span>
            <span style="color: var(--tinta)">{{ selectedTransaction.cashier?.name || 'Kasir' }}</span>
          </div>
        </div>

        <div class="garis-struk"></div>

        <div>
          <p class="angka-nota text-[11px] font-bold uppercase tracking-[0.2em] mb-1" style="color: var(--tinta-soft)">Isi bon</p>
          <div
            v-for="item in selectedTransaction.items"
            :key="item.id"
            class="flex justify-between items-center text-sm py-2 border-b border-dashed last:border-0"
            style="border-color: var(--garis)"
          >
            <div class="flex gap-2 items-center min-w-0">
              <span class="angka-nota w-6 h-6 rounded text-xs font-extrabold flex items-center justify-center flex-shrink-0" style="background: var(--tinta); color: var(--kertas)">
                {{ item.quantity }}
              </span>
              <span class="font-semibold truncate" style="color: var(--tinta)">{{ item.menu?.name || 'Menu terhapus' }}</span>
            </div>
            <span class="angka-nota font-bold flex-shrink-0" style="color: var(--tinta)">{{ formatRupiah(item.subtotal) }}</span>
          </div>
        </div>

        <div class="garis-struk"></div>

        <div class="angka-nota text-sm space-y-1.5">
          <div class="flex justify-between">
            <span style="color: var(--tinta-soft)">Total</span>
            <span class="font-extrabold" style="color: var(--tinta)">{{
              formatRupiah(selectedTransaction.total_amount)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span style="color: var(--tinta-soft)">Dibayar ({{ selectedTransaction.payment_method === 'cash' ? 'tunai' : 'QRIS' }})</span>
            <span style="color: var(--tinta)">{{ formatRupiah(selectedTransaction.paid_amount) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="font-bold" style="color: var(--tinta)">Kembali</span>
            <span class="font-extrabold" style="color: var(--bata-deep)">{{
              formatRupiah(selectedTransaction.change_amount)
            }}</span>
          </div>
        </div>

        <div class="flex justify-center pt-1">
          <span class="cap rotate-[-4deg]" style="color: var(--papan-deep)">Lunas</span>
        </div>
      </div>

      <div class="kertas flex gap-2 px-5 sm:px-6 pb-5">
        <button
          @click="isHistoryDetailVisible = false"
          class="flex-1 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          Tutup
        </button>
      </div>
    </Dialog>
  </div>
</template>
