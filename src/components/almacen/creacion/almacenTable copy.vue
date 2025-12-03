<template>
  <div class="q-pa-md">
    <div class="flex justify-between">
      <q-btn
        color="primary"
        @click="$emit('add')"
        class="btn-res q-mt-lg"
        title="Registrar Almacen"
      >
        <q-icon name="add" class="icono" />
        <span class="texto">Agregar</span>
      </q-btn>
      <q-btn color="info" outline @click="mostrarReporte" class="btn-res q-mt-lg">
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista previa PDF</span>
      </q-btn>
      <div>
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
      title="Almacenes"
      :rows="rows"
      :columns="columnas"
      row-key="id"
      :filter="search"
      flat
      bordered
    >
      <template v-slot:body-cell-sucursal="props">
        <q-td :props="props">
          <span v-if="props.row.sucursales?.length" class="text-primary text-weight-medium">
            {{ props.row.sucursales[0].nombre }}
          </span>
          <span v-else>-</span>
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
          <q-badge color="red" v-else label="Inactivo" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn
            icon="edit"
            color="primary"
            dense
            class="q-mr-sm"
            @click="$emit('edit-item', props.row)"
            title="Editar"
            flat
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            @click="$emit('delete-item', props.row)"
            title="Eliminar"
            flat
          />
          <q-btn
            :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
            @click="$emit('toggle-status', props.row)"
            title="Cambiar de Estadato"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { PDFalmacenes } from 'src/utils/pdfReportGenerator'
import { URL_APIE } from 'src/composables/services'

console.log(URL_APIE)

const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status', 'mostrarReporte'])

const pdfData = ref(null)
const mostrarModal = ref(false)

const columnas = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'tipoalmacen', label: 'Tipo almacén', field: 'tipoalmacen', align: 'left' },
  { name: 'stockmin', label: 'Stock min', field: 'stockmin' },
  { name: 'stockmax', label: 'Stock max', field: 'stockmax' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const search = ref('')

function mostrarReporte() {
  const doc = PDFalmacenes(props)

  pdfData.value = doc.output('dataurlstring') // mostrar en iframe
  mostrarModal.value = true
}
</script>
