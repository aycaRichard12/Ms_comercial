<template>
  <div>
    <div class="row table-topper q-mb-md">
      <div class="col flex items-center">
        <q-btn label="Nuevo Estado" color="primary" @click="$emit('new-item')" />
      </div>

      <div class="col flex items-center justify-end">
        <q-input v-model="search" placeholder="Buscar" dense outlined class="q-ml-md">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :filter="search"
      class="my-sticky-header-table"
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-btn
            :icon="props.row.activo ? 'thumb_up' : 'thumb_down'"
            :color="props.row.activo ? 'positive' : 'negative'"
            dense
            @click="$emit('status-change', props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn
            icon="edit"
            color="info"
            dense
            class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
          />
          <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
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

defineEmits(['new-item', 'edit-item', 'delete-item', 'status-change'])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const search = ref('')
const pagination = ref({
  rowsPerPage: 10,
})
</script>

<style scoped>
.my-sticky-header-table {
  height: calc(100vh - 300px);
}

.table-topper {
  margin-bottom: 16px;
}
</style>
