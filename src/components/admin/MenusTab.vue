<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

const menus = ref([])
const categories = ref([]) // Untuk form dropdown kategori
const isLoading = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)

const form = ref({
  name: '',
  price: 0,
  stock: 0,
  category_id: '',
  is_available: true,
  image_url: '',
})
const selectedMenu = ref(null)

const fetchData = async () => {
  isLoading.value = true
  try {
    const [resMenus, resCategories] = await Promise.all([
      api.get('/menus'),
      api.get('/categories'), // Fetch categories buat form
    ])
    menus.value = resMenus.data.data || resMenus.data
    categories.value = resCategories.data.data || resCategories.data
  } catch (e) {
    console.error('Gagal memuat data menu/kategori:', e)
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 1024 * 1024) {
      alert('Ukuran gambar terlalu besar! Maksimal 1MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.image_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const openAdd = () => {
  form.value = {
    name: '',
    price: 0,
    stock: 0,
    category_id: '',
    is_available: true,
    image_url: '',
  }
  showAddModal.value = true
}

const openEdit = (menu) => {
  selectedMenu.value = menu
  const catId = menu.category_id || (menu.category && menu.category.id) || ''

  form.value = {
    name: menu.name,
    price: menu.price,
    stock: menu.stock,
    category_id: catId,
    is_available: menu.is_available,
    image_url: menu.image_url || '', // Tambahkan ini
  }
  showEditModal.value = true
}

const openDelete = (menu) => {
  selectedMenu.value = menu
  showDeleteModal.value = true
}

const saveData = async () => {
  isSubmitting.value = true
  try {
    await api.post('/menus', form.value)
    showAddModal.value = false
    fetchData()
  } catch (e) {
    console.error('Gagal menambah menu:', e)
  } finally {
    isSubmitting.value = false
  }
}

const updateData = async () => {
  isSubmitting.value = true
  try {
    await api.put(`/menus/${selectedMenu.value.id}`, form.value)
    showEditModal.value = false
    fetchData()
  } catch (e) {
    console.error('Gagal update menu:', e)
  } finally {
    isSubmitting.value = false
  }
}

const deleteData = async () => {
  isSubmitting.value = true
  try {
    await api.delete(`/menus/${selectedMenu.value.id}`)
    showDeleteModal.value = false
    fetchData()
  } catch (e) {
    console.error('Gagal hapus menu:', e)
  } finally {
    isSubmitting.value = false
  }
}

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)

onMounted(fetchData)
</script>

<template>
  <div class="animate-fadein">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Katalog Menu</h2>
        <p class="mt-1 text-sm text-gray-500">Atur harga, ketersediaan, dan stok harian.</p>
      </div>
      <Button
        label="Menu Baru"
        icon="pi pi-plus"
        class="bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm"
        @click="openAdd"
      />
    </div>

    <div class="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
      <DataTable :value="menus" :loading="isLoading" paginator :rows="8" hoverRows>
        <Column field="name" header="Nama Produk">
          <template #body="{ data }">
            <span class="font-semibold text-gray-800">{{ data.name }}</span>
          </template>
        </Column>
        <Column field="price" header="Harga Jual">
          <template #body="{ data }">
            <span class="font-bold text-teal-600">{{ formatRupiah(data.price) }}</span>
          </template>
        </Column>
        <Column field="stock" header="Sisa Stok">
          <template #body="{ data }">
            <span
              class="px-3 py-1 text-xs font-bold rounded-full border shadow-sm"
              :class="
                data.stock > 15
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : data.stock > 0
                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                    : 'bg-red-50 text-red-600 border-red-200'
              "
            >
              {{ data.stock }} Pcs
            </span>
          </template>
        </Column>
        <Column field="is_available" header="Status Etalase">
          <template #body="{ data }">
            <Tag
              :value="data.is_available ? 'Tersedia' : 'Kosong'"
              :severity="data.is_available ? 'success' : 'danger'"
            />
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
      header="Tambah Menu Baru"
      :style="{ width: '500px' }"
    >
      <div class="grid grid-cols-2 gap-4 pt-2">
        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium">Nama Menu</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Harga (Rp)</label>
          <input
            v-model="form.price"
            type="number"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Stok Awal</label>
          <input
            v-model="form.stock"
            type="number"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium">Kategori</label>
          <select
            v-model="form.category_id"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="" disabled>Pilih Kategori...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium">Foto Menu (Opsional)</label>
          <input
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <div v-if="form.image_url" class="mt-3">
            <p class="mb-1 text-xs text-gray-500">Preview:</p>
            <img
              :src="form.image_url"
              alt="Preview Menu"
              class="object-cover w-32 h-32 border border-gray-200 shadow-sm rounded-xl"
            />
          </div>
        </div>

        <div class="col-span-2 flex items-center gap-2 mt-2">
          <input
            v-model="form.is_available"
            type="checkbox"
            id="avail_add"
            class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label for="avail_add" class="text-sm font-medium text-gray-700"
            >Tersedia di Etalase Kasir</label
          >
        </div>
      </div>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="showAddModal = false" />
        <Button
          label="Simpan"
          class="bg-emerald-600 border-none"
          :loading="isSubmitting"
          @click="saveData"
        />
      </template>
    </Dialog>

    <Dialog v-model:visible="showEditModal" modal header="Edit Menu" :style="{ width: '500px' }">
      <div class="grid grid-cols-2 gap-4 pt-2">
        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium">Nama Menu</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Harga (Rp)</label>
          <input
            v-model="form.price"
            type="number"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Stok</label>
          <input
            v-model="form.stock"
            type="number"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium">Kategori</label>
          <select
            v-model="form.category_id"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium">Foto Menu (Opsional)</label>
          <input
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <div v-if="form.image_url" class="mt-3">
            <p class="mb-1 text-xs text-gray-500">Preview:</p>
            <img
              :src="form.image_url"
              alt="Preview Menu"
              class="object-cover w-32 h-32 border border-gray-200 shadow-sm rounded-xl"
            />
          </div>
        </div>
        <div class="col-span-2 flex items-center gap-2 mt-2">
          <input
            v-model="form.is_available"
            type="checkbox"
            id="avail_edit"
            class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label for="avail_edit" class="text-sm font-medium text-gray-700"
            >Tersedia di Etalase Kasir</label
          >
        </div>
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
        Hapus menu <b>{{ selectedMenu?.name }}</b> dari katalog?
      </p>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="showDeleteModal = false" />
        <Button label="Hapus" severity="danger" :loading="isSubmitting" @click="deleteData" />
      </template>
    </Dialog>
  </div>
</template>
