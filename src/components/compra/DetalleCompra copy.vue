<template>
  <q-card style="min-width: 800px; max-width: 90vw">
    <div class="col-md-2 col-12 flex justify-end items-center q-gutter-sm">
      <q-btn label="Salir" color="negative" @click="$emit('close')" />
    </div>
    <div class="row">
      <h4 class="q-mb-md">Detalle de la compra</h4>
    </div>

    <q-form @submit="onSubmit" @reset="onReset" ref="form" v-if="localData.autorizacion == 2">
      <div class="row q-col-gutter-sm">
        <div class="col-md-4 col-12">
          <q-select
            use-input
            fill-input
            hide-dropdown-icon
            v-model="localData.idproductoalmacen"
            :options="productosFiltrados"
            @filter="filtrarProductos"
            label="Producto*"
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :rules="[(val) => !!val || 'Requerido']"
            dense
            clearable
            class="full-width"
          />
        </div>

        <div class="col-md-2 col-6">
          <q-input label="Stock actual*" v-model="localData.stock" disable dense />
        </div>

        <div class="col-md-2 col-6">
          <q-input
            label="Precio*"
            v-model.number="localData.precio"
            type="number"
            :rules="[(val) => !!val || 'Requerido']"
            suffix="Bs"
            dense
            clearable
            class="full-width"
          />
        </div>

        <div class="col-md-2 col-6">
          <q-input
            label="Cantidad*"
            v-model.number="localData.cantidad"
            type="number"
            :rules="[(val) => !!val || 'Requerido']"
            dense
            clearable
            class="full-width"
          />
        </div>

        <div class="col-md-2 col-12 flex justify-end items-center q-gutter-sm">
          <q-btn label="Añadir" color="primary" type="submit" />
        </div>
      </div>
    </q-form>

    <q-table
      class="q-mt-lg"
      :rows="processedRows"
      :columns="columnas"
      row-key="codigo"
      flat
      bordered
    >
      <template v-slot:body-cell-opciones="props" v-if="localData.autorizacion == 2">
        <q-td align="center">
          <q-btn
            dense
            icon="edit"
            color="primary"
            flat
            @click="$emit('editarDetalle', props.row)"
          />
          <q-btn
            dense
            icon="delete"
            color="negative"
            flat
            @click="$emit('eliminarDetalle', props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  rows: { type: Array, default: () => [] },
  product: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'close', 'editarDetalle', 'eliminarDetalle'])

const localData = ref({ ...props.modelValue })
watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
)

// Actualiza el stock automáticamente al seleccionar producto
watch(
  () => localData.value.idproductoalmacen,
  (nuevoValor) => {
    const producto = productos.value.find((p) => p.value === nuevoValor)
    localData.value.stock = producto ? producto.stock : 0
  },
)
watch(
  localData,
  (nuevo) => {
    console.log('localData:', nuevo)
  },
  { deep: true },
)
const productos = ref([])
const productosFiltrados = ref([])

onMounted(() => {
  productos.value = [...props.product]
  productosFiltrados.value = [...productos.value]
})

function filtrarProductos(val, update) {
  const needle = val.toLowerCase()
  update(() => {
    productosFiltrados.value = productos.value.filter((p) => p.label.toLowerCase().includes(needle))
  })
}

const columnas = [
  { name: 'id', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const processedRows = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)

function onSubmit() {
  emit('submit', { ...localData.value })
}

function onReset() {
  localData.value = { ...props.modelValue }
  emit('close')
}
</script>
