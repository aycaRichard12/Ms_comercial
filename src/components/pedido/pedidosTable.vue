<template>
  <div class="q-pa-md">
    <q-table title="pedidos" :rows="pedidos" :columns="columns" row-key="id">
      <!-- Slot para personalizar la columna "autorizacion" -->
      <template v-slot:body-cell-autorizacion="props">
        <q-td :props="props">
          <q-btn
            :color="Number(props.row.autorizacion) === 1 ? 'positive' : 'negative'"
            :icon="Number(props.row.autorizacion) === 1 ? 'thumb_up' : 'thumb_down'"
            size="sm"
            flat
            dense
            :disable="
              props.row.autorizacion === 2 || (props.row.autorizacion === 1 && props.row.autorizado)
            "
            @click="autorizarPedido(props.row)"
          />
        </q-td>
      </template>

      <!-- Slot para personalizar la columna "detalle" -->
      <template v-slot:body-cell-detalle="props">
        <q-td :props="props">
          <q-btn
            color="success"
            icon="list"
            size="sm"
            flat
            dense
            title="Productos"
            @click="verDetalle(props.row)"
          />
        </q-td>
      </template>

      <!-- Slot para personalizar la columna "opciones" -->
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="edit"
            size="sm"
            flat
            dense
            @click="$emit('editar', props.row)"
            class="q-mr-xs"
          />
          <q-btn
            color="negative"
            icon="delete"
            size="sm"
            flat
            dense
            @click="$emit('eliminar', props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
// No need to import defineProps and defineEmits - they're compiler macros
const props = defineProps({
  pedidos: {
    type: Array,
    required: true,
  },
})
console.log(props)
const emit = defineEmits(['editar', 'eliminar', 'verDetalle', 'autorizar'])

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'almacenorigen', label: 'Almacén Origen', field: 'almacenorigen', align: 'left' },
  { name: 'almacen', label: 'Almacén Destino', field: 'almacen', align: 'left' },
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left' },
  { name: 'tipopedido', label: 'Tipo Pedido', field: 'tipopedido', align: 'left' },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left' },
  { name: 'autorizacion', label: 'Autorización', field: 'autorizacion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'detalle', label: 'Detalle', align: 'center' },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]

const autorizarPedido = (row) => {
  emit('autorizar', row)
}

const verDetalle = (row) => {
  emit('verDetalle', row)
}

// The watch function doesn't seem to belong in this component
// It's referencing variables that don't exist in this scope
// If you need to keep it, make sure to import watch and define all necessary variables
</script>
