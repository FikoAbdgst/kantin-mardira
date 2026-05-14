<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/axios'
import { getImageUrl, handleImageError } from '@/utils/image'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

const menus = ref([])
const categories = ref([])
const isLoading = ref(false)

const modals = reactive({
  add: false,
  edit: false,
})
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

// 1. Tambahkan state untuk menyimpan file gambar asli
const selectedImageFile = ref(null)

const fetchData = async () => {
  isLoading.value = true
  try {
    const [r1, r2] = await Promise.all([api.get('/menus'), api.get('/categories')])
    menus.value = r1.data.data || r1.data
    categories.value = r2.data.data || r2.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = (e) => {
  const f = e.target.files[0]
  if (!f) return
  if (f.size > 1024 * 1024) {
    alert('Maks. 1MB')
    e.target.value = ''
    return
  }

  // 2. Simpan file aslinya untuk dikirim ke backend
  selectedImageFile.value = f

  // Gunakan FileReader hanya untuk menampilkan PREVIEW di layar form
  const r = new FileReader()
  r.onload = (ev) => {
    form.value.image_url = ev.target.result
  }
  r.readAsDataURL(f)
}

const openAdd = () => {
  form.value = { name: '', price: 0, stock: 0, category_id: '', is_available: true, image_url: '' }
  selectedImageFile.value = null // Reset file
  modals.add = true
}

const openEdit = (menu) => {
  selectedMenu.value = menu
  form.value = {
    name: menu.name,
    price: menu.price,
    stock: menu.stock,
    category_id: menu.category_id || menu.category?.id || '',
    is_available: menu.is_available,
    image_url: menu.image_url || '',
  }
  selectedImageFile.value = null // Reset file
  modals.edit = true
}

const openDelete = (menu) => {
  selectedMenu.value = menu
  showDeleteModal.value = true
}

// 3. Fungsi bantuan untuk membungkus payload menjadi Multipart Form Data
const buildFormData = () => {
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('price', form.value.price)
  formData.append('stock', form.value.stock)
  formData.append('category_id', form.value.category_id)
  formData.append('is_available', form.value.is_available)

  // Hanya masukkan kolom image jika ada file baru yang diunggah
  if (selectedImageFile.value) {
    formData.append('image', selectedImageFile.value)
  }

  return formData
}

const saveData = async () => {
  isSubmitting.value = true
  try {
    // 4. Kirim FormData dan beri tahu Axios ini adalah multipart/form-data
    const payload = buildFormData()
    await api.post('/menus', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    modals.add = false
    fetchData()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'Terjadi kesalahan saat menyimpan menu')
  } finally {
    isSubmitting.value = false
  }
}

const updateData = async () => {
  isSubmitting.value = true
  try {
    // Lakukan hal yang sama untuk update
    const payload = buildFormData()
    await api.put(`/menus/${selectedMenu.value.id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    modals.edit = false
    fetchData()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || 'Terjadi kesalahan saat mengubah menu')
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
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const fmt = (v) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(v)

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-xl font-bold text-gray-800">Katalog Menu</h3>
        <p class="text-sm text-gray-400 mt-0.5">Atur harga, ketersediaan, dan stok harian.</p>
      </div>
      <button
        @click="openAdd"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
      >
        <i class="pi pi-plus text-xs"></i> Menu Baru
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
      <DataTable :value="menus" :loading="isLoading" paginator :rows="8" :rowHover="true">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="pi pi-shopping-bag text-4xl mb-3 text-amber-200"></i>
            <p class="text-sm font-medium">Belum ada menu</p>
          </div>
        </template>
        <Column field="name" header="Produk">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-2xl overflow-hidden bg-amber-50 border border-amber-100 flex-shrink-0"
              >
                <img
                  :src="getImageUrl(data?.image_url)"
                  @error="handleImageError"
                  class="w-full h-full object-cover"
                  :alt="data.name"
                />
              </div>
              <span class="font-semibold text-gray-800">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="price" header="Harga">
          <template #body="{ data }"
            ><span class="font-bold text-orange-500">{{ fmt(data.price) }}</span></template
          >
        </Column>
        <Column field="stock" header="Stok">
          <template #body="{ data }">
            <span
              class="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full"
              :class="
                data.stock > 15
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                  : data.stock > 0
                    ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                    : 'bg-red-50 text-red-500 ring-1 ring-red-200'
              "
            >
              {{ data.stock }} pcs
            </span>
          </template>
        </Column>
        <Column field="is_available" header="Status">
          <template #body="{ data }">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full"
              :class="
                data.is_available
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="data.is_available ? 'bg-emerald-500' : 'bg-gray-400'"
              ></span>
              {{ data.is_available ? 'Tersedia' : 'Habis' }}
            </span>
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

    <!-- Reusable modal form body template -->
    <template v-for="mode in ['add', 'edit']" :key="mode">
      <Dialog
        v-model:visible="modals[mode]"
        modal
        :showHeader="false"
        :style="{ width: '500px', borderRadius: '1.25rem', overflow: 'hidden' }"
        :pt="{
          content: { style: 'padding: 0' },
          root: { style: 'border-radius: 1.25rem; overflow: hidden' },
        }"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center"
              :class="mode === 'add' ? 'bg-orange-100' : 'bg-blue-100'"
            >
              <i
                :class="`pi ${mode === 'add' ? 'pi-shopping-bag text-orange-500' : 'pi-pencil text-blue-500'}`"
                style="font-size: 11px"
              ></i>
            </div>
            <h3 class="text-base font-semibold text-gray-800">
              {{ mode === 'add' ? 'Tambah Menu Baru' : 'Edit Menu' }}
            </h3>
          </div>
          <!-- 4. Update cara tutup modal dari tombol silang -->
          <button
            @click="modals[mode] = false"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <i class="pi pi-times" style="font-size: 11px"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 flex flex-col gap-4">
          <!-- Nama -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >Nama Menu</label
            >
            <div class="relative">
              <i
                class="pi pi-shopping-bag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style="font-size: 13px"
              ></i>
              <input
                v-model="form.name"
                type="text"
                placeholder="Contoh: Nasi Goreng Spesial"
                class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
              />
            </div>
          </div>

          <!-- Harga & Stok -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >Harga Jual</label
              >
              <div class="relative">
                <span
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none"
                  >Rp</span
                >
                <input
                  v-model="form.price"
                  type="number"
                  placeholder="0"
                  class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >Stok</label
              >
              <div class="relative">
                <i
                  class="pi pi-box absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  style="font-size: 13px"
                ></i>
                <input
                  v-model="form.stock"
                  type="number"
                  placeholder="0"
                  class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
                />
              </div>
              <p class="text-xs text-gray-300">Dalam satuan pcs</p>
            </div>
          </div>

          <!-- Kategori -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >Kategori</label
            >
            <div class="relative">
              <i
                class="pi pi-tag absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style="font-size: 13px"
              ></i>
              <select
                v-model="form.category_id"
                class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800 appearance-none"
              >
                <option value="" disabled class="text-gray-300">Pilih kategori…</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <i
                class="pi pi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                style="font-size: 11px"
              ></i>
            </div>
          </div>

          <!-- Foto -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Foto Menu
              <span class="font-normal normal-case text-gray-300">(opsional · maks. 1MB)</span>
            </label>
            <label
              class="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <i class="pi pi-image text-gray-300 text-lg flex-shrink-0"></i>
              <span class="text-sm text-gray-400">Klik untuk unggah gambar</span>
              <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" />
            </label>
            <div class="flex items-center gap-3 mt-1">
              <img
                :src="getImageUrl(form?.image_url)"
                @error="handleImageError"
                class="w-14 h-14 object-cover rounded-xl border border-amber-100"
                alt="Preview gambar menu"
              />
              <div>
                <p class="text-xs font-medium text-gray-600">
                  {{ form.image_url ? 'Gambar terpilih' : 'Default image aktif' }}
                </p>
                <button
                  v-if="form.image_url"
                  @click="form.image_url = ''"
                  class="text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-100"></div>

          <!-- Toggle availability -->
          <label
            class="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors -mx-1"
          >
            <div
              class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
              :class="form.is_available ? 'bg-orange-400' : 'bg-gray-200'"
              @click="form.is_available = !form.is_available"
            >
              <div
                class="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                :class="form.is_available ? 'left-5' : 'left-1'"
              ></div>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-700">Tampilkan di etalase kasir</p>
              <p class="text-xs text-gray-400">Menu bisa dipilih oleh kasir saat transaksi</p>
            </div>
          </label>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 px-6 pb-5 pt-1">
          <!-- 4. Update cara tutup modal dari tombol Batal -->
          <button
            @click="modals[mode] = false"
            class="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors rounded-xl hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            @click="mode === 'add' ? saveData() : updateData()"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
            :class="
              mode === 'add' ? 'bg-orange-400 hover:bg-orange-500' : 'bg-blue-500 hover:bg-blue-600'
            "
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
            <i v-else class="pi pi-check" style="font-size: 11px"></i>
            {{ mode === 'add' ? 'Simpan Menu' : 'Update' }}
          </button>
        </div>
      </Dialog>
    </template>

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
          <p class="font-semibold text-gray-800">Hapus menu ini?</p>
          <p class="text-sm text-gray-400 mt-1">
            Menu <b class="text-gray-700">{{ selectedMenu?.name }}</b> akan dihapus dari katalog.
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
