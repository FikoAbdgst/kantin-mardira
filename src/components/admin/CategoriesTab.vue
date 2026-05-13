<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import Button from 'primevue/button'
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
    console.error('Gagal memuat data kategori:', e)
  } finally {
    isLoading.value = false
  }
}

const openAdd = () => {
  form.value = { name: '' }
  showAddModal.value = true
}

const openEdit = (category) => {
  selectedCategory.value = category
  form.value = { name: category.name }
  showEditModal.value = true
}

const openDelete = (category) => {
  selectedCategory.value = category
  showDeleteModal.value = true
}

const saveData = async () => {
  isSubmitting.value = true
  try {
    await api.post('/categories', form.value)
    showAddModal.value = false
    fetchData()
  } catch (e) {
    console.error('Gagal menambah kategori:', e)
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
    console.error('Gagal update kategori:', e)
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
    console.error('Gagal hapus kategori:', e)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="animate-fadein">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Kategori Menu</h2>
        <p class="mt-1 text-sm text-gray-500">Kelompokkan menu agar mudah dicari oleh kasir.</p>
      </div>
      <Button
        label="Tambah Kategori"
        icon="pi pi-plus"
        class="bg-teal-500 hover:bg-teal-600 border-none shadow-sm"
        @click="openAdd"
      />
    </div>

    <div class="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
      <DataTable :value="categories" :loading="isLoading" hoverRows>
        <Column field="name" header="Nama Kategori">
          <template #body="{ data }">
            <span class="font-semibold text-gray-800">{{ data.name }}</span>
          </template>
        </Column>
        <Column header="Aksi" style="width: 120px" align="center">
          <template #body="{ data }">
            <div class="flex justify-center gap-2">
              <Button
                icon="pi pi-pencil"
                severity="info"
                outlined
                rounded
                size="small"
                @click="openEdit(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                outlined
                rounded
                size="small"
                @click="openDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="showAddModal"
      modal
      header="Tambah Kategori Baru"
      :style="{ width: '400px' }"
    >
      <div class="pt-2">
        <label class="block mb-1 text-sm font-medium">Nama Kategori</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="showAddModal = false" />
        <Button
          label="Simpan"
          class="bg-teal-600 border-none"
          :loading="isSubmitting"
          @click="saveData"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showEditModal"
      modal
      header="Edit Kategori"
      :style="{ width: '400px' }"
    >
      <div class="pt-2">
        <label class="block mb-1 text-sm font-medium">Nama Kategori</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="showEditModal = false" />
        <Button
          label="Update"
          class="bg-blue-600 border-none"
          :loading="isSubmitting"
          @click="updateData"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteModal"
      modal
      header="Konfirmasi Hapus"
      :style="{ width: '400px' }"
    >
      <p class="pt-2 text-gray-700">
        Hapus kategori <b>{{ selectedCategory?.name }}</b
        >?
      </p>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="showDeleteModal = false" />
        <Button label="Hapus" severity="danger" :loading="isSubmitting" @click="deleteData" />
      </template>
    </Dialog>
  </div>
</template>
