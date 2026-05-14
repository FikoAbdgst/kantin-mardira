<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

const categories = ref([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const form = ref({ name: '' })
const selectedCategory = ref(null)

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
const openAdd = () => {
  form.value = { name: '' }
  showAddModal.value = true
}
const openEdit = (cat) => {
  selectedCategory.value = cat
  form.value = { name: cat.name }
  showEditModal.value = true
}
const openDelete = (cat) => {
  selectedCategory.value = cat
  showDeleteModal.value = true
}
const saveData = async () => {
  isSubmitting.value = true
  try {
    await api.post('/categories', form.value)
    showAddModal.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
const updateData = async () => {
  isSubmitting.value = true
  try {
    await api.put(`/categories/${selectedCategory.value.id}`, form.value)
    showEditModal.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
const deleteData = async () => {
  isSubmitting.value = true
  try {
    await api.delete(`/categories/${selectedCategory.value.id}`)
    showDeleteModal.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-xl font-bold text-gray-800">Kategori Menu</h3>
        <p class="text-sm text-gray-400 mt-0.5">Kelompokkan menu agar mudah dicari kasir.</p>
      </div>
      <button
        @click="openAdd"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
      >
        <i class="pi pi-plus text-xs"></i> Tambah Kategori
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
      <DataTable :value="categories" :loading="isLoading" :rowHover="true">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="pi pi-tags text-4xl mb-3 text-amber-200"></i>
            <p class="text-sm font-medium">Belum ada kategori</p>
          </div>
        </template>
        <Column field="name" header="Nama Kategori">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"
              >
                <i class="pi pi-tag text-amber-500 text-xs"></i>
              </div>
              <span class="font-semibold text-gray-800">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column header="Aksi" style="width: 100px" align="center">
          <template #body="{ data }">
            <div class="flex justify-center gap-1.5">
              <button
                @click="openEdit(data)"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <i class="pi pi-pencil text-xs"></i>
              </button>
              <button
                @click="openDelete(data)"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 transition-colors"
              >
                <i class="pi pi-trash text-xs"></i>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add Modal -->
    <Dialog
      v-model:visible="showAddModal"
      modal
      :showHeader="false"
      :style="{ width: '420px', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <i class="pi pi-tag text-orange-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Tambah Kategori</h3>
        </div>
        <button
          @click="showAddModal = false"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-6 py-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Nama Kategori</label
          >
          <div class="relative">
            <i
              class="pi pi-tag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.name"
              type="text"
              placeholder="Contoh: Makanan Berat, Minuman..."
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 px-6 pb-5 pt-1">
        <button
          @click="showAddModal = false"
          class="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors rounded-xl hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          @click="saveData"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
          <i v-else class="pi pi-check" style="font-size: 11px"></i>
          Simpan
        </button>
      </div>
    </Dialog>

    <!-- Edit Modal -->
    <Dialog
      v-model:visible="showEditModal"
      modal
      :showHeader="false"
      :style="{ width: '420px', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <i class="pi pi-pencil text-blue-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Edit Kategori</h3>
        </div>
        <button
          @click="showEditModal = false"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-6 py-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Nama Kategori</label
          >
          <div class="relative">
            <i
              class="pi pi-tag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.name"
              type="text"
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 px-6 pb-5 pt-1">
        <button
          @click="showEditModal = false"
          class="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors rounded-xl hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          @click="updateData"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
          <i v-else class="pi pi-check" style="font-size: 11px"></i>
          Update
        </button>
      </div>
    </Dialog>

    <!-- Delete Modal -->
    <Dialog
      v-model:visible="showDeleteModal"
      modal
      :showHeader="false"
      :style="{ width: '380px', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div class="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
          <i class="pi pi-trash text-red-500 text-lg"></i>
        </div>
        <div>
          <p class="font-semibold text-gray-800">Hapus kategori ini?</p>
          <p class="text-sm text-gray-400 mt-1">
            Kategori <b class="text-gray-700">{{ selectedCategory?.name }}</b> akan dihapus
            permanen.
          </p>
        </div>
      </div>
      <div class="flex gap-2 px-6 pb-6">
        <button
          @click="showDeleteModal = false"
          class="flex-1 py-2.5 text-sm text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          @click="deleteData"
          :disabled="isSubmitting"
          class="flex-1 py-2.5 text-sm text-white font-semibold bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-colors disabled:opacity-60"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-xs mr-1"></i>
          Hapus
        </button>
      </div>
    </Dialog>
  </div>
</template>
