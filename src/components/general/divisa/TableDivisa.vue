<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <q-btn icon="add" label="Agregar" color="primary" @click="$emit('add')" />
      </div>
    </div>

    <q-table
      flat
      :rows="filtradas"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
      class="sticky-header-table"
      bordered
      title="Divisas"
    >
      <template v-slot:body-cell-monedaSin="props" v-if="estadoFactura">
        <q-td :props="props">
          {{ props.row.monedasin?.descripcion }}
        </q-td>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-opciones="props">
        <q-td align="center">
          <q-btn icon="edit" color="primary" dense flat @click="$emit('edit', props.row)" />
          <q-btn icon="delete" dense flat color="negative" @click="$emit('delete', props.row)" />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFacturaStore } from 'src/stores/factura'

// Initialize the Pinia store
const facturaStore = useFacturaStore()
facturaStore.cargarUsuario()

// Get the estadoFactura value from the store.
// Assuming obtenerEstadoFactura returns a reactive property or a ref,
// we'll access its value using .value in the computed property.
const estadoFactura = facturaStore.obtenerEstadoFactura()

// Define component props
const props = defineProps({
  rows: Array,
})

// Reactive variable for search input

// Computed property for table columns, which dynamically includes/excludes 'monedaSin'
const columns = computed(() => {
  const dynamicColumns = [
    { name: 'nro', label: 'N°', align: 'right', field: 'nro' },
    { name: 'nombre', label: 'Divisa', align: 'left', field: 'nombre' },
    { name: 'tipo', label: 'Tipo', align: 'left', field: 'tipo' },
  ]

  // Conditionally add the 'monedaSin' column if estadoFactura is true
  if (estadoFactura) {
    // Access the value of the reactive property
    dynamicColumns.push({
      name: 'monedaSin',
      label: 'Moneda (SIN)',
      align: 'left',
      field: 'monedaSin',
    })
  }

  // Add the remaining common columns
  dynamicColumns.push(
    { name: 'estado', label: 'Estado', align: 'center' },
    { name: 'opciones', label: 'Opciones', align: 'center' },
  )

  return dynamicColumns
})

// Computed property for filtered rows based on search input
const filtradas = computed(() => {
  const base = props.rows || []

  // Add a 'numero' field for display purposes (N° column)
  return base.map((row, index) => ({
    ...row,
    nro: index + 1,
  }))
})
</script>

<style scoped>
.my-table {
  max-height: 500px;
  overflow: auto;
}
</style>
