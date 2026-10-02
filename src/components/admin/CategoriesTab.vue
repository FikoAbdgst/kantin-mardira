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
        <h3 class="text-xl font-extrabold" style="color: var(--tinta)">Kategori Menu</h3>
        <p class="angka-nota text-[11px] uppercase tracking-[0.18em] mt-1" style="color: var(--tinta-soft)">Kelompokkan menu agar mudah dicari kasir.</p>
      </div>
      <button
        @click="openAdd"
        class="btn-bata inline-flex items-center px-4 py-2.5 text-sm font-extrabold uppercase tracking-[0.12em] rounded-md transition-all"
      >
        Tambah Kategori
      </button>
    </div>

    <div class="tabel-bon kertas rounded-md border-2 overflow-hidden" style="border-color: var(--tinta)">
      <div v-if="isLoading" class="px-4 py-2" aria-label="Memuat data kategori">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 py-3.5 border-b border-dashed last:border-0 animate-pulse" style="border-color: var(--garis)">
          <div class="w-8 h-8 rounded-lg flex-shrink-0" style="background: var(--krem-deep)"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 rounded w-1/2" style="background: var(--krem-deep)"></div>
          </div>
          <div class="h-4 rounded w-16 flex-shrink-0" style="background: var(--krem-deep)"></div>
        </div>
      </div>
      <DataTable v-else :value="categories" :rowHover="true">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <p class="angka-nota text-[11px] font-bold uppercase tracking-[0.22em]">Arsip kosong</p>
            <p class="text-sm font-medium">Belum ada kategori</p>
          </div>
        </template>
        <Column field="name" header="Nama kategori">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm flex-shrink-0 border-2"
                style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
              >
                {{ data.name?.charAt(0)?.toUpperCase() }}
              </div>
              <span class="font-bold" style="color: var(--tinta)">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column header="Aksi" style="width: 100px" align="center">
          <template #body="{ data }">
            <div class="flex justify-center gap-1.5">
              <button
                @click="openEdit(data)"
                aria-label="Ubah"
                class="w-8 h-8 flex items-center justify-center rounded border transition-colors"
                style="border-color: var(--garis); color: var(--tinta)"
              >
                <i class="pi pi-pencil text-xs"></i>
              </button>
              <button
                @click="openDelete(data)"
                aria-label="Hapus"
                class="w-8 h-8 flex items-center justify-center rounded border transition-colors"
                style="border-color: var(--garis); color: var(--bata-deep)"
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
      :style="{ width: '420px', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-6 pt-5 pb-4">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Arsip kategori</p>
            <p class="text-base font-extrabold truncate" style="color: var(--tinta)">Tambah kategori</p>
          </div>
          <button
            @click="showAddModal = false"
            aria-label="Tutup"
            class="w-7 h-7 flex items-center justify-center rounded border-2 flex-shrink-0"
            style="border-color: var(--tinta); color: var(--tinta)"
          >
            <i class="pi pi-times" style="font-size: 11px"></i>
          </button>
        </div>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>

      <div class="kertas px-6 py-5">
        <div class="flex flex-col gap-1.5">
          <label class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]"
            >Nama kategori</label
          >
          <div>
            <input
              v-model="form.name"
              type="text"
              placeholder="Contoh: Makanan Berat, Minuman..."
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none transition-all placeholder-gray-300"
            />
          </div>
        </div>
      </div>

      <div class="kertas flex gap-2 px-6 pb-5 pt-1">
        <button
          @click="showAddModal = false"
          class="flex-1 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          Batal
        </button>
        <button
          @click="saveData"
          :disabled="isSubmitting"
          class="btn-bata flex-1 py-2.5 font-extrabold text-sm uppercase tracking-[0.12em] rounded-md transition-all disabled:opacity-50"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
          Simpan
        </button>
      </div>
    </Dialog>

    <!-- Edit Modal -->
    <Dialog
      v-model:visible="showEditModal"
      modal
      :showHeader="false"
      :style="{ width: '420px', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-6 pt-5 pb-4">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Arsip kategori</p>
            <p class="text-base font-extrabold truncate" style="color: var(--tinta)">Ubah kategori</p>
          </div>
          <button
            @click="showEditModal = false"
            aria-label="Tutup"
            class="w-7 h-7 flex items-center justify-center rounded border-2 flex-shrink-0"
            style="border-color: var(--tinta); color: var(--tinta)"
          >
            <i class="pi pi-times" style="font-size: 11px"></i>
          </button>
        </div>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>

      <div class="kertas px-6 py-5">
        <div class="flex flex-col gap-1.5">
          <label class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]"
            >Nama kategori</label
          >
          <div>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div class="kertas flex gap-2 px-6 pb-5 pt-1">
        <button
          @click="showEditModal = false"
          class="flex-1 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          Batal
        </button>
        <button
          @click="updateData"
          :disabled="isSubmitting"
          class="btn-bata flex-1 py-2.5 font-extrabold text-sm uppercase tracking-[0.12em] rounded-md transition-all disabled:opacity-50"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
          Update
        </button>
      </div>
    </Dialog>

    <!-- Delete Modal -->
    <Dialog
      v-model:visible="showDeleteModal"
      modal
      :showHeader="false"
      :style="{ width: '380px', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-6 pt-5 pb-4 text-center">
        <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Arsip kategori</p>
        <p class="text-base font-extrabold" style="color: var(--tinta)">Hapus kategori ini?</p>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>
      <div class="kertas px-6 py-5 flex flex-col items-center text-center gap-3">
        <span class="cap" style="color: #b91c1c">Hapus?</span>
        <p class="text-sm" style="color: var(--tinta-soft)">
          Kategori <b style="color: var(--tinta)">{{ selectedCategory?.name }}</b> akan dihapus
          permanen.
        </p>
      </div>
      <div class="kertas flex gap-2 px-6 pb-6">
        <button
          @click="showDeleteModal = false"
          class="flex-1 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
          style="border-color: var(--tinta); color: var(--tinta)"
        >
          Batal
        </button>
        <button
          @click="deleteData"
          :disabled="isSubmitting"
          class="btn-bata flex-1 py-2.5 font-extrabold text-sm uppercase tracking-[0.12em] rounded-md transition-all disabled:opacity-50"
        >
          <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-xs mr-1"></i>
          Hapus
        </button>
      </div>
    </Dialog>
  </div>
</template>
