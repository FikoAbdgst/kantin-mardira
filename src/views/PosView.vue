<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import api from '@/utils/axios'
import { useRouter } from 'vue-router'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import SelectButton from 'primevue/selectbutton'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const menus = ref([])
const isLoading = ref(true)

// State untuk Modal Checkout
const isCheckoutDialogVisible = ref(false)
const paymentMethods = ref(['cash', 'qris'])
const selectedPaymentMethod = ref('cash')
const paidAmount = ref(0)
const isSubmitting = ref(false)

// Mengambil data menu dari Backend Golang
const fetchMenus = async () => {
  try {
    const response = await api.get('/menus')
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

// Membuka Modal Checkout
const openCheckout = () => {
  isCheckoutDialogVisible.value = true
  selectedPaymentMethod.value = 'cash'
  paidAmount.value = cartStore.totalPrice // Default: Uang pas
}

// Mengirim Data Transaksi ke API Backend
const submitTransaction = async () => {
  if (selectedPaymentMethod.value === 'cash' && paidAmount.value < cartStore.totalPrice) {
    alert('Uang tunai kurang dari total belanja!')
    return
  }

  isSubmitting.value = true
  try {
    // Membentuk payload sesuai dengan kebutuhan Golang Clean Arch
    const payload = {
      payment_method: selectedPaymentMethod.value,
      paid_amount: selectedPaymentMethod.value === 'cash' ? paidAmount.value : cartStore.totalPrice,
      items: cartStore.items.map((item) => ({
        menu_id: item.id,
        quantity: item.qty,
      })),
    }

    const response = await api.post('/transactions', payload)

    if (response.data.success) {
      alert(
        `Transaksi Berhasil!\nKembalian: ${formatRupiah(response.data.data.change_amount || 0)}`,
      )
      cartStore.clearCart() // Kosongkan keranjang
      isCheckoutDialogVisible.value = false // Tutup modal
    }
  } catch (error) {
    console.error('Gagal checkout:', error)
    alert(error.response?.data?.message || 'Terjadi kesalahan saat checkout')
  } finally {
    isSubmitting.value = false
  }
}

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
            @click="openCheckout"
          />
        </div>
      </aside>
    </main>

    <Dialog
      v-model:visible="isCheckoutDialogVisible"
      modal
      header="Proses Pembayaran"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-col gap-4 mb-4 mt-2">
        <div class="flex justify-between font-bold text-xl pb-2 border-b">
          <span>Tagihan:</span>
          <span class="text-blue-600">{{ formatRupiah(cartStore.totalPrice) }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-semibold">Metode Pembayaran</label>
          <SelectButton
            v-model="selectedPaymentMethod"
            :options="paymentMethods"
            aria-labelledby="basic"
          />
        </div>

        <div v-if="selectedPaymentMethod === 'cash'" class="flex flex-col gap-2">
          <label class="font-semibold">Uang Diterima (Tunai)</label>
          <InputNumber
            v-model="paidAmount"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            class="w-full"
          />
        </div>

        <div v-else class="p-3 text-sm text-blue-700 bg-blue-100 rounded-md">
          Silakan minta pelanggan scan QRIS. Pembayaran dianggap uang pas.
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          label="Batal"
          severity="secondary"
          @click="isCheckoutDialogVisible = false"
        />
        <Button
          type="button"
          label="Selesaikan Transaksi"
          @click="submitTransaction"
          :loading="isSubmitting"
        />
      </div>
    </Dialog>
  </div>
</template>
