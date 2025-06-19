<template>
  <div class="row">
    <div class="col">
      <div class="row items-center q-gutter-sm">
        <q-btn label="Agregar" icon="add" color="primary" @click="$emit('add')" />
      </div>
    </div>

    <div class="col">
      <div class="row items-center q-gutter-sm" style="max-width: 200px">
        <q-select
          v-model="filtroTipoAlmacen"
          :options="tiposAlmacen"
          placeholder="Seleccione una opción"
          label="Almacén"
          emit-value
          map-options
          dense
          outlined
          clearable
          class="full-width"
        />
      </div>
    </div>
  </div>

  <q-table
    title="Puntos Ventas"
    :rows="ordenados"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    :filter="search"
    flat
    bordered
    class="my-sticky-header-table q-mt-md"
  >
    <template v-slot:top-right>
      <q-input dense debounce="300" v-model="search" placeholder="Buscar..." />
    </template>
    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          icon="edit"
          color="primary"
          dense
          class="q-mr-sm"
          @click="$emit('edit-item', props.row)"
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
const filtroTipoAlmacen = ref(null)

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  tiposAlmacen: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'onSeleccionarTipo'])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'nombre', label: 'Punto de venta', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
const ordenados = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)
const search = ref('')
const pagination = ref({
  rowsPerPage: 10,
})
watch(filtroTipoAlmacen, (val) => {
  emit('onSeleccionarTipo', val)
})
</script>
