<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/axios'
import { getImageUrl, handleImageError } from '@/utils/image'
import { showError, showWarning } from '@/utils/notify'
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
    showWarning('Maks. 1MB')
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
    showError(e.response?.data?.message || 'Terjadi kesalahan saat menyimpan menu')
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
    showError(e.response?.data?.message || 'Terjadi kesalahan saat mengubah menu')
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
        <h3 class="text-xl font-extrabold" style="color: var(--tinta)">Katalog Menu</h3>
        <p class="angka-nota text-[11px] uppercase tracking-[0.18em] mt-1" style="color: var(--tinta-soft)">Atur harga, ketersediaan, dan stok harian.</p>
      </div>
      <button
        @click="openAdd"
        class="btn-bata inline-flex items-center px-4 py-2.5 text-sm font-extrabold uppercase tracking-[0.12em] rounded-md transition-all"
      >
        Menu Baru
      </button>
    </div>

    <div class="tabel-bon kertas rounded-md border-2 overflow-hidden" style="border-color: var(--tinta)">
      <div v-if="isLoading" class="px-4 py-2" aria-label="Memuat data menu">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 py-3.5 border-b border-dashed last:border-0 animate-pulse" style="border-color: var(--garis)">
          <div class="w-10 h-10 rounded flex-shrink-0" style="background: var(--krem-deep)"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 rounded w-2/5" style="background: var(--krem-deep)"></div>
            <div class="h-3 rounded w-1/4" style="background: var(--krem-deep)"></div>
          </div>
          <div class="h-4 rounded w-20 flex-shrink-0" style="background: var(--krem-deep)"></div>
        </div>
      </div>
      <DataTable v-else :value="menus" paginator :rows="8" :rowHover="true">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <p class="angka-nota text-[11px] font-bold uppercase tracking-[0.22em]">Etalase kosong</p>
            <p class="text-sm font-medium">Belum ada menu</p>
          </div>
        </template>
        <Column field="name" header="Produk">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded overflow-hidden flex-shrink-0 border-2"
                style="border-color: var(--tinta)"
              >
                <img
                  :src="getImageUrl(data?.image_url)"
                  @error="handleImageError"
                  class="w-full h-full object-cover"
                  :alt="data.name"
                />
              </div>
              <span class="font-bold" style="color: var(--tinta)">{{ data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="price" header="Harga">
          <template #body="{ data }"
            ><span class="angka-nota font-extrabold" style="color: var(--tinta)">{{ fmt(data.price) }}</span></template
          >
        </Column>
        <Column field="stock" header="Stok">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{
                  background:
                    data.stock > 15 ? 'var(--papan)' : data.stock > 0 ? 'var(--nota-deep)' : 'var(--bata)',
                }"
              ></span>
              <span class="angka-nota text-xs font-extrabold" style="color: var(--tinta)">{{ data.stock }} pcs</span>
            </span>
          </template>
        </Column>
        <Column field="is_available" header="Status">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ background: data.is_available ? 'var(--papan)' : 'var(--tinta-soft)' }"
              ></span>
              <span class="angka-nota text-xs font-extrabold uppercase tracking-[0.14em]" style="color: var(--tinta)">
                {{ data.is_available ? 'Tersedia' : 'Habis' }}
              </span>
            </span>
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

    <!-- Reusable modal form body template -->
    <template v-for="mode in ['add', 'edit']" :key="mode">
      <Dialog
        v-model:visible="modals[mode]"
        modal
        :showHeader="false"
        :style="{ width: '500px', borderRadius: '0.6rem', overflow: 'hidden' }"
        :pt="{
          content: { style: 'padding: 0; background: transparent' },
          root: { style: 'border-radius: 0.6rem; overflow: hidden' },
        }"
      >
        <!-- Header -->
        <div class="nota-slip px-6 pt-5 pb-4">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Katalog menu</p>
              <p class="text-base font-extrabold truncate" style="color: var(--tinta)">
                {{ mode === 'add' ? 'Tambah menu baru' : 'Ubah menu' }}
              </p>
            </div>
            <button
              @click="modals[mode] = false"
              aria-label="Tutup"
              class="w-7 h-7 flex items-center justify-center rounded border-2 flex-shrink-0"
              style="border-color: var(--tinta); color: var(--tinta)"
            >
              <i class="pi pi-times" style="font-size: 11px"></i>
            </button>
          </div>
        </div>
        <div class="sobek sobek-kuning" aria-hidden="true"></div>

        <!-- Body -->
        <div class="kertas px-6 py-5 flex flex-col gap-4">
          <!-- Nama -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >Nama Menu</label
            >
            <div>
              <input
                v-model="form.name"
                type="text"
                placeholder="Contoh: Nasi Goreng Spesial"
                class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
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
                  class="w-full pl-9 pr-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >Stok</label
              >
              <div>
                <input
                  v-model="form.stock"
                  type="number"
                  placeholder="0"
                  class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
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
            <div>
              <select
                v-model="form.category_id"
                class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800"
              >
                <option value="" disabled class="text-gray-300">Pilih kategori…</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Foto -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Foto Menu
              <span class="font-normal normal-case text-gray-300">(opsional · maks. 1MB)</span>
            </label>
            <label
              class="flex items-center px-4 py-3 border border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
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
        <div class="kertas flex gap-2 px-6 pb-5 pt-1">
          <!-- 4. Update cara tutup modal dari tombol Batal -->
          <button
            @click="modals[mode] = false"
            class="flex-1 py-2.5 text-sm font-bold rounded-md border-2 transition-colors"
            style="border-color: var(--tinta); color: var(--tinta)"
          >
            Batal
          </button>
          <button
            @click="mode === 'add' ? saveData() : updateData()"
            :disabled="isSubmitting"
            class="btn-bata flex-1 py-2.5 font-extrabold text-sm uppercase tracking-[0.12em] rounded-md transition-all disabled:opacity-50"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
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
      :style="{ width: '380px', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-6 pt-5 pb-4 text-center">
        <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Katalog menu</p>
        <p class="text-base font-extrabold" style="color: var(--tinta)">Hapus menu ini?</p>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>
      <div class="kertas px-6 py-5 flex flex-col items-center text-center gap-3">
        <span class="cap" style="color: #b91c1c">Hapus?</span>
        <p class="text-sm" style="color: var(--tinta-soft)">
          Menu <b style="color: var(--tinta)">{{ selectedMenu?.name }}</b> akan dihapus dari katalog.
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
