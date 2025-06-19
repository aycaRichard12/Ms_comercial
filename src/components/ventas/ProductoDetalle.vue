<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-sm-3">
      <q-input
        :model-value="producto.originalData.stock"
        label="Stock disponible"
        outlined
        readonly
      />
    </div>

    <div class="col-12 col-sm-3">
      <q-input
        v-model.number="cantidad"
        label="Cantidad"
        outlined
        type="number"
        :rules="[
          (val) => val > 0 || 'Ingrese cantidad válida',
          (val) => val <= producto.originalData.stock || 'Supera el stock',
        ]"
      />
    </div>

    <div class="col-12 col-sm-3">
      <q-input
        v-model.number="precioUnitario"
        label="Precio unitario"
        outlined
        :prefix="currencyStore.simbolo"
        :rules="[(val) => val > 0 || 'Ingrese precio válido']"
      />
    </div>

    <div class="col-12 col-sm-3 flex items-center">
      <q-btn
        label="Añadir al carrito"
        color="primary"
        @click="agregarAlCarrito"
        :disable="!puedeAgregarProducto"
        class="full-width"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCurrencyStore } from 'src/stores/currencyStore'

const currencyStore = useCurrencyStore()

const props = defineProps({
  producto: Object,
})

const emit = defineEmits(['agregar-al-carrito'])

const cantidad = ref(1)
const precioUnitario = ref(props.producto.originalData.precio || 0)

const puedeAgregarProducto = computed(() => {
  return (
    cantidad.value > 0 &&
    cantidad.value <= props.producto.originalData.stock &&
    precioUnitario.value > 0
  )
})

function agregarAlCarrito() {
  emit('agregar-al-carrito', {
    cantidad: cantidad.value,
    precioUnitario: precioUnitario.value,
  })
  cantidad.value = 1
  precioUnitario.value = props.producto.originalData.precio || 0
}
</script>
