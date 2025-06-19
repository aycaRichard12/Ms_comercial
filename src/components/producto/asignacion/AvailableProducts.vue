<template>
  <div class="q-pa-md">
    <!-- Pantallas medianas en adelante -->

    <!-- Pantallas pequeñas -->
    <div style="display: flex; justify-content: space-between">
      <q-btn
        label="Volver"
        icon="arrow_back"
        color="primary"
        size="sm"
        class="q-mr-sm"
        @click="$emit('atras')"
      />
      <div class="text-h4">Lista de Productos Disponibles:</div>
      <q-btn
        label="Continuar"
        icon-right="arrow_forward"
        color="primary"
        size="sm"
        @click="$emit('continuar')"
      />
    </div>

    <!-- Filtros -->
    <div style="display: flex; justify-content: center">
      <q-select
        v-model="filtro"
        :options="opciones"
        label="Seleccione un Almacén"
        placeholder="Seleccione una opción"
        dense
        outlined
        style="min-width: 200px"
        emit-value
        map-options
      />
    </div>

    <!-- Tabla de productos -->
    <q-table
      v-if="filtro"
      :rows="rows"
      :columns="columns"
      :pagination="pagination"
      row-key="id"
      flat
      bordered
      virtual-scroll
      :filter="filter"
      class="my-sticky-header-table q-mt-md"
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar..." />
      </template>
      <template #body-cell-imagen="props">
        <q-td :props="props">
          <img :src="props.value" alt="img" width="50" height="50" style="object-fit: cover" />
        </q-td>
      </template>
      <template #body-cell-seleccion="props">
        <q-td :props="props">
          <q-checkbox v-model="seleccionados" :val="props.row.id" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  opciones: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['atras', 'continuar', 'onSeleccion_almacen', 'productosSeleccionados'])

const filtro = ref(null) // almacén seleccionado
const filter = ref('') // texto del buscador
const seleccionados = ref([])

// Paginación
const pagination = ref({
  rowsPerPage: 10,
})

const columns = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'right' },
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  { name: 'categoria', label: 'Categoría', field: 'categoria' },
  { name: 'subcategoria', label: 'Sub categoría', field: 'subcategoria' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion' },
  { name: 'codigo_barra', label: 'Código barra', field: 'codigo_barra' },
  { name: 'caracteristicas', label: 'Características', field: 'caracteristicas' },
  { name: 'estado', label: 'Estado', field: 'estado' },
  { name: 'unidad', label: 'Unidad', field: 'unidad' },
  { name: 'otras', label: 'Otras características', field: 'otras' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'right' },
  { name: 'imagen', label: 'Imagen', field: 'imagen' },
  { name: 'seleccion', label: 'Opciones', field: 'id' },
]

// Emitir selección de almacén
watch(filtro, (val) => {
  emit('onSeleccion_almacen', val)
})
watch(seleccionados, (ids) => {
  const datos = ids.map((id) => ({
    idproducto: String(id), // convertir a string si es necesario
    idalmacen: String(filtro.value), // también convertir si es necesario
  }))
  emit('productosSeleccionados', datos)
})
</script>

<style scoped>
.my-sticky-header-table {
  max-height: 600px;
  overflow-y: auto;
}
</style>
