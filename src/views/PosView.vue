<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import api from '@/utils/axios'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Badge from 'primevue/badge'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const menus = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('Semua')

const isCheckoutVisible = ref(false)
const selectedPayment = ref('cash')
const paidAmount = ref(0)
const isSubmitting = ref(false)

const categories = computed(() => {
  const cats = [...new Set(menus.value.map((m) => m.category_name || 'Lainnya'))]
  return ['Semua', ...cats]
})

const filteredMenus = computed(() => {
  return menus.value.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat =
      activeCategory.value === 'Semua' || (m.category_name || 'Lainnya') === activeCategory.value
    return matchSearch && matchCat && m.is_available !== false
  })
})

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

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
  paidAmount.value = cartStore.totalPrice
  selectedPayment.value = 'cash'
  isCheckoutVisible.value = true
}

const submitTransaction = async () => {
  if (selectedPayment.value === 'cash' && paidAmount.value < cartStore.totalPrice) {
    alert('Uang tunai kurang dari total belanja!')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      payment_method: selectedPayment.value,
      paid_amount: selectedPayment.value === 'cash' ? paidAmount.value : cartStore.totalPrice,
      items: cartStore.items.map((item) => ({ menu_id: item.id, quantity: item.qty })),
    }
    const res = await api.post('/transactions', payload)
    if (res.data.success) {
      alert(`Transaksi Berhasil!\nKembalian: ${formatRupiah(res.data.data.change_amount || 0)}`)
      cartStore.clearCart()
      isCheckoutVisible.value = false
    }
  } catch (e) {
    alert(e.response?.data?.message || 'Terjadi kesalahan saat checkout')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchMenus)
</script>

