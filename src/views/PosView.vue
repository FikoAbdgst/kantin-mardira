<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import api from '@/utils/axios'
import { useRouter } from 'vue-router'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const menus = ref([])
const isLoading = ref(true)

// Mengambil data menu dari Backend Golang
const fetchMenus = async () => {
  try {
    const response = await api.get('/menus')
    // Asumsi response backend: { data: [...] }
    menus.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil menu:', error)
  } finally {
    isLoading.value = false
  }
}

// Format Rupiah
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const checkout = () => {
  alert('Fungsi Checkout menembak API akan dibuat di langkah selanjutnya!')
  // cartStore.clearCart()
}

// Jalankan fetchMenus saat halaman pertama kali dibuka (mirip useEffect di React)
onMounted(() => {
  fetchMenus()
})
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <header class="flex items-center justify-between p-4 text-white bg-blue-600 shadow-md">
      <h1 class="text-xl font-bold">Kantin POS - Kasir</h1>
      <div class="flex items-center gap-4">
        <span>Halo, {{ authStore.user?.name || 'Kasir' }}</span>
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="danger"
          size="small"
          @click="handleLogout"
        />
      </div>
    </header>

    <main class="flex flex-1 overflow-hidden">
      <section class="flex-1 p-4 overflow-y-auto">
        <h2 class="mb-4 text-lg font-semibold">Daftar Menu</h2>

        <div v-if="isLoading" class="text-center">Memuat menu...</div>

        <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card
            v-for="menu in menus"
            :key="menu.id"
            class="cursor-pointer hover:shadow-lg"
            @click="cartStore.addToCart(menu)"
          >
            <template #header>
              <img
                :src="menu.image_url || 'https://via.placeholder.com/150'"
                class="object-cover w-full h-32 rounded-t-md"
                alt="menu"
              />
            </template>
            <template #title>
              <h3 class="text-base truncate">{{ menu.name }}</h3>
            </template>
            <template #subtitle>
              <span class="font-bold text-blue-600">{{ formatRupiah(menu.price) }}</span>
            </template>
          </Card>
        </div>
      </section>

      <aside class="flex flex-col w-1/3 p-4 bg-white border-l shadow-inner">
        <h2 class="mb-4 text-lg font-semibold border-b pb-2">Pesanan Saat Ini</h2>

        <div class="flex-1 overflow-y-auto">
          <div v-if="cartStore.items.length === 0" class="text-center text-gray-500 mt-10">
            Keranjang masih kosong
          </div>

          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex items-center justify-between py-2 border-b"
          >
            <div class="flex-1">
              <h4 class="font-medium text-sm">{{ item.name }}</h4>
              <p class="text-xs text-gray-500">{{ formatRupiah(item.price) }}</p>
            </div>

            <div class="flex items-center gap-2">
              <Button
                icon="pi pi-minus"
                severity="secondary"
                rounded
                outlined
                size="small"
                @click="cartStore.removeFromCart(item.id)"
              />
              <span class="w-6 text-center">{{ item.qty }}</span>
              <Button
                icon="pi pi-plus"
                severity="secondary"
                rounded
                outlined
                size="small"
                @click="cartStore.addToCart(item)"
              />
            </div>
          </div>
        </div>

        <div class="pt-4 mt-4 border-t">
          <div class="flex justify-between mb-4 text-xl font-bold">
            <span>Total:</span>
            <span>{{ formatRupiah(cartStore.totalPrice) }}</span>
          </div>
          <Button
            label="Proses Pembayaran"
            class="w-full"
            severity="success"
            size="large"
            :disabled="cartStore.items.length === 0"
            @click="checkout"
          />
        </div>
      </aside>
    </main>
  </div>
</template>
