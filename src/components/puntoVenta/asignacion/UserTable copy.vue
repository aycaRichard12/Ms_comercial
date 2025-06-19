<template>
  <div class="q-mt-md">
    <q-table
      :columns="columns"
      :rows="rows"
      row-key="id"
      flat
      bordered
      class="q-pa-sm"
      :rows-per-page-options="[0]"
      virtual-scroll
      style="max-height: calc(100vh - 200px)"
    >
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-center">
          <q-btn color="primary" icon="edit" dense size="sm" @click="editarFila(props.row)" />
          <q-btn
            color="negative"
            icon="delete"
            dense
            size="sm"
            class="q-ml-sm"
            @click="eliminarFila(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  {
    name: 'index',
    label: 'N°',
    align: 'center',
    field: (_, index) => index + 1,
    sortable: false,
  },
  {
    name: 'nombre',
    label: 'Nombre',
    align: 'center',
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'center',
    field: 'descripcion',
    sortable: true,
  },
  {
    name: 'opciones',
    label: 'Opciones',
    align: 'center',
    field: 'opciones',
    sortable: false,
  },
]

const rows = ref([
  { id: 1, nombre: 'Producto A', descripcion: 'Descripción del producto A' },
  { id: 2, nombre: 'Producto B', descripcion: 'Descripción del producto B' },
  // ...
])

function editarFila(row) {
  console.log('Editar', row)
}

function eliminarFila(row) {
  console.log('Eliminar', row)
}
</script>