<template>
  <div
    class="flex flex-col h-screen"
    style="background: #f8f7f4; font-family: 'DM Sans', sans-serif"
  >
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          style="background: #1a6b3a"
        >
          <i class="pi pi-shopping-bag text-white text-sm"></i>
        </div>
        <div>
          <h1 class="font-bold text-gray-900 text-base leading-none">Kantin Mardira</h1>
          <p class="text-xs text-gray-400 mt-0.5">Point of Sale</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">{{ authStore.user?.name }}</span>
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

    <div class="flex flex-1 overflow-hidden">
      <!-- LEFT: Menu Area -->
      <section class="flex flex-col flex-1 overflow-hidden">
        <!-- Search & Category Filter -->
        <div class="px-6 pt-4 pb-3 bg-white border-b border-gray-100">
          <div class="relative mb-3">
            <i
              class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            ></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari menu..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
              class="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              :class="
                activeCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              "
              :style="activeCategory === cat ? 'background: #1a6b3a;' : ''"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Menu Grid -->
        <div class="flex-1 overflow-y-auto p-5">
          <div v-if="isLoading" class="flex items-center justify-center h-40">
            <i class="pi pi-spin pi-spinner text-2xl text-gray-300"></i>
          </div>

          <div
            v-else-if="filteredMenus.length === 0"
            class="flex flex-col items-center justify-center h-40 text-gray-400"
          >
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p class="text-sm">Menu tidak ditemukan</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="menu in filteredMenus"
              :key="menu.id"
              @click="cartStore.addToCart(menu)"
              class="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md active:scale-95 border border-gray-100 group"
            >
              <div class="relative overflow-hidden" style="height: 120px">
                <img
                  :src="
                    menu.image_url || 'https://via.placeholder.com/300x200/f0f0f0/999?text=Menu'
                  "
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  :alt="menu.name"
                />
                <div
                  v-if="cartStore.items.find((i) => i.id === menu.id)"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style="background: #1a6b3a"
                >
                  {{ cartStore.items.find((i) => i.id === menu.id)?.qty }}
                </div>
              </div>
              <div class="p-3">
                <p class="text-gray-800 font-medium text-sm leading-tight truncate">
                  {{ menu.name }}
                </p>
                <p class="font-bold mt-1 text-sm" style="color: #1a6b3a">
                  {{ formatRupiah(menu.price) }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">Stok: {{ menu.stock }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- RIGHT: Cart Sidebar -->
      <aside class="flex flex-col w-80 bg-white border-l border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-gray-800">Pesanan</h2>
            <span
              v-if="cartStore.items.length > 0"
              class="text-xs text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
              @click="cartStore.clearCart()"
              >Hapus semua</span
            >
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto px-5 py-3">
          <div
            v-if="cartStore.items.length === 0"
            class="flex flex-col items-center justify-center h-full text-gray-300 gap-2"
          >
            <i class="pi pi-shopping-cart text-4xl"></i>
            <p class="text-sm">Keranjang kosong</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50"
            >
              <img
                :src="item.image_url || 'https://via.placeholder.com/60/f0f0f0/999?text=+'"
                class="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ item.name }}</p>
                <p class="text-xs font-semibold" style="color: #1a6b3a">
                  {{ formatRupiah(item.price * item.qty) }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  @click="cartStore.removeFromCart(item.id)"
                  class="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <i class="pi pi-minus text-xs text-gray-600"></i>
                </button>
                <span class="text-sm font-bold w-5 text-center">{{ item.qty }}</span>
                <button
                  @click="cartStore.addToCart(item)"
                  class="w-6 h-6 rounded-full flex items-center justify-center transition-colors text-white"
                  style="background: #1a6b3a"
                >
                  <i class="pi pi-plus text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary & Checkout -->
        <div class="px-5 py-4 border-t border-gray-100">
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{{ formatRupiah(cartStore.totalPrice) }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span class="text-lg">{{ formatRupiah(cartStore.totalPrice) }}</span>
            </div>
          </div>
          <button
            @click="openCheckout"
            :disabled="cartStore.items.length === 0"
            class="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
            style="background: #1a6b3a"
          >
            Proses Pembayaran →
          </button>
        </div>
      </aside>
    </div>

    <!-- Checkout Dialog -->
    <Dialog
      v-model:visible="isCheckoutVisible"
      modal
      header="Konfirmasi Pembayaran"
      :style="{ width: '26rem', borderRadius: '1.25rem' }"
    >
      <div class="space-y-5 mt-2">
        <!-- Total Bill -->
        <div class="flex justify-between items-center p-4 rounded-2xl" style="background: #f0f7f3">
          <span class="text-sm text-gray-500">Total Tagihan</span>
          <span class="text-2xl font-bold" style="color: #1a6b3a">{{
            formatRupiah(cartStore.totalPrice)
          }}</span>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="text-sm font-semibold text-gray-700 block mb-2">Metode Pembayaran</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="method in ['cash', 'qris']"
              :key="method"
              @click="selectedPayment = method"
              class="py-3 rounded-xl border-2 text-sm font-medium transition-all capitalize"
              :class="
                selectedPayment === method
                  ? 'border-green-700 text-green-700 bg-green-50'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              "
            >
              <i :class="method === 'cash' ? 'pi pi-money-bill' : 'pi pi-qrcode'" class="mr-2"></i>
              {{ method.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Cash Input -->
        <div v-if="selectedPayment === 'cash'">
          <label class="text-sm font-semibold text-gray-700 block mb-2">Uang Diterima</label>
          <InputNumber
            v-model="paidAmount"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            class="w-full"
          />
          <div v-if="paidAmount >= cartStore.totalPrice" class="flex justify-between mt-2 text-sm">
            <span class="text-gray-500">Kembalian</span>
            <span class="font-bold text-green-700">{{
              formatRupiah(paidAmount - cartStore.totalPrice)
            }}</span>
          </div>
        </div>

        <div v-else class="p-3 rounded-xl text-sm text-blue-700 bg-blue-50">
          <i class="pi pi-info-circle mr-1"></i>
          Minta pelanggan scan QRIS. Pembayaran dianggap lunas.
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 pt-2">
          <Button
            label="Batal"
            severity="secondary"
            outlined
            @click="isCheckoutVisible = false"
            class="flex-1"
          />
          <button
            @click="submitTransaction"
            :disabled="isSubmitting"
            class="flex-1 py-2.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style="background: #1a6b3a"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
            Selesaikan
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
