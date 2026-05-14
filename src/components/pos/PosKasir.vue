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

<template>
  <div class="flex flex-1 overflow-hidden min-h-0 relative">
    <section class="flex flex-col flex-1 overflow-hidden bg-amber-50 min-w-0">
      <div class="px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-3 bg-white border-b border-amber-100">
        <div class="relative mb-3">
          <i
            class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
            style="font-size: 13px"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama menu..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all"
          />
        </div>

        <div class="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            class="shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            :class="
              activeCategory === cat
                ? 'bg-orange-400 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            "
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="flex-1 p-4 sm:p-5 overflow-y-auto pb-28 sm:pb-5">
        <div
          v-if="isLoading"
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="bg-white border border-amber-100 rounded-3xl overflow-hidden animate-pulse"
          >
            <div class="h-24 sm:h-28 bg-gray-100"></div>
            <div class="p-3 space-y-2">
              <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div
          v-else-if="filteredMenus.length === 0"
          class="flex flex-col items-center justify-center h-40 text-gray-400"
        >
          <i class="pi pi-inbox text-4xl mb-2 text-amber-200"></i>
          <p class="text-sm font-medium">Menu tidak ditemukan</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="menu in filteredMenus"
            :key="menu.id"
            @click="!isMenuInCart(menu.id) && cartStore.addToCart(menu)"
            class="relative overflow-hidden bg-white border border-amber-100 rounded-3xl shadow-sm group transition-all duration-200"
            :class="
              isMenuInCart(menu.id)
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95'
            "
          >
            <div class="relative overflow-hidden" style="height: 96px">
              <img
                :src="getImageUrl(menu?.image_url)"
                @error="handleImageError"
                loading="lazy"
                decoding="async"
                class="object-cover w-full h-full transition-transform duration-300"
                :class="!isMenuInCart(menu.id) ? 'group-hover:scale-105' : ''"
                :alt="menu.name"
              />
              <div
                v-if="isMenuInCart(menu.id)"
                class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]"
              >
                <div
                  class="w-10 h-10 rounded-2xl bg-orange-400 flex items-center justify-center shadow-md"
                >
                  <i class="pi pi-check text-white font-bold"></i>
                </div>
              </div>
            </div>

            <div class="p-2.5 sm:p-3">
              <p class="text-xs sm:text-sm font-semibold text-gray-800 truncate leading-tight">
                {{ menu.name }}
              </p>
              <p class="mt-0.5 text-xs sm:text-sm font-bold text-orange-500">
                {{ formatRupiah(menu.price) }}
              </p>
              <p class="mt-0.5 text-xs text-gray-400">Stok: {{ menu.stock }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <aside class="hidden lg:flex flex-col w-80 bg-white border-l border-amber-100 flex-shrink-0">
      <div class="px-5 py-4 border-b border-amber-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center">
              <i class="pi pi-shopping-cart text-orange-500" style="font-size: 12px"></i>
            </div>
            <h2 class="font-bold text-gray-800">Pesanan</h2>
          </div>
          <span
            v-if="cartStore.items.length > 0"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            @click="cartStore.clearCart()"
          >
            Hapus semua
          </span>
        </div>
      </div>

      <div class="flex-1 px-5 py-3 overflow-y-auto">
        <div
          v-if="cartStore.items.length === 0"
          class="flex flex-col items-center justify-center h-full gap-2 text-gray-300"
        >
          <div class="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center mb-1">
            <i class="pi pi-shopping-cart text-amber-200 text-2xl"></i>
          </div>
          <p class="text-sm font-medium text-gray-400">Keranjang kosong</p>
          <p class="text-xs text-gray-300">Pilih menu dari daftar</p>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-100"
          >
            <button
              @click="cartStore.deleteItem(item.id)"
              class="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
            >
              <i class="pi pi-trash text-xs"></i>
            </button>
            <img
              :src="getImageUrl(item?.image_url)"
              @error="handleImageError"
              loading="lazy"
              decoding="async"
              class="w-9 h-9 object-cover rounded-xl border border-amber-100 flex-shrink-0"
              :alt="item.name"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ item.name }}</p>
              <p class="text-xs font-bold text-orange-500">
                {{ formatRupiah(item.price * item.qty) }}
              </p>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <button
                @click="cartStore.removeFromCart(item.id)"
                :disabled="item.qty === 1"
                class="w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-colors"
                :class="
                  item.qty === 1
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                "
              >
                <i class="pi pi-minus" style="font-size: 9px"></i>
              </button>
              <span class="w-5 text-sm font-bold text-center text-gray-800">{{ item.qty }}</span>
              <button
                @click="cartStore.addToCart(item)"
                class="w-6 h-6 rounded-lg text-xs flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white transition-colors"
              >
                <i class="pi pi-plus" style="font-size: 9px"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-4 border-t border-amber-100">
        <div class="mb-4 space-y-2">
          <div class="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>{{ formatRupiah(cartStore.totalPrice) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span class="text-lg text-orange-500">{{ formatRupiah(cartStore.totalPrice) }}</span>
          </div>
        </div>
        <button
          @click="openCheckout"
          :disabled="cartStore.items.length === 0"
          class="w-full py-3.5 rounded-2xl font-bold text-white text-sm bg-orange-400 hover:bg-orange-500 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          <i class="pi pi-credit-card mr-2" style="font-size: 13px"></i>
          Proses Pembayaran
        </button>
      </div>
    </aside>

    <div
      class="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm"
    >
      <button
        v-if="cartStore.items.length > 0"
        @click="isCartSheetOpen = true"
        class="w-full flex items-center justify-between px-4 py-3.5 bg-orange-400 hover:bg-orange-500 rounded-2xl shadow-lg text-white transition-all active:scale-95"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold"
          >
            {{ cartStore.items.reduce((s, i) => s + i.qty, 0) }}
          </span>
          <span class="text-sm font-semibold">Lihat Pesanan</span>
        </div>
        <span class="text-sm font-bold">{{ formatRupiah(cartStore.totalPrice) }}</span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isCartSheetOpen"
          class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          @click="isCartSheetOpen = false"
        />
      </Transition>

      <Transition name="slide-up">
        <div
          v-if="isCartSheetOpen"
          class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        >
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
          </div>

          <div class="flex items-center justify-between px-5 py-3 border-b border-amber-100">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center">
                <i class="pi pi-shopping-cart text-orange-500" style="font-size: 12px"></i>
              </div>
              <h2 class="font-bold text-gray-800">Pesanan</h2>
            </div>
            <div class="flex items-center gap-3">
              <span
                v-if="cartStore.items.length > 0"
                class="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                @click="cartStore.clearCart()"
              >
                Hapus semua
              </span>
              <button
                @click="isCartSheetOpen = false"
                class="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <i class="pi pi-times" style="font-size: 11px"></i>
              </button>
            </div>
          </div>

          <div class="flex-1 px-5 py-3 overflow-y-auto">
            <div
              v-if="cartStore.items.length === 0"
              class="flex flex-col items-center justify-center py-10 gap-2"
            >
              <i class="pi pi-shopping-cart text-amber-200 text-3xl"></i>
              <p class="text-sm text-gray-400">Keranjang kosong</p>
            </div>
            <div v-else class="space-y-2.5">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-100"
              >
                <button
                  @click="cartStore.deleteItem(item.id)"
                  class="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl flex-shrink-0"
                >
                  <i class="pi pi-trash text-xs"></i>
                </button>
                <img
                  :src="getImageUrl(item?.image_url)"
                  @error="handleImageError"
                  loading="lazy"
                  decoding="async"
                  class="w-9 h-9 object-cover rounded-xl border border-amber-100 flex-shrink-0"
                  :alt="item.name"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{{ item.name }}</p>
                  <p class="text-xs font-bold text-orange-500">
                    {{ formatRupiah(item.price * item.qty) }}
                  </p>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    @click="cartStore.removeFromCart(item.id)"
                    :disabled="item.qty === 1"
                    class="w-7 h-7 rounded-xl text-sm flex items-center justify-center transition-colors"
                    :class="
                      item.qty === 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border border-gray-200 text-gray-600'
                    "
                  >
                    <i class="pi pi-minus" style="font-size: 9px"></i>
                  </button>
                  <span class="w-6 text-sm font-bold text-center text-gray-800">{{
                    item.qty
                  }}</span>
                  <button
                    @click="cartStore.addToCart(item)"
                    class="w-7 h-7 rounded-xl text-sm flex items-center justify-center bg-orange-400 text-white"
                  >
                    <i class="pi pi-plus" style="font-size: 9px"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 py-4 border-t border-amber-100 bg-white">
            <div class="flex justify-between font-bold text-gray-900 mb-3">
              <span>Total</span>
              <span class="text-xl text-orange-500">{{ formatRupiah(cartStore.totalPrice) }}</span>
            </div>
            <button
              @click="openCheckout"
              :disabled="cartStore.items.length === 0"
              class="w-full py-3.5 rounded-2xl font-bold text-white text-sm bg-orange-400 hover:bg-orange-500 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <i class="pi pi-credit-card mr-2" style="font-size: 13px"></i>
              Proses Pembayaran
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Dialog
      v-model:visible="isCheckoutVisible"
      modal
      :showHeader="false"
      :style="{
        width: 'min(26rem, calc(100vw - 2rem))',
        borderRadius: '1.25rem',
        overflow: 'hidden',
      }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div
        class="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <i class="pi pi-credit-card text-orange-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Konfirmasi Pembayaran</h3>
        </div>
        <button
          @click="isCheckoutVisible = false"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-5 sm:px-6 py-5 space-y-4">
        <div
          class="flex items-center justify-between p-4 bg-amber-50 rounded-2xl ring-1 ring-amber-100"
        >
          <span class="text-sm text-gray-500">Total Tagihan</span>
          <span class="text-xl sm:text-2xl font-bold text-orange-500">{{
            formatRupiah(cartStore.totalPrice)
          }}</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Nama Pemesan <span class="normal-case font-normal">(Opsional)</span>
          </label>
          <div class="relative">
            <i
              class="pi pi-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="customerName"
              type="text"
              placeholder="Masukkan nama pembeli..."
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Metode Pembayaran</label
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="method in ['cash', 'qris']"
              :key="method"
              @click="selectedPayment = method"
              class="flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-2 capitalize rounded-xl"
              :class="
                selectedPayment === method
                  ? 'border-orange-300 bg-orange-50 text-orange-600 ring-2 ring-orange-100'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 bg-white'
              "
            >
              <i
                :class="method === 'cash' ? 'pi pi-money-bill' : 'pi pi-qrcode'"
                style="font-size: 14px"
              ></i>
              {{ method.toUpperCase() }}
            </button>
          </div>
        </div>

        <div v-if="selectedPayment === 'cash'" class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Uang Diterima</label
          >
          <InputNumber
            v-model="paidAmount"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            class="w-full"
          />
          <div
            v-if="paidAmount >= cartStore.totalPrice"
            class="flex justify-between text-sm bg-green-50 rounded-xl px-3 py-2 mt-1"
          >
            <span class="text-gray-500">Kembalian</span>
            <span class="font-bold text-green-600">{{
              formatRupiah(paidAmount - cartStore.totalPrice)
            }}</span>
          </div>
        </div>

        <div
          v-else
          class="flex items-center gap-2 p-3 text-sm text-blue-600 bg-blue-50 rounded-xl ring-1 ring-blue-100"
        >
          <i class="pi pi-info-circle flex-shrink-0"></i>
          <span>Minta pelanggan scan QRIS. Pembayaran dianggap lunas.</span>
        </div>
      </div>

      <div class="flex gap-2 px-5 sm:px-6 pb-5 pt-1">
        <button
          @click="isCheckoutVisible = false"
          class="flex-1 py-2.5 text-sm text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          @click="submitTransaction"
          :disabled="isSubmitting"
          class="flex-1 py-2.5 font-semibold text-white bg-orange-400 hover:bg-orange-500 transition-all rounded-xl shadow-sm disabled:opacity-50"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2" style="font-size: 12px"></i>
          <i v-else class="pi pi-check mr-2" style="font-size: 12px"></i>
          Selesaikan
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

/* Hide scrollbar for category pills */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
