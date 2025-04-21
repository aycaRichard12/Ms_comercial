<template>
  <q-table title="Mi Tabla" :rows="rows" :columns="columns" row-key="id">
    <!-- Slot para personalizar la columna "acciones" -->
    <template v-slot:body-cell-autorizacion="props">
      <q-td :props="props">
        <q-btn color="negative" icon="delete" size="sm" flat dense @click="eliminar(props.row)" />
      </q-td>
    </template>
    <template v-slot:body-cell-acciones="props">
      <q-td :props="props">
        <q-btn
          color="primary"
          icon="edit"
          size="sm"
          flat
          dense
          @click="editar(props.row)"
          class="q-mr-xs"
        />
        <q-btn color="negative" icon="delete" size="sm" flat dense @click="eliminar(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'autorizacion', label: 'Autorizacion', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

const rows = ref([
  { id: 1, nombre: 'Juan Pérez' },
  { id: 2, nombre: 'María García' },
  { id: 3, nombre: 'Carlos López' },
])

const editar = (row) => {
  console.log('Editar:', row)
}

const eliminar = (row) => {
  console.log('Eliminar:', row)
}
</script>
