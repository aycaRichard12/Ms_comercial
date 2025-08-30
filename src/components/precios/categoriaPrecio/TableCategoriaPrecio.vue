<template>
  <!-- Encabezado de acciones -->
  <div class="row flex justify-between">
    <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
      <q-icon name="add" class="icono" />
      <span class="texto">Agregar</span>
    </q-btn>

    <!-- Filtros -->
    <div>
      <label for="almacen">Seleccione un Almacén</label>
      <q-select
        v-model="filtroAlmacen"
        :options="almacenes"
        dense
        outlined
        map-options
        id="almacen"
      />
    </div>

    <q-btn color="info" @click="imprimir" outline class="btn-res q-mt-lg">
      <q-icon name="picture_as_pdf" class="icono" />
      <span class="texto">Vista Previa PDF</span>
    </q-btn>
  </div>
  <div class="row flex justify-end">
    <div class="">
      <label for="buscar"> Buscar...</label>
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
  <!-- Tabla -->
  <q-table
    flat
    :rows="filtradas"
    :filter="search"
    :columns="columnas"
    row-key="id"
    :pagination="{ rowsPerPage: 5 }"
  >
    <template v-slot:top-right> </template>
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
          flat
        />
        <q-btn icon="delete" color="negative" dense @click="$emit('delete-item', props.row)" flat />
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
import { ref, computed, watch } from 'vue'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { URL_APIE } from 'src/composables/services'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
const filtroAlmacen = ref(null)
const pdfData = ref(null)
const mostrarModal = ref(false)
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
})

defineEmits(['add', 'edit-item', 'delete-item', 'toggle-status'])

const columnas = [
  { name: 'numero', label: 'N°', align: 'right', field: 'numero', sortable: true },
  { name: 'nombre', label: 'Categoría', align: 'left', field: 'nombre' },
  { name: 'porcentaje', label: 'Porcentaje', align: 'right', field: 'porcentaje' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]
const filtradas = computed(() => {
  let rows = props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))

  // Solo filtrar si hay selección
  console.log(filtroAlmacen.value)
  if (filtroAlmacen.value !== null) {
    rows = rows.filter((categoria) => categoria.idalmacen == filtroAlmacen.value?.value)
  }

  // Filtro por búsqueda
  if (search.value) {
    const term = search.value.toLowerCase()
    rows = rows.filter((r) => r.nombre.toLowerCase().includes(term))
  }

  return rows
})
console.log(props.almacenes)
watch(
  () => props.almacenes,
  (nuevosAlmacenes) => {
    if (nuevosAlmacenes.length > 0 && !filtroAlmacen.value) {
      console.log(nuevosAlmacenes)
      filtroAlmacen.value = nuevosAlmacenes[0]
    }
  },
  { immediate: true },
)

const imprimir = () => {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Porcentaje', dataKey: 'porcentaje' },
  ]

  const datos = filtradas.value.map((item, indice) => ({
    indice: indice + 1,
    nombre: item.nombre,
    porcentaje: item.porcentaje,
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
      nombre: { cellWidth: 90, halign: 'left' },
      porcentaje: { cellWidth: 90, halign: 'right' },
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
        doc.text(
          'Nombre del Almacén ' + (filtroAlmacen.value?.label || 'Todos los Almacenes'),
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha se Impresión' + obtenerFechaActualDato(), 5, 41)

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

const search = ref('')
</script>
