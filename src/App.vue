<script setup>
import { ref } from 'vue'
import axios from 'axios'

const apiStatus = ref('Sedang mengecek koneksi...')

const cekKoneksiBackend = async () => {
  try {
    // Menembak root URL (melalui proxy Vite)
    const response = await axios.get('/api/v1/') // Tergantung temanmu menaruh route ini di dalam grup api/v1 atau bukan

    // Tapi karena di main.go temanmu r.GET("/") berada di luar grup,
    // Kita tembak axios.get('/') langsung (via proxy)
    const rawResponse = await axios.get('/')
    apiStatus.value = rawResponse.data.message || 'Tersambung!'
  } catch (error) {
    apiStatus.value = 'Gagal tersambung: ' + error.message
    console.error(error)
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-4">
    <h1 class="text-2xl font-bold">Uji Koneksi Backend Golang</h1>

    <button
      @click="cekKoneksiBackend"
      class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
    >
      Test Koneksi
    </button>

    <p class="p-4 text-lg bg-gray-200 rounded">{{ apiStatus }}</p>
  </div>
</template>
