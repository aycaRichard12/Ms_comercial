<template>
  <q-table title="Registro Pedidos" :rows="pedidos" :columns="columns" row-key="id">
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
          @click="$emit('autorizar', props.row)"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-detalle="props">
      <q-td :props="props">
        <q-btn
          color="success"
          icon="list"
          size="sm"
          flat
          dense
          @click="$emit('detalle', props.row)"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-opciones="props">
      <q-td :props="props">
        <q-btn
          color="primary"
          icon="edit"
          size="sm"
          flat
          dense
          @click="$emit('editar', props.row)"
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
</template>

<script setup>
defineProps({
  pedidos: Array,
  columns: Array,
})
defineEmits(['editar', 'eliminar', 'autorizar', 'detalle'])
</script>
