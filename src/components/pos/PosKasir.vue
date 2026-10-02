<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import api from '@/utils/axios'
import { getImageUrl, handleImageError } from '@/utils/image'
import { showError, showSuccess } from '@/utils/notify'

import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'

const cartStore = useCartStore()
const emit = defineEmits(['transaction-success'])

// State POS
const categories = ref(['Semua']) // State baru untuk menyimpan daftar kategori dari API
const menus = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('Semua')

// State Checkout
const isCheckoutVisible = ref(false)
const selectedPayment = ref('cash')
const paidAmount = ref(0)
const customerName = ref('')
const isSubmitting = ref(false)

// Mobile cart sheet
const isCartSheetOpen = ref(false)

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

const filteredMenus = computed(() => {
  return menus.value.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    // Menggunakan optional chaining untuk mencocokkan nama kategori
    const matchCat = activeCategory.value === 'Semua' || m.category?.name === activeCategory.value
    return matchSearch && matchCat && m.is_available !== false
  })
})

const isMenuInCart = (menuId) => cartStore.items.some((item) => item.id === menuId)

const cartQty = (menuId) => cartStore.items.find((item) => item.id === menuId)?.qty || 0

// Fungsi untuk mengambil semua kategori (termasuk yang kosong)
const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    if (res.data.success) {
      const catNames = res.data.data.map((c) => c.name)
      categories.value = ['Semua', ...catNames]
    }
  } catch (e) {
    console.error('Gagal memuat kategori:', e)
  }
}

const fetchMenus = async () => {
  try {
    const res = await api.get('/menus')
    menus.value = res.data.data
  } catch (e) {
    console.error('Gagal memuat menu:', e)
  } finally {
    isLoading.value = false
  }
}

const openCheckout = () => {
  customerName.value = ''
  paidAmount.value = cartStore.totalPrice
  selectedPayment.value = 'cash'
  isCartSheetOpen.value = false
  isCheckoutVisible.value = true
}

const submitTransaction = async () => {
  if (selectedPayment.value === 'cash' && paidAmount.value < cartStore.totalPrice) {
    showError('Uang tunai kurang dari total belanja!')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      customer_name: customerName.value,
      payment_method: selectedPayment.value,
      paid_amount: selectedPayment.value === 'cash' ? paidAmount.value : cartStore.totalPrice,
      items: cartStore.items.map((item) => ({ menu_id: item.id, quantity: item.qty })),
    }
    const res = await api.post('/transactions', payload)
    if (res.data.success) {
      showSuccess(
        'Transaksi berhasil',
        `Kembalian: ${formatRupiah(res.data.data.change_amount || 0)}`,
      )
      cartStore.clearCart()
      isCheckoutVisible.value = false
      emit('transaction-success')
    }
  } catch (e) {
    showError(e.response?.data?.message || 'Terjadi kesalahan saat checkout')
  } finally {
    isSubmitting.value = false
  }
}

// Memanggil fetchCategories dan fetchMenus saat komponen di-mount
onMounted(() => {
  fetchCategories()
  fetchMenus()
})
</script>

