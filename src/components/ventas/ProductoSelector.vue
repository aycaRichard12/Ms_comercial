<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12">
      <q-select
        v-model="productoSeleccionado"
        :options="productosFiltrados"
        use-input
        input-debounce="300"
        @filter="filtrarProductos"
        label="Buscar producto (código o descripción)"
        outlined
        option-label="label"
        option-value="value"
        @update:model-value="onProductoSeleccionado"
        :loading="cargandoProductos"
        :disable="disabled"
        clearable
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              {{ disabled ? 'Seleccione una categoría primero' : 'No se encontraron productos' }}
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useProductos } from 'src/composables/venta/apiComposables'
defineProps({
  disabled: Boolean,
})

const emit = defineEmits(['producto-seleccionado'])

const {
  // productos,
  productosFiltrados,
  cargandoProductos,
  //cargarProductosDisponibles,
  filtrarProductos,
} = useProductos()

const productoSeleccionado = ref(null)

function onProductoSeleccionado(producto) {
  emit('producto-seleccionado', producto)
}
</script>
