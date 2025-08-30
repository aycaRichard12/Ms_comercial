<template>
  <div class="row q-col-gutter-x-md flex justify-between">
    <div class="col-12 col-md-3">
      <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
        <q-icon name="add" class="icono" />
        <span class="texto"> Agregar</span>
      </q-btn>
    </div>

    <div class="col-12 col-md-3">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="filtroTipoAlmacen"
        :options="tiposAlmacen"
        id="almacen"
        emit-value
        map-options
        dense
        outlined
        clearable
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="buscar">Buscar...</label>
      <q-input
        v-model="search"
        id="buscar"
        dense
        outlined
        debounce="300"
        class="q-mb-md"
        style="background-color: white"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table
    title="Puntos Ventas"
    :rows="ordenados"
    :columns="columns"
    row-key="id"
    :filter="search"
    flat
    bordered
  >
    <template v-slot:top-right> </template>
    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          icon="edit"
          color="primary"
          dense
          class="q-mr-sm"
          @click="$emit('edit-item', props.row)"
          flat
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" flat />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
const filtroTipoAlmacen = ref(null)

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  tiposAlmacen: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'onSeleccionarTipo'])

const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'nombre', label: 'Punto de venta', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
const ordenados = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)
const search = ref('')
watch(
  () => props.tiposAlmacen,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroTipoAlmacen.value) {
      filtroTipoAlmacen.value = nuevosAlmacenes[0].value
    }
  },
  { immediate: true },
)
watch(filtroTipoAlmacen, (val) => {
  emit('onSeleccionarTipo', val)
})
</script>
