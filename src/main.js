import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'sweetalert2/dist/sweetalert2.min.css'
import '@/assets/main.css'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import notify from '@/utils/notify'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.globalProperties.$notify = notify
app.provide('notify', notify)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark-mode-manual',
        },
    },
})

app.mount('#app')
