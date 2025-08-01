<template>
  <div class="row flex justify-between">
    <q-btn color="primary" @click="$emit('add')" unelevated class="btn-res q-mt-lg">
      <q-icon name="inventory_2" class="icono" />
      <span class="texto">productos</span>
    </q-btn>

    <!-- Filtro por almacén -->
    <div class="col-2">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="filtro"
        :options="opciones"
        id="almacen"
        emit-value
        map-options
        dense
        outlined
        clearable
      />
    </div>

    <!-- Botón imprimir -->

    <q-btn outline="" color="info" @click="onPrintReport" class="btn-res q-mt-lg">
      <q-icon name="picture_as_pdf" class="icono" />

      <span class="texto">Vista previa PDF</span>
    </q-btn>
  </div>
  <div class="flex justify-end q-mb-md">
    <div>
      <label for="buscar">Buscar...</label>
      <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar...">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table
    title="Productos Asignados"
    :rows="rows"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    :filter="filter"
    flat
    bordered
  >
    <!-- Buscador -->

    <!-- Acciones -->
    <template v-slot:body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn dense round flat icon="edit" color="info" @click="$emit('edit-item', props.row)" />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" />
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
import { ref, watch, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { URL_APIE } from 'src/composables/services'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
// Props
const mostrarModal = ref(false)
const pdfData = ref(null)
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  opciones: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// Eventos emitidos
const emit = defineEmits([
  'delete-item',
  'edit-item',
  'add',
  'onPrintReport',
  'onSeleccion_almacen',
])
const productoLista = computed(() => props.rows)
// Estado local
const filtro = ref(null) // almacén seleccionado
const filter = ref('') // texto del buscador

// Paginación
const pagination = ref({
  rowsPerPage: 10,
})

// Columnas de la tabla
const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'codigobarra',
    label: 'Código barra',
    field: 'codigobarra',
    align: 'left',
    sortable: true,
  },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left', sortable: true },
  {
    name: 'subcategoria',
    label: 'Sub categoría',
    field: 'subcategoria',
    align: 'left',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  { name: 'detalle', label: 'País', field: 'detalle', align: 'left', sortable: true },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'rigth', sortable: true },
  { name: 'medida', label: 'Característica', field: 'medida', align: 'left', sortable: true },
  {
    name: 'caracteristica',
    label: 'Otras características',
    field: 'caracteristica',
    align: 'left',
    sortable: true,
  },
  {
    name: 'estadoproducto',
    label: 'Estado',
    field: 'estadoproducto',
    align: 'left',
    sortable: true,
  },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right', sortable: true },
  {
    name: 'stockminimo',
    label: 'Stock mínimo',
    field: 'stockminimo',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stockmaximo',
    label: 'Stock máximo',
    field: 'stockmaximo',
    align: 'right',
    sortable: true,
  },
  { name: 'fecha', label: 'Fecha creación', field: 'fecha', align: 'center', sortable: true },
  { name: 'opciones', label: 'Acciones', field: 'actions', align: 'center' },
]

function onPrintReport() {
  console.log(productoLista.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Codigo Barra', dataKey: 'codigobarra' },
    { header: 'Categoria', dataKey: 'categoria' },
    { header: 'Sub Categoria', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'País', dataKey: 'detalle' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Característica', dataKey: 'medida' },
    { header: 'Otras características', dataKey: 'caracteristica' },
    { header: 'Estado', dataKey: 'estadoproducto' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Stock min', dataKey: 'stockminimo' },
    { header: 'Stock max', dataKey: 'stockmaximo' },
    { header: 'Fecha creación', dataKey: 'fecha' },
  ]

  const datos = productoLista.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    codigobarra: item.codigobarra,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    detalle: item.detalle,
    unidad: item.unidad,
    medida: item.medida,
    caracteristica: item.caracteristica,
    estadoproducto: item.estadoproducto,
    stock: item.stock,
    stockminimo: item.stockminimo,
    stockmaximo: item.stockmaximo,
    fecha: cambiarFormatoFecha(item.fecha),
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
      indice: { cellWidth: 8, halign: 'center' },
      codigo: { cellWidth: 15, halign: 'left' },
      codigobarra: { cellWidth: 15, halign: 'left' },
      categoria: { cellWidth: 15, halign: 'left' },
      subcategoria: { cellWidth: 15, halign: 'left' },
      descripcion: { cellWidth: 20, halign: 'left' },
      detalle: { cellWidth: 15, halign: 'left' },
      unidad: { cellWidth: 10, halign: 'center' },
      medida: { cellWidth: 18, halign: 'center' },
      caracteristica: { cellWidth: 18, halign: 'left' },
      estadoproducto: { cellWidth: 10, halign: 'left' },
      stock: { cellWidth: 8, halign: 'right' },
      stockminimo: { cellWidth: 8, halign: 'right' },
      stockmaximo: { cellWidth: 8, halign: 'right' },
      fecha: { cellWidth: 15, halign: 'center' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 182.5, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('Productos', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}

// Emitir selección de almacén
watch(filtro, (val) => {
  emit('onSeleccion_almacen', val)
})
</script>

<style scoped>
.my-sticky-header-table {
  max-height: 600px;
  overflow-y: auto;
}
</style>
