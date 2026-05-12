<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Card from 'primevue/card'
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
      router.push('/pos')
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Gagal login, periksa kembali email & password.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <Card class="w-full max-w-md shadow-lg">
      <template #title>
        <h2 class="text-2xl font-bold text-center">Login Kantin</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="email">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Masukkan email kasir"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password">Password</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              placeholder="Masukkan password"
              required
            />
          </div>

          <small v-if="errorMessage" class="text-red-500">{{ errorMessage }}</small>

          <Button type="submit" label="Masuk" :loading="isLoading" class="w-full mt-2" />
        </form>
      </template>
    </Card>
  </div>
</template>
