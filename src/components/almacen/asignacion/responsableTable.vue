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
    title="Responsables"
    :rows="rows"
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
      <q-td align="center">
        <q-btn dense icon="delete" color="negative" @click="eliminar(props.row.id)" />
        <q-btn dense icon="add_box" color="primary" @click="asignarAlmacenes(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const search = ref('')

const columns = [
  {
    name: 'usuario',
    label: 'Usuario',
    field: (row) => row.usuario?.usuario || '',
    align: 'left',
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: (row) => row.usuario?.nombre || '',
  },
  {
    name: 'apellido',
    label: 'Apellido',
    field: (row) => row.usuario?.apellido || '',
  },
  {
    name: 'cargo',
    label: 'Cargo',
    field: (row) => row.usuario?.cargo || '',
  },
  {
    name: 'opciones',
    label: 'Opciones',
    field: '',
    align: 'center',
  },
]

const emit = defineEmits(['eliminar', 'asignar'])

function eliminar(id) {
  emit('eliminar', id)
}

function asignarAlmacenes(responsable) {
  emit('asignar', responsable)
}
</script>
