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
const avatarColor = (name) => {
  const c = [
    'bg-orange-100 text-orange-600',
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-teal-100 text-teal-600',
    'bg-pink-100 text-pink-600',
  ]
  return c[(name?.charCodeAt(0) || 0) % c.length]
}

const roleOptions = [
  { value: 'admin', label: 'Admin', desc: 'Akses penuh ke semua fitur', icon: 'pi-shield' },
  { value: 'manager', label: 'Manager', desc: 'Lihat laporan & kelola stok', icon: 'pi-chart-bar' },
  { value: 'cashier', label: 'Cashier', desc: 'Hanya akses transaksi kasir', icon: 'pi-wallet' },
]

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-xl font-bold text-gray-800">Manajemen User</h3>
        <p class="text-sm text-gray-400 mt-0.5">Kelola hak akses akun karyawan dan staf kantin.</p>
      </div>
      <button
        @click="openAdd"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
      >
        <i class="pi pi-plus text-xs"></i> Tambah User
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
      <DataTable :value="users" :loading="isLoading" :rowHover="true">
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 text-gray-400">
            <i class="pi pi-users text-4xl mb-3 text-amber-200"></i>
            <p class="text-sm font-medium">Belum ada user terdaftar</p>
          </div>
        </template>
        <Column field="name" header="Nama">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                :class="avatarColor(data.name)"
              >
                {{ data.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-gray-800 leading-tight">{{ data.name }}</p>
                <p class="text-xs text-gray-400">{{ data.email }}</p>
              </div>
            </div>
          </template>
        </Column>
        <Column field="role" header="Jabatan">
          <template #body="{ data }">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize"
              :class="roleStyle(data.role).bg"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="roleStyle(data.role).dot"></span>
              {{ data.role }}
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

    <!-- Shared form content as reusable structure inside each modal -->

    <!-- Add Modal -->
    <Dialog
      v-model:visible="showAddModal"
      modal
      :showHeader="false"
      :style="{ width: '460px', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <i class="pi pi-user-plus text-orange-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Tambah User Baru</h3>
        </div>
        <button
          @click="showAddModal = false"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-4">
        <!-- Nama -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Nama Lengkap</label
          >
          <div class="relative">
            <i
              class="pi pi-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.name"
              type="text"
              placeholder="Nama karyawan..."
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
          </div>
        </div>
        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
          <div class="relative">
            <i
              class="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@contoh.com"
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
          </div>
        </div>
        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Password</label
          >
          <div class="relative">
            <i
              class="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 8 karakter"
              class="w-full pl-9 pr-10 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
            <button
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i
                :class="`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`"
                style="font-size: 13px"
              ></i>
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
              <i
                :class="`pi ${opt.icon}`"
                class="text-base"
                :style="form.role === opt.value ? 'color: #f97316' : 'color: #9ca3af'"
              ></i>
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
      :style="{ width: '460px', borderRadius: '1.25rem', overflow: 'hidden' }"
      :pt="{
        content: { style: 'padding: 0' },
        root: { style: 'border-radius: 1.25rem; overflow: hidden' },
      }"
    >
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <i class="pi pi-user-edit text-blue-500" style="font-size: 11px"></i>
          </div>
          <h3 class="text-base font-semibold text-gray-800">Edit Data User</h3>
        </div>
        <button
          @click="showEditModal = false"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <i class="pi pi-times" style="font-size: 11px"></i>
        </button>
      </div>

      <div class="px-6 py-5 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >Nama Lengkap</label
          >
          <div class="relative">
            <i
              class="pi pi-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.name"
              type="text"
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
          <div class="relative">
            <i
              class="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.email"
              type="email"
              class="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all text-gray-800"
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
          <div class="relative">
            <i
              class="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
              style="font-size: 13px"
            ></i>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-9 pr-10 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 focus:bg-white transition-all placeholder-gray-300 text-gray-800"
            />
            <button
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i
                :class="`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`"
                style="font-size: 13px"
              ></i>
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
              <i
                :class="`pi ${opt.icon}`"
                class="text-base"
                :style="form.role === opt.value ? 'color: #f97316' : 'color: #9ca3af'"
              ></i>
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
          <i class="pi pi-user-minus text-red-500 text-lg"></i>
        </div>
        <div>
          <p class="font-semibold text-gray-800">Hapus user ini?</p>
          <p class="text-sm text-gray-400 mt-1">
            Akun <b class="text-gray-700">{{ selectedUser?.name }}</b> akan dihapus permanen.
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
