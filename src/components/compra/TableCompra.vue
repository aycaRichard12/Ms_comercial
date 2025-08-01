<template>
  <q-page>
    <div>
      <!-- Botones principales -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="col-2 q-mt-lg">
          <q-btn color="primary" @click="$emit('add')" class="btn-res">
            <q-icon name="add" class="icono" />
            <span class="texto">Agregar</span>
          </q-btn>
        </div>
        <div class="col-2 q-mt-lg">
          <q-btn color="primary" @click="$emit('repDesglosado')" class="btn-res">
            <q-icon name="picture_as_pdf" class="icono" />
            <span class="texto">Rep. Desglosado</span>
          </q-btn>
        </div>
        <div class="col-2 q-mt-lg">
          <q-btn color="primary" @click="$emit('repCompras')" class="btn-res">
            <q-icon name="picture_as_pdf" class="icono" />
            <span class="texto">Rep. Compras</span>
          </q-btn>
        </div>
        <div class="col-2 q-mt-lg flex justify-end">
          <q-btn color="info" @click="imprimirReporte" class="btn-res" outline>
            <q-icon name="picture_as_pdf" class="icono" />
            <span class="texto">Vista Previa PDF</span>
          </q-btn>
        </div>

        <!-- Filtro de almacén -->
      </div>
      <div class="row q-col-gutter-x-md flex justify-between q-mb-md">
        <div class="col-12 col-md-4">
          <label for="almacen">Seleccione un Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="almacenes"
            id="almacen"
            clearable
            dense
            outlined
          />
        </div>
        <div class="col-12 col-md-2">
          <label for="buscar">Buscar...</label>
          <q-input dense debounce="300" v-model="busqueda" id="buscar" outlined>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Tabla -->
      <q-table
        title="Compras"
        :rows="processedRows"
        :columns="columnas"
        row-key="id"
        :filter="busqueda"
        dense
      >
        <template v-slot:top-right> </template>
        <template v-slot:body-cell-autorizacion="props">
          <q-td :props="props">
            <q-badge
              color="green"
              v-if="Number(props.row.autorizacion) === 1"
              label="Autorizado"
              outline
            />
            <q-badge color="red" v-else label="No Autorizado" outline />
          </q-td>
        </template>
        <template v-slot:body-cell-tipocompra="props">
          <q-td :props="props">
            {{ Number(props.row.tipocompra) === 2 ? 'Contado' : 'A crédito' }}
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td>
            <q-btn
              label="Productos"
              color="primary"
              dense
              flat
              @click="$emit('detalleCompra', props.row)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" class="text-nowrap">
            <div v-if="Number(props.row.autorizacion) === 2">
              <q-btn icon="edit" color="primary" dense flat @click="$emit('edit', props.row)" />
              <q-btn
                icon="delete"
                color="negative"
                dense
                flat
                @click="$emit('delete', props.row)"
              />
              <q-btn
                icon="toggle_off"
                dense
                flat
                color="grey"
                @click="$emit('toggle-status', props.row)"
              />
            </div>
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
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { URL_APIE } from 'src/composables/services'
import { decimas, redondear } from 'src/composables/FuncionesG'

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
    required: true,
    default: () => [],
  },
})
const pdfData = ref(null)
const busqueda = ref('')
const filtroAlmacen = ref(null)
const mostrarModal = ref(false)

const columnas = [
  { name: 'numero', label: 'N°', align: 'right', field: 'numero' },
  { name: 'fecha', label: 'Fecha', align: 'right', field: 'fecha' },
  { name: 'proveedor', label: 'Proveedor', field: 'proveedor', align: 'left' },
  { name: 'lote', label: 'Nombre lote', field: 'lote', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'nfactura', label: 'N° Factura', align: 'right', field: 'nfactura' },
  { name: 'tipocompra', label: 'Tipo compra', field: 'tipocompra', align: 'center' },
  { name: 'total', label: 'Total compra', align: 'right', field: 'total' },
  { name: 'autorizacion', label: 'Autorización', field: 'autorizacion' },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones' },
]
defineEmits(['add', 'repDesglosado', 'repCompras', 'edit', 'delete'])

const filteredCompra = computed(() => {
  if (!filtroAlmacen.value) {
    return props.rows // ← muestra todos si no hay filtro
  }
  return props.rows.filter((compra) => compra.idalmacen == filtroAlmacen.value.value)
})

const processedRows = computed(() => {
  return filteredCompra.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})

function imprimirReporte() {
  console.log(filtroAlmacen.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Proveedor', dataKey: 'proveedor' },
    { header: 'Lote', dataKey: 'lote' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'N° Factura', dataKey: 'nfactura' },
    { header: 'Tipo', dataKey: 'tipocompra' },
    { header: 'Total Compra', dataKey: 'total' },
    { header: 'Estado', dataKey: 'autorizacion' },
  ]

  const datos = filteredCompra.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    proveedor: item.proveedor,
    lote: item.lote,
    codigo: item.codigo,
    nfactura: item.nfactura,
    tipocompra: item.tipocompra == 2 ? 'Contado' : 'Credito',
    total: item.total == null ? 'Lista Vacia' : decimas(redondear(parseFloat(item.total))),
    autorizacion: item.autorizacion == 2 ? 'No Autorizado' : 'Autorizado',
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
      fecha: { cellWidth: 15, halign: 'center' },
      proveedor: { cellWidth: 30, halign: 'left' },
      lote: { cellWidth: 30, halign: 'left' },
      codigo: { cellWidth: 30, halign: 'left' },
      nfactura: { cellWidth: 15, halign: 'right' },
      tipocompra: { cellWidth: 15, halign: 'center' },
      total: { cellWidth: 25, halign: 'right' },
      autorizacion: { cellWidth: 25, halign: 'center' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 45,
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
        doc.text('COMPRAS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Nombre del Almacen: ' + filtroAlmacen.value.label, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(cargo, 200, 41, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>
