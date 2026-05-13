<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/axios'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

const users = ref([])
const isLoading = ref(false)

// State untuk Modal & Form
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'cashier',
})
const selectedUser = ref(null)

const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data.data || res.data
  } catch (e) {
    console.error('Gagal memuat data users:', e)
  } finally {
    isLoading.value = false
  }
}

// Actions
const openAdd = () => {
  form.value = { name: '', email: '', password: '', role: 'cashier' }
  showAddModal.value = true
}

const openEdit = (user) => {
  selectedUser.value = user

  const validRoles = ['admin', 'manager', 'cashier']

  const safeRole = validRoles.includes(user.role) ? user.role : 'cashier'

  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: safeRole,
  }

  showEditModal.value = true
}

const openDelete = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

// API Calls
const saveData = async () => {
  isSubmitting.value = true
  try {
    await api.post('/users', form.value)
    showAddModal.value = false
    fetchData()
  } catch (e) {
    console.error('Gagal menambah user:', e)
  } finally {
    isSubmitting.value = false
  }
}

const updateData = async () => {
  isSubmitting.value = true
  try {
    const payload = { ...form.value }

    // Hapus properti password jika kosong agar tidak diupdate
    if (!payload.password || payload.password.trim() === '') {
      delete payload.password
    }

    await api.put(`/users/${selectedUser.value.id}`, payload)

    showEditModal.value = false
    fetchData()
  } catch (e) {
    // Tangkap dan tampilkan pesan spesifik dari backend
    const errorData = e.response?.data
    console.error('Gagal update user (Detail):', errorData)

    // Tampilkan alert agar mudah dibaca
    const errorMsg =
      errorData?.message || errorData?.error || 'Format data tidak valid (400 Bad Request)'
    alert(`Gagal update: ${errorMsg}`)
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
    console.error('Gagal hapus user:', e)
  } finally {
    isSubmitting.value = false
  }
}

const roleSeverity = (role) => {
  if (role === 'admin') return 'danger'
  if (role === 'manager') return 'info'
  return 'success'
}

onMounted(fetchData)
</script>

<template>
  <div class="animate-fadein">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Manajemen User</h2>
        <p class="mt-1 text-sm text-gray-500">Kelola hak akses akun karyawan dan staf kantin.</p>
      </div>
      <Button
        label="Tambah User"
        icon="pi pi-plus"
        class="bg-emerald-600 hover:bg-emerald-700 border-none shadow-sm"
        @click="openAdd"
      />
    </div>

    <div class="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
      <DataTable :value="users" :loading="isLoading" hoverRows>
        <Column field="name" header="Nama Lengkap">
          <template #body="{ data }">
            <span class="font-semibold text-gray-800">{{ data.name }}</span>
          </template>
        </Column>
        <Column field="email" header="Email Akses"></Column>
        <Column field="role" header="Jabatan">
          <template #body="{ data }">
            <Tag :value="data.role" :severity="roleSeverity(data.role)" class="uppercase" />
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
      header="Tambah User Baru"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div>
          <label class="block mb-1 text-sm font-medium">Nama Lengkap</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Role / Jabatan</label>
          <select
            v-model="form.role"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
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

    <Dialog
      v-model:visible="showEditModal"
      modal
      header="Edit Data User"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div>
          <label class="block mb-1 text-sm font-medium">Nama Lengkap</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium"
            >Password (Kosongkan jika tidak diubah)</label
          >
          <input
            v-model="form.password"
            type="password"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Role / Jabatan</label>
          <select
            v-model="form.role"
            class="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
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
        Apakah Anda yakin ingin menghapus user <b>{{ selectedUser?.name }}</b
        >?
      </p>
      <template #footer>
        <Button label="Batal" text severity="secondary" @click="showDeleteModal = false" />
        <Button label="Hapus" severity="danger" :loading="isSubmitting" @click="deleteData" />
      </template>
    </Dialog>
  </div>
</template>
