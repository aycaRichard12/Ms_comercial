<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-x-md q-mb-md">
      <div class="col-3 col-md-3 flex justify-start">
        <q-btn color="primary" @click="$emit('add')" class="btn-res">
          <q-icon name="add" class="icono" />
          <span class="texto">Agregar</span>
        </q-btn>
      </div>

      <div class="col-3 col-md-3 flex justify-center">
        <q-btn color="info" @click="$emit('importFromExcel')" class="btn-res" outline>
          <q-icon name="upload" class="icono" />
          <span class="texto">Importar Excel</span>
        </q-btn>
      </div>
      <div class="col-3 col-md-3 flex justify-center">
        <q-btn color="info" outline @click="exportarProveedoresPDF" class="btn-res">
          <q-icon name="picture_as_pdf" class="icono" />
          <span class="texto">Vista Previa PDF</span>
        </q-btn>
      </div>
      <div class="col-3 col-md-3 flex justify-end">
        <q-btn color="info" @click="exportarClientesFiltrados" class="btn-res" outline>
          <q-icon name="file_download" class="icono" />
          <span class="texto">Exportar Excel</span>
        </q-btn>
      </div>
    </div>

    <div class="row q-col-gutter-x-md flex justify-end q-mb-md">
      <div class="col-12 col-md-3">
        <label for="buscar">Buscar...</label>
        <q-input dense debounce="300" v-model="filtro" id="buscar">
          <template v-slot:append> <q-icon name="search" /> </template>
        </q-input>
      </div>
    </div>
    <q-table
      flat
      bordered
      title="Proveedores"
      :rows="filtrarProveedores"
      :columns="columnas"
      row-key="id"
      :filter="filtro"
      :pagination="{ rowsPerPage: 10 }"
      class="sticky-header-table"
    >
      <template v-slot:top-right> </template>
      <!-- Personalización de celdas para truncar texto -->
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <div class="text-wrap">
            {{ props.value }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-center">
          <q-btn flat dense icon="edit" color="primary" @click="editarProveedor(props.row)" />
          <q-btn flat dense icon="delete" color="negative" @click="eliminarProveedor(props.row)" />
        </q-td>
      </template>
    </q-table>
  </div>
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
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { URL_APIE } from 'src/composables/services'
const mostrarModal = ref(false)
const pdfData = ref(null)
const emit = defineEmits(['add', 'importFromExcel', 'exportToExcel', 'edit', 'delete', 'addToList'])
const filtro = ref('')

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const columnas = [
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nit', label: 'NIT', field: 'nit', align: 'right' },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono' },
  { name: 'mobil', label: 'Mobil', field: 'mobil' },
  { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' },
  { name: 'zona', label: 'Zona', field: 'zona', align: 'left' },
  { name: 'pais', label: 'País', field: 'pais', align: 'center' },
  { name: 'web', label: 'Web', field: 'web', align: 'left' },
  { name: 'contacto', label: 'Contacto', field: 'contacto', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const filtrarProveedores = computed(() => {
  if (!filtro.value) return props.rows
  const texto = filtro.value.toLowerCase()
  return props.rows.filter((p) =>
    Object.values(p).some((val) => String(val).toLowerCase().includes(texto)),
  )
})

const editarProveedor = (row) => {
  console.log('Editar', row)
  emit('edit', row)
}

const eliminarProveedor = (row) => {
  console.log('Eliminar', row)
  emit('delete', row)
}

function exportarClientesFiltrados() {
  const worksheet = XLSX.utils.json_to_sheet(filtrarProveedores.value)

  // Establecer anchos de columnas (wch = width in characters)
  worksheet['!cols'] = [
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email

    // Añade más columnas si hay más campos
  ]

  // Establecer altura de filas (hpt = height in points)
  worksheet['!rows'] = [
    { hpt: 50 }, // Encabezado
    // Puedes repetir para más filas si deseas
  ]

  // Aplicar estilos
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      console.log(cell_ref, cell_address)
      console.log(worksheet[cell_ref])
      const cell = worksheet[cell_ref]
      if (!cell) continue

      cell.s = {
        font: {
          name: 'Arial',
          sz: 12,
          bold: R === 0,
          color: { rgb: R === 0 ? 'FFFFFF' : '000000' },
        },
        fill: {
          fgColor: { rgb: R === 0 ? '4F81BD' : 'FFFFFF' },
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores')
  XLSX.writeFile(workbook, 'proveedores.xlsx')
}

function exportarProveedoresPDF() {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'landscape' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64
  const columns = [
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'NIT', dataKey: 'nit' },
    { header: 'Detalle', dataKey: 'detalle' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Móvil', dataKey: 'mobil' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Web', dataKey: 'web' },
    { header: 'País', dataKey: 'pais' },
    { header: 'Ciudad', dataKey: 'ciudad' },
    { header: 'Zona', dataKey: 'zona' },
    { header: 'Contacto', dataKey: 'contacto' },
  ]

  const datos = filtrarProveedores.value.map((item) => ({
    nombre: item.nombre,
    codigo: item.codigo,
    nit: item.nit,
    detalle: item.detalle,
    direccion: item.direccion,
    telefono: item.telefono,
    mobil: item.mobil,
    email: item.email,
    web: item.web,
    pais: item.pais,
    ciudad: item.ciudad,
    zona: item.zona,
    contacto: item.contacto,
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
      nombre: { cellWidth: 20, halign: 'left' },
      codigo: { cellWidth: 15, halign: 'left' },
      nit: { cellWidth: 20, halign: 'right' },
      detalle: { cellWidth: 30, halign: 'left' },
      direccion: { cellWidth: 30, halign: 'left' },
      telefono: { cellWidth: 15, halign: 'center' },
      mobil: { cellWidth: 15, halign: 'center' },
      email: { cellWidth: 25, halign: 'left' },
      web: { cellWidth: 25, halign: 'left' },
      pais: { cellWidth: 20, halign: 'center' },
      ciudad: { cellWidth: 25, halign: 'center' },
      zona: { cellWidth: 20, halign: 'center' },
      contacto: { cellWidth: 25, halign: 'left' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 32,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 270, 10, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 15)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 20)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('PROVEEDORES', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
