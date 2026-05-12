<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const success = await authStore.login(email.value, password.value)
    if (success) {
      const role = authStore.user.role
      if (role === 'manager') router.push('/manager')
      else if (role === 'admin') router.push('/admin')
      else router.push('/pos')
    }
  } catch (e) {
    errorMessage.value = e.response?.data?.message || 'Email atau password salah.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex" style="font-family: 'DM Sans', sans-serif">
    <div class="flex-1 flex items-center justify-center p-8" style="background: #f8f7f4">
      <div class="w-full max-w-sm">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            style="background: #1a6b3a"
          >
            <i class="pi pi-shopping-bag text-white"></i>
          </div>
          <span class="font-bold text-gray-900 text-xl">Kantin Mardira</span>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-1">Selamat datang</h1>
        <p class="text-gray-400 text-sm mb-8">Masuk untuk melanjutkan ke sistem POS</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <InputText
              v-model="email"
              type="email"
              placeholder="kasir@kantinmardira.com"
              class="w-full"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <Password
              v-model="password"
              :feedback="false"
              toggleMask
              placeholder="Masukkan password"
              class="w-full"
              inputClass="w-full"
              required
            />
          </div>

          <div
            v-if="errorMessage"
            class="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm"
          >
            <i class="pi pi-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-2"
            style="background: #1a6b3a"
          >
            <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2"></i>
            {{ isLoading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-400 mt-8">
          Hubungi administrator jika lupa password
        </p>
      </div>
    </div>
  </div>
</template>
