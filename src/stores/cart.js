import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const items = ref([])

    // Action: Tambah menu ke keranjang
    const addToCart = (menu) => {
        const existingItem = items.value.find(item => item.id === menu.id)
        if (existingItem) {
            existingItem.qty++
        } else {
            items.value.push({ ...menu, qty: 1 })
        }
    }

    // Action: Kurangi qty atau hapus jika qty 0
    const removeFromCart = (menuId) => {
        const index = items.value.findIndex(item => item.id === menuId)
        if (index !== -1) {
            if (items.value[index].qty > 1) {
                items.value[index].qty--
            } else {
                items.value.splice(index, 1) // Hapus item dari array
            }
        }
    }

    // Action: Kosongkan keranjang setelah checkout
    const clearCart = () => {
        items.value = []
    }

    // Getter: Hitung total harga otomatis
    const totalPrice = computed(() => {
        return items.value.reduce((total, item) => total + (item.price * item.qty), 0)
    })

    return { items, addToCart, removeFromCart, clearCart, totalPrice }
})