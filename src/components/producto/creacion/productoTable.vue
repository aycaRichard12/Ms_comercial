<template>
  <div class="q-gutter-sm q-mb-md">
    <q-row class="q-col-gutter-md items-center">
      <!-- Botones a la izquierda -->
      <q-col cols="12" sm="6" class="flex q-gutter-sm">
        <q-btn label="Agregar" icon="add" color="primary" @click="$emit('add')" />
      </q-col>
    </q-row>
  </div>
  <q-table
    title="Listado de Productos"
    :rows="ordenados"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    flat
    bordered
    :filter="search"
  >
    <template v-slot:top-right>
      <q-input dense debounce="300" v-model="search" placeholder="Buscar..." />
    </template>

    <template v-slot:body-cell-imagen="props">
      <q-td :props="props">
        <q-img :src="URL_APICM + 'api/' + props.row.imagen" style="height: 50px; width: 50px" />
      </q-td>
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
import { ref, computed } from 'vue'
import { URL_APICM } from 'src/composables/services'
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'mostrarReporte'])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'right' },
  { name: 'codigo', label: 'Cod.', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'subcategoria', label: 'Sub Categorías', field: 'subcategoria', align: 'left' },
  { name: 'codigobarras', label: 'Cod.Barra', field: 'codigobarras', align: 'right' },
  { name: 'caracteristica', label: 'Caract.', field: 'caracteristica', align: 'left' },
  { name: 'estadoproducto', label: 'Estado', field: 'estadoproducto', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'otras', label: 'Otras caract.', field: 'otras', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'imagen', label: 'Imagen', field: 'imagen' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', sortable: false },
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
</script>
