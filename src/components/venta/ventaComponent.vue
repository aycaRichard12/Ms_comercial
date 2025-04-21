<template>
  <carritoVenta v-show="!showCart" @volver="toggleComponents" />
  <component
    v-show="showCart"
    :is="componenteSeleccionado"
    @seleccionar="mostrarComponente"
    @volver="componenteActual = 'tipo_doc'"
    @continuar="toggleComponents"
  />
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import carritoVenta from './carritoVenta.vue'
import { useCurrencyStore } from 'src/stores/currencyStore'

const currencyStore = useCurrencyStore()

// Opcional: cargar al iniciar si no está cargado
if (!currencyStore.divisa && !currencyStore.loading) {
  currencyStore.cargarDivisaActiva()
}
// Diccionario de componentes

const componentes = {
  tipo_doc: defineAsyncComponent(() => import('./typeDoc.vue')),
  preforma: defineAsyncComponent(() => import('./preformaC.vue')),
  facturaCV: defineAsyncComponent(() => import('./facturaCV.vue')),
  facturaCMEX: defineAsyncComponent(() => import('./facturaCMEX.vue')),
  facturaABYM: defineAsyncComponent(() => import('./facturaABYM.vue')),
  prueba: defineAsyncComponent(() => import('./pruebasP.vue')),
  PruebaD: defineAsyncComponent(() => import('./pruebaD.vue')),
}

const componenteActual = ref('tipo_doc')

// Componente que se va a mostrar actualmente
const componenteSeleccionado = computed(() => componentes[componenteActual.value])

const mostrarComponente = (codigo) => {
  componenteActual.value = codigo
}
const showCart = ref(false)

// Lógica para alternar entre componentes
const toggleComponents = () => {
  showCart.value = !showCart.value
}
</script>
