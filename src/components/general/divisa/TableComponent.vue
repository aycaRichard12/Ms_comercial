<template>
  <q-table :rows="rows" :columns="columns" row-key="id" flat bordered>
    <template v-slot:body-cell-estado="props">
      <q-td>
        <!-- Aquí se muestran los íconos condicionales -->
        <q-btn
          v-if="privilegios[2]"
          size="sm"
          :color="props.row.estado == 1 ? 'primary' : 'negative'"
          :icon="props.row.estado == 1 ? 'thumb_up' : 'thumb_down'"
          @click="$emit('cambiarEstado', props.row)"
          flat
        />
      </q-td>
    </template>
    <template v-slot:body-cell-acciones="props">
      <q-td>
        <q-btn
          v-if="privilegios[2]"
          size="sm"
          icon="edit"
          color="info"
          @click="$emit('editar', props.row)"
          flat
        />
        <q-btn
          v-if="privilegios[3]"
          size="sm"
          icon="delete"
          color="red"
          @click="$emit('eliminar', props.row.id)"
          flat
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
defineProps({
  rows: Array,
  privilegios: Array,
  estadofactura: Boolean,
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  {
    name: 'descripcion',
    label: 'Moneda',
    field: (row) => row.monedasin?.descripcion,
    align: 'left',
    required: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]
</script>
