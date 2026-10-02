<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

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

<!-- Login kasir: satu form terpusat, bahasa fungsional, aksen dunia secukupnya. -->
<template>
  <div class="dinding min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-6">
        <p class="text-[11px] font-bold tracking-[0.22em] uppercase" style="color: var(--bata)">
          STMIK Mardira Indonesia
        </p>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1" style="color: var(--tinta)">
          Kantin Mardira <span class="font-medium">— Kasir</span>
        </h1>
        <p class="text-sm mt-1" style="color: var(--tinta-soft)">Masuk untuk memulai shift kasir.</p>
      </div>

      <form @submit.prevent="handleLogin" class="kertas rounded-md border px-5 py-6 space-y-4" style="border-color: var(--garis)">
        <div>
          <label for="login-email" class="text-sm font-semibold" style="color: var(--tinta)">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            required
            autocomplete="username"
            placeholder="nama@kantinmardira.com"
            class="mt-1.5 w-full px-4 py-3 text-sm rounded-md border-2 bg-white/60 placeholder:text-stone-400 focus:outline-none transition-colors"
            style="border-color: var(--garis); color: var(--tinta)"
            onfocus="this.style.borderColor='#a63a26'"
            onblur="this.style.borderColor='var(--garis)'"
          />
        </div>

        <div>
          <label for="login-password" class="text-sm font-semibold" style="color: var(--tinta)">Password</label>
          <div class="relative mt-1.5">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 pr-12 py-3 text-sm rounded-md border-2 bg-white/60 placeholder:text-stone-400 focus:outline-none transition-colors"
              style="border-color: var(--garis); color: var(--tinta)"
              onfocus="this.style.borderColor='#a63a26'"
              onblur="this.style.borderColor='var(--garis)'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Lihat password'"
              :title="showPassword ? 'Sembunyikan' : 'Lihat'"
              class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style="color: var(--tinta-soft)"
            >
              <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'" style="font-size: 15px"></i>
            </button>
          </div>
        </div>

        <div
          v-if="errorMessage"
          role="alert"
          class="rounded-md border-2 px-4 py-3 text-sm font-medium"
          style="border-color: var(--bata); color: var(--bata-deep); background: rgba(166,58,38,.07)"
        >
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-bata w-full py-3.5 rounded-md font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Memproses…' : 'Masuk' }}
        </button>

        <p class="text-xs text-center" style="color: var(--tinta-soft)">
          Lupa password? Hubungi admin.
        </p>
      </form>

      <p class="text-center text-xs mt-6" style="color: var(--tinta-soft)">
        Sistem kasir internal kampus · <span class="angka-nota">kasir • v1</span>
      </p>
    </div>
  </div>
</template>
