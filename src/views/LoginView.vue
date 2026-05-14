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

<template>
  <div
    class="min-h-screen flex bg-[#fdf8f3]"
    style="font-family: 'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif"
  >
    <!-- ===== LEFT PANEL — Decorative (hidden on mobile) ===== -->
    <div
      class="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden flex-col"
      style="background: linear-gradient(155deg, #1c1c1a 0%, #2d1f0e 60%, #3d2a10 100%)"
    >
      <!-- Geometric background shapes -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- Large circle top-right -->
        <div
          class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style="background: radial-gradient(circle, #f97316, transparent)"
        ></div>
        <!-- Medium circle bottom-left -->
        <div
          class="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-15"
          style="background: radial-gradient(circle, #fb923c, transparent)"
        ></div>
        <!-- Subtle grid dots -->
        <svg
          class="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col h-full p-10 xl:p-14">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style="background: linear-gradient(135deg, #f97316, #ea580c)"
          >
            <i class="pi pi-shopping-bag text-white" style="font-size: 16px"></i>
          </div>
          <div>
            <p class="font-extrabold text-white text-base tracking-tight leading-none">
              KANTIN MARDIRA
            </p>
            <p class="text-xs font-medium" style="color: #f97316">Point of Sale System</p>
          </div>
        </div>

        <!-- Central illustration area -->
        <div class="flex-1 flex items-center justify-center py-10">
          <div class="w-full max-w-xs">
            <!-- Custom SVG illustration -->
            <svg
              viewBox="0 0 320 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-full drop-shadow-2xl"
            >
              <!-- Main tray/counter shape -->
              <rect
                x="30"
                y="160"
                width="260"
                height="80"
                rx="16"
                fill="#3d2a10"
                stroke="#f97316"
                stroke-width="1.5"
                stroke-opacity="0.4"
              />
              <!-- Counter surface -->
              <rect
                x="20"
                y="148"
                width="280"
                height="24"
                rx="8"
                fill="#4a3318"
                stroke="#f97316"
                stroke-width="1"
                stroke-opacity="0.3"
              />
              <!-- Price display -->
              <rect
                x="110"
                y="100"
                width="100"
                height="40"
                rx="10"
                fill="#1c1c1a"
                stroke="#f97316"
                stroke-width="1.5"
              />
              <text
                x="160"
                y="126"
                text-anchor="middle"
                font-family="monospace"
                font-size="14"
                font-weight="700"
                fill="#f97316"
              >
                Rp 25.000
              </text>

              <!-- Food items on tray -->
              <!-- Bowl -->
              <ellipse cx="90" cy="150" rx="28" ry="12" fill="#c2410c" />
              <ellipse cx="90" cy="144" rx="26" ry="10" fill="#ea580c" />
              <ellipse cx="90" cy="140" rx="20" ry="7" fill="#fff7ed" />
              <!-- Steam lines -->
              <path
                d="M82 130 Q84 124 82 118"
                stroke="#f97316"
                stroke-width="1.5"
                stroke-linecap="round"
                opacity="0.5"
              />
              <path
                d="M90 128 Q92 122 90 116"
                stroke="#f97316"
                stroke-width="1.5"
                stroke-linecap="round"
                opacity="0.5"
              />
              <path
                d="M98 130 Q100 124 98 118"
                stroke="#f97316"
                stroke-width="1.5"
                stroke-linecap="round"
                opacity="0.5"
              />

              <!-- Drink cup -->
              <rect x="160" y="120" width="32" height="28" rx="4" fill="#0369a1" />
              <rect x="158" y="116" width="36" height="8" rx="4" fill="#0284c7" />
              <line x1="176" y1="116" x2="176" y2="108" stroke="#e0f2fe" stroke-width="2" />
              <circle cx="176" cy="106" r="3" fill="#e0f2fe" />

              <!-- Small plate -->
              <ellipse cx="230" cy="150" rx="22" ry="9" fill="#713f12" />
              <ellipse cx="230" cy="145" rx="18" ry="7" fill="#92400e" />
              <circle cx="230" cy="141" r="10" fill="#fbbf24" />
              <circle cx="227" cy="139" r="3" fill="#f59e0b" />

              <!-- Receipt/bill -->
              <rect x="60" y="170" width="48" height="52" rx="4" fill="white" opacity="0.9" />
              <line x1="68" y1="180" x2="100" y2="180" stroke="#d1d5db" stroke-width="1.5" />
              <line x1="68" y1="188" x2="96" y2="188" stroke="#d1d5db" stroke-width="1.5" />
              <line x1="68" y1="196" x2="100" y2="196" stroke="#d1d5db" stroke-width="1.5" />
              <line x1="68" y1="207" x2="100" y2="207" stroke="#f97316" stroke-width="2" />

              <!-- Decorative coins -->
              <circle cx="200" cy="185" r="12" fill="#f59e0b" opacity="0.9" />
              <circle cx="200" cy="185" r="9" fill="#fbbf24" />
              <text
                x="200"
                y="190"
                text-anchor="middle"
                font-family="serif"
                font-size="10"
                font-weight="700"
                fill="#92400e"
              >
                Rp
              </text>
              <circle cx="226" cy="192" r="9" fill="#f59e0b" opacity="0.7" />
              <circle cx="248" cy="182" r="7" fill="#f59e0b" opacity="0.5" />

              <!-- Stars/sparkles -->
              <g opacity="0.6">
                <path
                  d="M270 60 L272 66 L278 68 L272 70 L270 76 L268 70 L262 68 L268 66 Z"
                  fill="#fbbf24"
                />
                <path
                  d="M50 80 L51.5 85 L57 86.5 L51.5 88 L50 93 L48.5 88 L43 86.5 L48.5 85 Z"
                  fill="#f97316"
                  opacity="0.5"
                />
                <circle cx="290" cy="120" r="3" fill="#fbbf24" opacity="0.4" />
                <circle cx="35" cy="130" r="2" fill="#fb923c" opacity="0.4" />
              </g>
            </svg>

            <div class="text-center mt-6">
              <h2 class="text-2xl xl:text-3xl font-extrabold text-white leading-tight">
                Kelola Kantin<br />
                <span style="color: #f97316">Lebih Cerdas</span>
              </h2>
              <p class="text-sm mt-3 leading-relaxed" style="color: #a8896e">
                Sistem kasir modern untuk kantin yang<br />
                efisien dan mudah digunakan
              </p>
            </div>
          </div>
        </div>

        <!-- Footer badges -->
        <div class="flex items-center gap-3">
          <div
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style="background: rgba(255, 255, 255, 0.07)"
          >
            <i class="pi pi-shield text-xs" style="color: #f97316"></i>
            <span class="text-xs font-medium text-white/60">Aman</span>
          </div>
          <div
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style="background: rgba(255, 255, 255, 0.07)"
          >
            <i class="pi pi-bolt text-xs" style="color: #f97316"></i>
            <span class="text-xs font-medium text-white/60">Cepat</span>
          </div>
          <div
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style="background: rgba(255, 255, 255, 0.07)"
          >
            <i class="pi pi-chart-line text-xs" style="color: #f97316"></i>
            <span class="text-xs font-medium text-white/60">Real-time</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== RIGHT PANEL — Form ===== -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-[360px]">
        <!-- Mobile header -->
        <div class="lg:hidden mb-8 text-center">
          <div
            class="inline-flex items-center justify-center w-14 h-14 rounded-3xl shadow-lg mb-4"
            style="background: linear-gradient(135deg, #f97316, #ea580c)"
          >
            <i class="pi pi-shopping-bag text-white text-2xl"></i>
          </div>
          <h1 class="text-xl font-extrabold text-gray-900 tracking-tight">KANTIN MARDIRA</h1>
          <p class="text-xs font-semibold mt-0.5" style="color: #f97316">Point of Sale System</p>
        </div>

        <!-- Form header -->
        <div class="mb-8">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Selamat<br />datang kembali
          </h2>
          <p class="text-sm text-gray-400 mt-2">Masuk untuk melanjutkan ke sistem POS</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Email</label>
            <div class="relative">
              <i
                class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style="font-size: 13px"
              ></i>
              <input
                v-model="email"
                type="email"
                placeholder="nama@kantinmardira.com"
                required
                class="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
            <div class="relative">
              <i
                class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style="font-size: 13px"
              ></i>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                required
                class="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <i
                  :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  style="font-size: 14px"
                ></i>
              </button>
            </div>
          </div>

          <!-- Error -->
          <Transition name="shake">
            <div
              v-if="errorMessage"
              class="flex items-center gap-2.5 p-3.5 rounded-2xl text-sm"
              style="background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3"
            >
              <i class="pi pi-exclamation-triangle flex-shrink-0" style="font-size: 14px"></i>
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2 relative overflow-hidden shadow-lg"
            style="
              background: linear-gradient(135deg, #f97316, #ea580c);
              box-shadow: 0 8px 24px rgba(249, 115, 22, 0.35);
            "
          >
            <span class="flex items-center justify-center gap-2">
              <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-arrow-right"></i>
              {{ isLoading ? 'Memproses...' : 'Masuk Sekarang' }}
            </span>
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-400">
            <i class="pi pi-info-circle mr-1"></i>
            Hubungi administrator jika lupa password
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shake-enter-active {
  animation: shake 0.4s ease-out;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
</style>
