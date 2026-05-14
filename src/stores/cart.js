import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const items = ref([])

    const addToCart = (menu) => {
        const existingItem = items.value.find(item => item.id === menu.id)
        if (existingItem) {
            existingItem.qty++
        } else {
            items.value.push({ ...menu, qty: 1 })
        }
    }

    const removeFromCart = (menuId) => {
        const index = items.value.findIndex(item => item.id === menuId)
        if (index !== -1) {
            if (items.value[index].qty > 1) {
                items.value[index].qty--
            }
        }
    }

    const deleteItem = (menuId) => {
        const index = items.value.findIndex(item => item.id === menuId)
        if (index !== -1) {
            items.value.splice(index, 1)
        }
    }

    const clearCart = () => {
        items.value = []
    }

    const totalPrice = computed(() => {
        return items.value.reduce((total, item) => total + (item.price * item.qty), 0)
    })

    return { items, addToCart, removeFromCart, deleteItem, clearCart, totalPrice }
})