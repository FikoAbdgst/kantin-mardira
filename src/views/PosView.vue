<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import PosKasir from '@/components/pos/PosKasir.vue'
import PosHistory from '@/components/pos/PosHistory.vue'

const authStore = useAuthStore()
const router = useRouter()

const activeView = ref('pos')

const switchView = (view) => {
  activeView.value = view
}

const handleTransactionSuccess = () => {
  // switchView('history')
}
</script>

<template>
  <div class="flex flex-col h-screen bg-amber-50 font-sans">
    <!-- Header — konsisten dengan Admin & Manager -->
    <header
      class="flex items-center justify-between px-5 lg:px-8 py-4 bg-white border-b border-amber-100 sticky top-0 z-20"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-orange-400 rounded-2xl flex items-center justify-center shadow-sm">
          <i class="pi pi-shopping-bag text-white" style="font-size: 14px"></i>
        </div>
        <div>
          <h1 class="text-sm font-extrabold text-gray-800 leading-tight tracking-tight">
            KANTIN MARDIRA
          </h1>
          <p class="text-xs text-orange-400 font-semibold">Point of Sale</p>
        </div>
      </div>

      <!-- Tab Switcher — mirip pill toggle -->
      <div class="flex items-center gap-1 p-1 bg-amber-50 border border-amber-100 rounded-2xl">
        <button
          @click="switchView('pos')"
          class="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200"
          :class="
            activeView === 'pos'
              ? 'bg-white shadow-sm text-orange-500 ring-1 ring-amber-100'
              : 'text-gray-400 hover:text-gray-600'
          "
        >
          <i class="pi pi-shopping-cart" style="font-size: 12px"></i>
          Kasir
        </button>
        <button
          @click="switchView('history')"
          class="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200"
          :class="
            activeView === 'history'
              ? 'bg-white shadow-sm text-orange-500 ring-1 ring-amber-100'
              : 'text-gray-400 hover:text-gray-600'
          "
        >
          <i class="pi pi-history" style="font-size: 12px"></i>
          Riwayat
        </button>
      </div>

      <!-- User + Logout -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-semibold text-gray-700">{{ authStore.user?.name }}</p>
          <p class="text-xs text-orange-400 font-medium">Kasir</p>
        </div>
        <div
          class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm ring-2 ring-orange-200"
        >
          {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'K' }}
        </div>
        <button
          @click="
            () => {
              authStore.logout()
              router.push('/login')
            }
          "
          class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <i class="pi pi-sign-out" style="font-size: 14px"></i>
        </button>
      </div>
    </header>

    <!-- Content -->
    <div class="flex flex-1 overflow-hidden">
      <PosKasir v-if="activeView === 'pos'" @transaction-success="handleTransactionSuccess" />
      <PosHistory v-else-if="activeView === 'history'" />
    </div>
  </div>
</template>
