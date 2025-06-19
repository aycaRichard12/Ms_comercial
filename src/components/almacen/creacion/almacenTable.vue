<template>
  <div style="display: flex; justify-content: space-between">
    <q-btn label="Agregar" icon="add" color="primary" @click="$emit('add')" />
    <q-btn flat label="Imprimir" icon="print" color="info" @click="mostrarReporte" />
  </div>

  <q-table
    title="Almacenes"
    :rows="rows"
    :columns="columnas"
    :pagination="pagination"
    row-key="id"
    :filter="search"
    flat
    bordered
    class="my-sticky-header-table q-mt-md"
  >
    <template v-slot:top-right>
      <q-input v-model="search" placeholder="Buscar..." dense outlined debounce="300">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
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
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" />
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
  <q-dialog v-model="mostrarModal" persistent full-width full-height>
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
</template>

<script setup>
import { ref } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { URL_APIE } from 'src/composables/services'

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
const pagination = ref({ rowsPerPage: 10 })

function mostrarReporte() {
  console.log(props.rows) // ✅ Acceso correcto a los datos reactivos

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Tipo almacén', dataKey: 'tipoalmacen' },
    { header: 'Stock min', dataKey: 'stockmin' },
    { header: 'Stock max', dataKey: 'stockmax' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const datos = props.rows.map((item, indice) => ({
    indice: indice + 1,
    nombre: item.nombre,
    direccion: item.direccion,
    telefono: item.telefono,
    email: item.email,
    tipoalmacen: item.tipoalmacen,
    stockmin: item.stockmin,
    stockmax: item.stockmax,
    sucursal: item.sucursales?.[0]?.nombre || '-', // en caso de tener relación
    estado: Number(item.estado) === 1 ? 'Activo' : 'Inactivo',
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      nombre: { cellWidth: 15, halign: 'left' },
      direccion: { cellWidth: 30, halign: 'left' },
      telefono: { cellWidth: 15, halign: 'right' },
      email: { cellWidth: 30, halign: 'left' },
      tipoalmacen: { cellWidth: 15, halign: 'left' },
      stockmin: { cellWidth: 15, halign: 'center' },
      stockmax: { cellWidth: 15, halign: 'center' },
      sucursal: { cellWidth: 25, halign: 'left' },
      estado: { cellWidth: 25, halign: 'center' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa) {
          doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('ALMACENES', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      }
    },
  })

  pdfData.value = doc.output('dataurlstring') // mostrar en iframe
  mostrarModal.value = true
}
</script>
