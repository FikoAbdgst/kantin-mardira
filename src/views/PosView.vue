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

<!-- Meja kasir: strip buku kas + tab ledger. -->
<template>
  <div class="dinding flex flex-col h-screen">
    <header
      class="kertas flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b-2 sticky top-0 z-20"
      style="border-color: var(--tinta)"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div
          class="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 angka-nota font-extrabold text-sm"
          style="background: var(--bata); color: #fdf6e9"
        >
          KM
        </div>
        <div class="hidden min-[480px]:block min-w-0">
          <h1
            class="text-sm font-extrabold tracking-[0.08em] uppercase truncate"
            style="color: var(--tinta)"
          >
            Kantin Mardira
          </h1>
          <p
            class="angka-nota text-[11px] tracking-[0.18em] uppercase"
            style="color: var(--tinta-soft)"
          >
            Buku kas · hari ini
          </p>
        </div>
      </div>

      <!-- Tab ledger: garis bawah tinta, bukan pil -->
      <nav class="flex items-baseline gap-4 sm:gap-6" aria-label="Pandangan kasir">
        <button
          @click="switchView('pos')"
          class="pb-1 text-sm font-bold uppercase tracking-[0.12em] transition-colors border-b-[3px]"
          :style="
            activeView === 'pos'
              ? 'color: var(--bata-deep); border-color: var(--bata)'
              : 'color: var(--tinta-soft); border-color: transparent'
          "
        >
          Kasir
        </button>
        <button
          @click="switchView('history')"
          class="pb-1 text-sm font-bold uppercase tracking-[0.12em] transition-colors border-b-[3px]"
          :style="
            activeView === 'history'
              ? 'color: var(--bata-deep); border-color: var(--bata)'
              : 'color: var(--tinta-soft); border-color: transparent'
          "
        >
          Riwayat
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-bold leading-tight" style="color: var(--tinta)">
            {{ authStore.user?.name }}
          </p>
          <p
            class="angka-nota text-[11px] uppercase tracking-[0.18em]"
            style="color: var(--tinta-soft)"
          >
            Kasir jaga
          </p>
        </div>
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 border-2"
          style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
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
          class="h-9 px-3 flex items-center gap-1.5 rounded text-xs font-bold uppercase tracking-wider border-2 transition-colors hover:text-white"
          style="border-color: var(--tinta); color: var(--tinta)"
          onmouseover="this.style.background = 'red'"
          onmouseout="this.style.background = 'transparent'"
          title="Tutup lapak (logout)"
        >
          <i class="pi pi-sign-out" style="font-size: 12px"></i>
          <span class="hidden md:inline">Tutup</span>
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden min-h-0">
      <PosKasir v-if="activeView === 'pos'" @transaction-success="handleTransactionSuccess" />
      <PosHistory v-else-if="activeView === 'history'" />
    </div>
  </div>
</template>
