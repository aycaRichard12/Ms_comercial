<template>
  <q-card-section class="row flex justify-between">
    <!-- Filtro por almacén -->
    <div class="col-6">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="filtroAlmacen"
        :options="almacenes"
        id="almacen"
        emit-value
        map-options
        dense
        outlined
      />
    </div>

    <!-- Botón imprimir -->

    <q-btn outline="" color="info" @click="onPrintReport" class="btn-res q-mt-lg" dense>
      <q-icon name="picture_as_pdf" class="icono" />

      <span class="texto">Vista previa PDF</span>
    </q-btn>
  </q-card-section>
  <div class="row flex justify-end">
    <div class="">
      <label for="buscar">Buscar...</label>
      <q-input v-model="filter" dense outlined debounce="300" id="buscar">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <!-- Tabla de productos -->
  <q-table
    title="Costo Unitario"
    :columns="columnas"
    :rows="filtrados"
    row-key="id"
    flat
    bordered
    :filter="filter"
    :loading="loading"
    v-model:pagination="pagination"
  >
    <template v-slot:top-right> </template>
    <!-- Botones de opciones -->
    <template #body-cell-opciones="props">
      <q-td :props="props" class="text-nowrap">
        <q-btn
          flat
          dense
          icon="edit"
          color="info"
          @click="editarProducto(props.row)"
          title="Editar producto"
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
import { ref, computed } from 'vue'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { URL_APIE } from 'src/composables/services'
import { decimas, obtenerFechaActualDato, cambiarFormatoFecha } from 'src/composables/FuncionesG'

const pdfData = ref(null)
const mostrarModal = ref(false)
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add', 'edit'])

const filtroAlmacen = ref(null)
const filter = ref('')
const pagination = ref({ page: 1, rowsPerPage: 10 })

// Procesamiento inicial para añadir índice si se desea
// const processedRows = computed(() => {
//   return props.rows.map((row, index) => ({
//     ...row,
//     numero: index + 1,
//   }))
// })

// Columnas de la tabla
const columnas = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => row.numero,
    align: 'center',
  },
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  {
    name: 'precio',
    label: 'Costo',
    align: 'right',
    field: 'precio',
    format: (val) => (isNaN(val) ? '0.00' : Number(val).toFixed(2)),
  },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]

// Filtro combinado por búsqueda y almacén
const filtrados = computed(() => {
  const res = props.rows.filter((p) => {
    console.log(filtroAlmacen.value)
    const matchesAlmacen =
      (!filtroAlmacen.value || p.idalmacen === filtroAlmacen.value) && filtroAlmacen.value !== null
    const matchesCodigo =
      !filter.value ||
      p.codigo.toLowerCase().includes(filter.value.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(filter.value.toLowerCase())
    return matchesCodigo && matchesAlmacen
  })

  return res.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})

// Emitir evento de edición
function editarProducto(id) {
  emit('edit', id)
}
// Función imprimir (puedes reemplazar con lógica real)
function onPrintReport() {
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
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Precio', dataKey: 'precio' },
  ]

  const datos = filtrados.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    descripcion: item.descripcion,
    precio: decimas(item.precio),
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
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
      // También puedes aplicar estilo a una fila específica, por ejemplo la de índice 2:
      // if (data.row.index === 2) {
      //   data.cell.styles.fontStyle = 'italic'
      //   data.cell.styles.fillColor = [255, 240, 200]
      // }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
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
        doc.text('COSTOS UNITARIOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Nombre del Almacén: ' + filtroAlmacen.value?.label, 5, 38)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha se Impresión: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(idempresa.nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(idempresa.cargo, 200, 41, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
