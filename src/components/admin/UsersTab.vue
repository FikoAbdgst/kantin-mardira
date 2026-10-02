<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import { showError } from '@/utils/notify'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'

const users = ref([])
const isLoading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const form = ref({ name: '', email: '', password: '', role: 'cashier' })
const selectedUser = ref(null)
const showPassword = ref(false)

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data.data || res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
const openAdd = () => {
  form.value = { name: '', email: '', password: '', role: 'cashier' }
  showPassword.value = false
  showAddModal.value = true
}
const openEdit = (user) => {
  selectedUser.value = user
  const validRoles = ['admin', 'manager', 'cashier']
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: validRoles.includes(user.role) ? user.role : 'cashier',
  }
  showPassword.value = false
  showEditModal.value = true
}
const openDelete = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}
const saveData = async () => {
  isSubmitting.value = true
  try {
    await api.post('/users', form.value)
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
    const payload = { ...form.value }
    if (!payload.password?.trim()) delete payload.password
    await api.put(`/users/${selectedUser.value.id}`, payload)
    showEditModal.value = false
    fetchData()
  } catch (e) {
    showError(`Error: ${e.response?.data?.message || 'Gagal update'}`)
  } finally {
    isSubmitting.value = false
  }
}
const deleteData = async () => {
  isSubmitting.value = true
  try {
    await api.delete(`/users/${selectedUser.value.id}`)
    showDeleteModal.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
const roleStyle = (role) =>
  ({
    admin: { bg: 'bg-red-50 text-red-600 ring-1 ring-red-200', dot: 'bg-red-500' },
    manager: { bg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200', dot: 'bg-blue-500' },
    cashier: {
      bg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
      dot: 'bg-emerald-500',
    },
  })[role] || { bg: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' }
const roleOptions = [
  { value: 'admin', label: 'Admin', desc: 'Akses penuh ke semua fitur' },
  { value: 'manager', label: 'Manager', desc: 'Lihat laporan & kelola stok' },
  { value: 'cashier', label: 'Cashier', desc: 'Hanya akses transaksi kasir' },
]

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-xl font-extrabold" style="color: var(--tinta)">Manajemen User</h3>
        <p class="angka-nota text-[11px] uppercase tracking-[0.18em] mt-1" style="color: var(--tinta-soft)">Kelola hak akses akun karyawan dan staf kantin.</p>
      </div>
      <button
        @click="openAdd"
        class="btn-bata inline-flex items-center px-4 py-2.5 text-sm font-extrabold uppercase tracking-[0.12em] rounded-md transition-all"
      >
        Tambah User
      </button>
    </div>

    <div class="tabel-bon kertas rounded-md border-2 overflow-hidden" style="border-color: var(--tinta)">
      <div v-if="isLoading" class="px-4 py-2" aria-label="Memuat data user">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 py-3.5 border-b border-dashed last:border-0 animate-pulse" style="border-color: var(--garis)">
          <div class="w-9 h-9 rounded-full flex-shrink-0" style="background: var(--krem-deep)"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 rounded w-2/3" style="background: var(--krem-deep)"></div>
            <div class="h-3 rounded w-1/3" style="background: var(--krem-deep)"></div>
          </div>
          <div class="h-4 rounded w-20 flex-shrink-0" style="background: var(--krem-deep)"></div>
        </div>
      </div>
      <DataTable v-else :value="users" :rowHover="true">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <p class="angka-nota text-[11px] font-bold uppercase tracking-[0.22em]">Arsip kosong</p>
            <p class="text-sm font-medium">Belum ada user terdaftar</p>
          </div>
        </template>
        <Column field="name" header="Nama">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 border-2"
                style="background: var(--nota); border-color: var(--tinta); color: var(--tinta)"
              >
                {{ data.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <p class="font-bold leading-tight" style="color: var(--tinta)">{{ data.name }}</p>
                <p class="angka-nota text-xs" style="color: var(--tinta-soft)">{{ data.email }}</p>
              </div>
            </div>
          </template>
        </Column>
        <Column field="role" header="Jabatan">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="roleStyle(data.role).dot"></span>
              <span class="angka-nota text-xs font-extrabold uppercase tracking-[0.14em]" style="color: var(--tinta)">{{ data.role }}</span>
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

    <!-- Shared form content as reusable structure inside each modal -->

    <!-- Add Modal -->
    <Dialog
      v-model:visible="showAddModal"
      modal
      :showHeader="false"
      :style="{ width: '460px', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-6 pt-5 pb-4">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Arsip user</p>
            <p class="text-base font-extrabold truncate" style="color: var(--tinta)">Tambah user baru</p>
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

      <div class="kertas px-6 py-5 flex flex-col gap-4">
        <!-- Nama -->
        <div class="flex flex-col gap-1.5">
          <label class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]"
            >Nama lengkap</label
          >
          <div>
            <input
              v-model="form.name"
              type="text"
              placeholder="Nama karyawan..."
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
          </div>
        </div>
        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
          <div>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@contoh.com"
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
          </div>
        </div>
        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Password</label
          >
          <div>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 8 karakter"
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold underline underline-offset-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {{ showPassword ? 'Sembunyi' : 'Intip' }}
            </button>
          </div>
        </div>
        <!-- Role -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Role / Jabatan</label
          >
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opt in roleOptions"
              :key="opt.value"
              @click="form.role = opt.value"
              class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-center"
              :class="
                form.role === opt.value
                  ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              "
            >
              <span
                class="text-xs font-semibold"
                :class="form.role === opt.value ? 'text-orange-600' : 'text-gray-600'"
                >{{ opt.label }}</span
              >
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ roleOptions.find((r) => r.value === form.role)?.desc }}
          </p>
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
      :style="{ width: '460px', borderRadius: '0.6rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0; background: transparent' },
        root: { style: 'border-radius: 0.6rem; overflow: hidden' },
      }"
    >
      <div class="nota-slip px-6 pt-5 pb-4">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Arsip user</p>
            <p class="text-base font-extrabold truncate" style="color: var(--tinta)">Ubah data user</p>
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

      <div class="kertas px-6 py-5 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="angka-nota text-[11px] font-bold uppercase tracking-[0.18em]"
            >Nama lengkap</label
          >
          <div>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
          <div>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Password
            <span class="ml-1 normal-case font-normal text-gray-300"
              >(kosongkan jika tidak diubah)</span
            >
          </label>
          <div>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full px-4 py-3 text-sm bg-white/70 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold underline underline-offset-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {{ showPassword ? 'Sembunyi' : 'Intip' }}
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Role / Jabatan</label
          >
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opt in roleOptions"
              :key="opt.value"
              @click="form.role = opt.value"
              class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-center"
              :class="
                form.role === opt.value
                  ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              "
            >
              <span
                class="text-xs font-semibold"
                :class="form.role === opt.value ? 'text-orange-600' : 'text-gray-600'"
                >{{ opt.label }}</span
              >
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ roleOptions.find((r) => r.value === form.role)?.desc }}
          </p>
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
        <p class="angka-nota text-[11px] font-extrabold tracking-[0.24em] uppercase" style="color: var(--bata-deep)">Arsip user</p>
        <p class="text-base font-extrabold" style="color: var(--tinta)">Hapus user ini?</p>
      </div>
      <div class="sobek sobek-kuning" aria-hidden="true"></div>
      <div class="kertas px-6 py-5 flex flex-col items-center text-center gap-3">
        <span class="cap" style="color: #b91c1c">Hapus?</span>
        <p class="text-sm" style="color: var(--tinta-soft)">
          Akun <b style="color: var(--tinta)">{{ selectedUser?.name }}</b> akan dihapus permanen.
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
