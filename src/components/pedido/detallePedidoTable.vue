<template>
  <div class="q-pa-md">
    <q-table flat bordered :rows="rows" :columns="columns" row-key="id" separator="vertical">
      <template v-slot:body-cell-options="props">
        <q-btn
          flat
          round
          color="primary"
          icon="edit"
          title="Editar"
          @click="handleEdit(props.row)"
        />
        <q-btn
          flat
          round
          color="negative"
          icon="delete"
          title="Eliminar"
          @click="handleDelete(props.row)"
        />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  { name: 'numero', label: 'N°', align: 'center', field: 'numero' },
  { name: 'codigo', label: 'Código', align: 'center', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'center', field: 'descripcion' },
  { name: 'cantidad', label: 'Cantidad', align: 'center', field: 'cantidad' },
  { name: 'options', label: 'Opciones', align: 'center' },
]

const rows = ref([
  {
    id: 1,
    numero: 1,
    codigo: 'Yo-0002',
    descripcion: 'yogurt natural conservado',
    cantidad: 12,
  },
])

function handleEdit(row) {
  console.log('Editar:', row)
  // Aquí puedes agregar la lógica para editar la fila
}

function handleDelete(row) {
  console.log('Eliminar:', row)
  // Aquí puedes agregar la lógica para eliminar la fila
}
</script>

<style scoped>
.q-pa-md {
  margin-top: 1rem;
}
</style>