<!-- Meja kasir: label harga fisik + nota berjalan. Kartu = slip nota bergerigi. -->
<template>
  <div class="flex flex-1 overflow-hidden min-h-0 relative">
    <section class="flex flex-col flex-1 overflow-hidden min-w-0">
      <div class="kertas px-4 sm:px-5 lg:px-6 pt-4 pb-2 border-b-2" style="border-color: var(--tinta)">
        <div class="relative mb-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari di papan menu… mis. geprek"
            aria-label="Cari menu"
            class="w-full px-4 py-2.5 rounded-md border-2 bg-white/70 text-sm placeholder:text-stone-400 focus:outline-none transition-colors"
            style="border-color: var(--garis); color: var(--tinta)"
            onfocus="this.style.borderColor='var(--bata)'"
            onblur="this.style.borderColor='var(--garis)'"
          />
        </div>

        <!-- Filter ledger: indeks + nama + garis bawah tinta. Bukan pil. -->
        <div class="flex gap-4 sm:gap-5 pb-1 overflow-x-auto" role="tablist" aria-label="Kategori menu" style="scrollbar-width: none">
          <button
            v-for="(cat, i) in categories"
            :key="cat"
            @click="activeCategory = cat"
            role="tab"
            :aria-selected="activeCategory === cat"
            class="shrink-0 pb-1.5 pt-1 text-xs font-bold uppercase tracking-[0.14em] border-b-[3px] transition-colors whitespace-nowrap"
            :style="activeCategory === cat
              ? 'color: var(--bata-deep); border-color: var(--bata)'
              : 'color: var(--tinta-soft); border-color: transparent'"
          >
            <span class="angka-nota mr-1.5 font-bold" :style="activeCategory === cat ? 'color: var(--bata)' : 'color: #b3a687'">{{ String(i).padStart(2, '0') }}</span>{{ cat }}
          </button>
        </div>
      </div>

      <div class="flex-1 p-4 sm:p-5 overflow-y-auto pb-28 sm:pb-5">
        <div
          v-if="isLoading"
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="kertas border rounded-b-xl rounded-t-sm overflow-hidden animate-pulse"
            style="border-color: var(--garis)"
          >
            <div class="h-24 sm:h-28" style="background: var(--krem-deep)"></div>
            <div class="p-3 space-y-2">
              <div class="h-3 rounded w-3/4" style="background: var(--krem-deep)"></div>
              <div class="h-3 rounded w-1/2" style="background: var(--krem-deep)"></div>
            </div>
          </div>
        </div>

        <div
          v-else-if="filteredMenus.length === 0"
          class="flex flex-col items-center justify-center h-40"
          style="color: var(--tinta-soft)"
        >
          <p class="angka-nota text-xs uppercase tracking-[0.2em]">Papan kosong</p>
          <p class="text-sm font-medium mt-1">Menu tidak ditemukan — coba kata lain.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <article
            v-for="(menu, idx) in filteredMenus"
            :key="menu.id"
            @click="!isMenuInCart(menu.id) && cartStore.addToCart(menu)"
            @keydown.enter="!isMenuInCart(menu.id) && cartStore.addToCart(menu)"
            tabindex="0"
            :aria-disabled="isMenuInCart(menu.id)"
            class="nota-slip relative flex flex-col transition-all duration-200 border-2"
            :class="[
              idx % 3 === 0 ? 'rounded-t-[3px] rounded-b-[14px]' : idx % 3 === 1 ? 'rounded-t-[3px] rounded-b-[8px]' : 'rounded-t-[3px] rounded-b-[18px_10px]',
              isMenuInCart(menu.id)
                ? 'cursor-default'
                : 'cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]',
            ]"
            :style="isMenuInCart(menu.id) ? 'border-color: var(--tinta)' : 'border-color: rgba(42,33,24,.45); box-shadow: 0 2px 0 rgba(42,33,24,.45)'"
          >
            <div class="relative overflow-hidden mx-2.5 mt-2.5 rounded-[3px] border" style="height: 96px; border-color: rgba(42,33,24,.4)">
              <img
                :src="getImageUrl(menu?.image_url)"
                @error="handleImageError"
                loading="lazy"
                decoding="async"
                class="object-cover w-full h-full"
                :alt="menu.name"
              />
              <span
                v-if="isMenuInCart(menu.id)"
                class="angka-nota absolute top-1.5 right-1.5 px-2 py-0.5 text-[11px] font-extrabold rounded border-2"
                style="background: var(--tinta); border-color: var(--tinta); color: var(--kertas)"
              >
                ×{{ cartQty(menu.id) }}
              </span>
            </div>

            <div class="sobek sobek-kuning my-0" aria-hidden="true"></div>

            <div class="px-2.5 pb-2.5 pt-1">
              <h3 class="text-[13px] sm:text-sm font-bold truncate leading-tight" style="color: var(--tinta)">
                {{ menu.name }}
              </h3>
              <div class="mt-1 flex items-baseline justify-between gap-2">
                <p class="angka-nota text-[13px] sm:text-sm font-extrabold" style="color: var(--tinta)">
                  {{ formatRupiah(menu.price) }}
                </p>
                <p
                  v-if="menu.stock <= 5"
                  class="angka-nota text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap"
                  style="color: var(--bata-deep)"
                >
                  {{ menu.stock <= 0 ? 'Habis' : `Sisa ${menu.stock}` }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ===== NOTA BERJALAN (desktop) ===== -->
    <aside class="kertas hidden lg:flex flex-col w-80 border-l-2 flex-shrink-0" style="border-color: var(--tinta)">
      <div class="px-5 py-4 border-b border-dashed" style="border-color: var(--garis)">
        <div class="flex items-center justify-between">
          <h2 class="angka-nota text-xs font-extrabold uppercase tracking-[0.22em]" style="color: var(--tinta)">Nota berjalan</h2>
          <span
            v-if="cartStore.items.length > 0"
            class="angka-nota text-[11px] font-bold uppercase tracking-wider underline underline-offset-2 cursor-pointer"
            style="color: var(--bata-deep)"
            @click="cartStore.clearCart()"
          >
            Sobek semua
          </span>
        </div>
      </div>

      <div class="flex-1 px-5 py-3 overflow-y-auto">
        <div
          v-if="cartStore.items.length === 0"
          class="flex flex-col items-center justify-center h-full gap-1 py-10 text-center"
        >
          <p class="angka-nota text-[11px] uppercase tracking-[0.22em]" style="color: var(--tinta-soft)">Kertas kosong</p>
          <p class="text-sm font-medium" style="color: var(--tinta-soft)">Ketuk label menu untuk mencatat.</p>
        </div>

        <div v-else>
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex items-center gap-2.5 py-2.5 border-b border-dashed last:border-0"
            style="border-color: var(--garis)"
          >
            <button
              @click="cartStore.deleteItem(item.id)"
              aria-label="Hapus item"
              class="w-7 h-7 flex items-center justify-center rounded transition-colors flex-shrink-0 hover:text-white"
              style="color: var(--bata-deep)"
              onmouseover="this.style.background='var(--bata)'"
              onmouseout="this.style.background='transparent'"
            >
              <i class="pi pi-trash text-xs"></i>
            </button>
            <img
              :src="getImageUrl(item?.image_url)"
              @error="handleImageError"
              loading="lazy"
              decoding="async"
              class="w-9 h-9 object-cover rounded-[3px] border flex-shrink-0"
              style="border-color: var(--garis)"
              :alt="item.name"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate" style="color: var(--tinta)">{{ item.name }}</p>
              <p class="angka-nota text-xs font-bold" style="color: var(--tinta-soft)">
                {{ formatRupiah(item.price * item.qty) }}
              </p>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                @click="cartStore.removeFromCart(item.id)"
                :disabled="item.qty === 1"
                aria-label="Kurangi"
                class="w-6 h-6 rounded text-xs flex items-center justify-center border transition-colors disabled:opacity-30"
                style="border-color: var(--tinta); color: var(--tinta)"
              >
                <i class="pi pi-minus" style="font-size: 9px"></i>
              </button>
              <span class="angka-nota w-5 text-sm font-extrabold text-center" style="color: var(--tinta)">{{ item.qty }}</span>
              <button
                @click="cartStore.addToCart(item)"
                aria-label="Tambah"
                class="w-6 h-6 rounded text-xs flex items-center justify-center transition-colors"
                style="background: var(--tinta); color: var(--kertas)"
              >
                <i class="pi pi-plus" style="font-size: 9px"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-4 border-t-2" style="border-color: var(--tinta)">
        <div class="mb-3 space-y-1">
          <div class="flex justify-between text-sm" style="color: var(--tinta-soft)">
            <span>Subtotal</span>
            <span class="angka-nota">{{ formatRupiah(cartStore.totalPrice) }}</span>
          </div>
          <div class="flex justify-between font-extrabold" style="color: var(--tinta)">
            <span>Total</span>
            <span class="angka-nota text-xl">{{ formatRupiah(cartStore.totalPrice) }}</span>
          </div>
        </div>
        <button
          @click="openCheckout"
          :disabled="cartStore.items.length === 0"
          class="btn-bata w-full py-3.5 rounded-md font-extrabold text-sm uppercase tracking-[0.14em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Proses Pembayaran
        </button>
      </div>
    </aside>

    <!-- Tombol nota mengambang (mobile) -->
    <div
      class="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm"
    >
      <button
        v-if="cartStore.items.length > 0"
        @click="isCartSheetOpen = true"
        class="btn-bata w-full flex items-center justify-between px-4 py-3.5 rounded-md transition-all active:scale-95"
      >
        <div class="flex items-center gap-2">
          <span class="angka-nota w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs font-extrabold">
            {{ cartStore.items.reduce((s, i) => s + i.qty, 0) }}
          </span>
          <span class="text-sm font-bold">Lihat nota</span>
        </div>
        <span class="angka-nota text-sm font-extrabold">{{ formatRupiah(cartStore.totalPrice) }}</span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isCartSheetOpen"
          class="lg:hidden fixed inset-0 bg-black/40 z-40"
          @click="isCartSheetOpen = false"
        />
      </Transition>

      <Transition name="slide-up">
        <div
          v-if="isCartSheetOpen"
          class="kertas lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border-t max-h-[85vh] flex flex-col"
          style="border-color: var(--tinta)"
        >
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full" style="background: var(--garis)"></div>
          </div>

          <div class="flex items-center justify-between px-5 py-3 border-b border-dashed" style="border-color: var(--garis)">
            <h2 class="angka-nota text-xs font-extrabold uppercase tracking-[0.22em]">Nota berjalan</h2>
            <div class="flex items-center gap-3">
              <span
                v-if="cartStore.items.length > 0"
                class="angka-nota text-[11px] font-bold uppercase underline underline-offset-2 cursor-pointer"
                style="color: var(--bata-deep)"
                @click="cartStore.clearCart()"
              >
                Sobek semua
              </span>
              <button
                @click="isCartSheetOpen = false"
                aria-label="Tutup nota"
                class="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5"
                style="color: var(--tinta-soft)"
              >
                <i class="pi pi-times" style="font-size: 11px"></i>
              </button>
            </div>
          </div>

          <div class="flex-1 px-5 py-3 overflow-y-auto">
            <div
              v-if="cartStore.items.length === 0"
              class="flex flex-col items-center justify-center py-10 gap-1"
              style="color: var(--tinta-soft)"
            >
              <p class="angka-nota text-[11px] uppercase tracking-[0.22em]">Kertas kosong</p>
              <p class="text-sm">Ketuk label menu untuk mencatat.</p>
            </div>
            <div v-else>
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex items-center gap-2.5 py-2.5 border-b border-dashed last:border-0"
                style="border-color: var(--garis)"
              >
                <button
                  @click="cartStore.deleteItem(item.id)"
                  aria-label="Hapus item"
                  class="w-7 h-7 flex items-center justify-center rounded flex-shrink-0"
                  style="color: var(--bata-deep)"
                >
                  <i class="pi pi-trash text-xs"></i>
                </button>
                <img
                  :src="getImageUrl(item?.image_url)"
                  @error="handleImageError"
                  loading="lazy"
                  decoding="async"
                  class="w-9 h-9 object-cover rounded-[3px] border flex-shrink-0"
                  style="border-color: var(--garis)"
                  :alt="item.name"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold truncate" style="color: var(--tinta)">{{ item.name }}</p>
                  <p class="angka-nota text-xs font-bold" style="color: var(--tinta-soft)">
                    {{ formatRupiah(item.price * item.qty) }}
                  </p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button
                    @click="cartStore.removeFromCart(item.id)"
                    :disabled="item.qty === 1"
                    aria-label="Kurangi"
                    class="w-7 h-7 rounded text-sm flex items-center justify-center border transition-colors disabled:opacity-30"
                    style="border-color: var(--tinta); color: var(--tinta)"
                  >
                    <i class="pi pi-minus" style="font-size: 9px"></i>
                  </button>
                  <span class="angka-nota w-6 text-sm font-extrabold text-center" style="color: var(--tinta)">{{
                    item.qty
                  }}</span>
                  <button
                    @click="cartStore.addToCart(item)"
                    aria-label="Tambah"
                    class="w-7 h-7 rounded text-sm flex items-center justify-center"
                    style="background: var(--tinta); color: var(--kertas)"
                  >
                    <i class="pi pi-plus" style="font-size: 9px"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 py-4 border-t-2" style="border-color: var(--tinta)">
            <div class="flex justify-between font-extrabold mb-3" style="color: var(--tinta)">
              <span>Total</span>
              <span class="angka-nota text-xl">{{ formatRupiah(cartStore.totalPrice) }}</span>
            </div>
            <button
              @click="openCheckout"
              :disabled="cartStore.items.length === 0"
              class="btn-bata w-full py-3.5 rounded-md font-extrabold text-sm uppercase tracking-[0.14em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Proses Pembayaran
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== STRUK BAYAR ===== -->
    <Dialog
      v-model:visible="isCheckoutVisible"
      modal
      :showHeader="false"
      :style="{
        width: 'min(26rem, calc(100vw - 2rem))',
        borderRadius: '0.6rem',
        overflow: 'hidden',
      }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-5 sm:px-6 pt-5 pb-4 text-center">
        <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Kantin Mardira</p>
        <p class="angka-nota text-[11px] tracking-[0.14em] uppercase" style="color: var(--tinta)">Struk pembayaran · STMIK Mardira</p>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>

      <div class="kertas px-5 sm:px-6 py-5 space-y-4">
        <div class="text-center">
          <p class="angka-nota text-[11px] uppercase tracking-[0.2em]" style="color: var(--tinta-soft)">Total tagihan</p>
          <p class="angka-nota text-3xl font-extrabold" style="color: var(--tinta)">{{
            formatRupiah(cartStore.totalPrice)
          }}</p>
        </div>

        <div class="garis-struk"></div>

        <div class="flex flex-col gap-1.5">
          <label for="nama-pemesan" class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--tinta-soft)">
            Nama pemesan <span class="normal-case font-medium">(opsional)</span>
          </label>
          <input
            id="nama-pemesan"
            v-model="customerName"
            type="text"
            placeholder="Tulis nama pembeli…"
            class="w-full px-4 py-3 text-sm rounded-md border-2 bg-white/70 placeholder:text-stone-400 focus:outline-none transition-colors"
            style="border-color: var(--garis); color: var(--tinta)"
            onfocus="this.style.borderColor='var(--bata)'"
            onblur="this.style.borderColor='var(--garis)'"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--tinta-soft)">Cara bayar</span>
          <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Metode pembayaran">
            <button
              v-for="method in ['cash', 'qris']"
              :key="method"
              @click="selectedPayment = method"
              :aria-pressed="selectedPayment === method"
              class="py-3 text-sm font-extrabold uppercase tracking-[0.12em] transition-all border-2 rounded-md"
              :style="selectedPayment === method
                ? 'border-color: var(--tinta); background: var(--tinta); color: var(--kertas)'
                : 'border-color: var(--garis); color: var(--tinta-soft); background: transparent'"
            >
              {{ method === 'cash' ? 'Tunai' : 'QRIS' }}
            </button>
          </div>
        </div>

        <div v-if="selectedPayment === 'cash'" class="flex flex-col gap-1.5">
          <label class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]" style="color: var(--tinta-soft)">Uang diterima</label>
          <InputNumber
            v-model="paidAmount"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            class="w-full angka-nota"
          />
          <div
            v-if="paidAmount >= cartStore.totalPrice"
            class="flex justify-between text-sm rounded-md px-3 py-2 mt-1 border-2"
            style="border-color: var(--papan); color: var(--papan-deep); background: rgba(32,73,58,.07)"
          >
            <span>Kembalian</span>
            <span class="angka-nota font-extrabold">{{
              formatRupiah(paidAmount - cartStore.totalPrice)
            }}</span>
          </div>
        </div>

        <div
          v-else
          class="p-3 text-sm rounded-md border-2"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          <span>Minta pelanggan pindai QRIS. Dianggap lunas.</span>
        </div>
      </div>

      <div class="kertas flex gap-2 px-5 sm:px-6 pb-5 pt-1">
        <button
          @click="isCheckoutVisible = false"
          class="flex-1 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          Batal
        </button>
        <button
          @click="submitTransaction"
          :disabled="isSubmitting"
          class="btn-bata flex-1 py-2.5 font-extrabold text-sm uppercase tracking-[0.12em] rounded-md transition-all disabled:opacity-50"
        >
          {{ isSubmitting ? 'Mencatat…' : 'Selesaikan' }}
        </button>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* Bottom sheet transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
