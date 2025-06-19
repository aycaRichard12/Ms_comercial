<template>
  <div class="q-pa-md">
    <!-- Cabecera -->
    <div class="row justify-between items-center q-gutter-md">
      <div class="col-auto">
        <q-btn icon="add" color="primary" label="Agregar" @click="$emit('add')" />
      </div>

      <div class="col-6 row justify-center q-gutter-md">
        <q-select
          v-model="filtroAlmacen"
          :options="almacenes"
          label="Seleccione un Almacén"
          map-options
          clearable
          class="col"
          style="min-width: 200px"
        />

        <q-select
          v-model="filtroTipo"
          :options="tiposPedido"
          label="Tipo"
          emit-value
          map-options
          clearable
          class="col"
          style="min-width: 200px"
        />
      </div>

      <div class="col-auto">
        <q-btn color="info" icon="print" label="Imprimir" @click="imprimir" />
      </div>
    </div>

    <!-- Tabla -->
    <q-table
      :rows="ordenados"
      :columns="columnas"
      :loading="loading"
      row-key="id"
      flat
      bordered
      wrap-cells
      class="q-mt-sm"
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="search" placeholder="Buscar...">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
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
      <template v-slot:body-cell-tipopedido="props">
        <q-td :props="props">
          <div v-if="Number(props.row.tipopedido) === 1">
            {{ 'Compra' }}
          </div>
          <div v-else>
            {{ 'Movimiento' }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-ruta="props">
        <q-td :props="props">
          <template v-if="/\.pdf$/i.test(props.row.ruta)">
            <q-btn
              color="primary"
              icon="picture_as_pdf"
              label="Ver PDF"
              @click="abrirEnNuevaPestana(props.row.ruta)"
            />
          </template>

          <template v-else>
            <q-img
              :src="props.row.ruta"
              class="cursor-pointer"
              style="max-height: 100px"
              @click="$emit('verimagen', props.row)"
            />
          </template>
        </q-td>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          {{ tipoestados[Number(props.row.estado)] }}
        </q-td>
      </template>
      <template v-slot:body-cell-detalle="props">
        <q-td>
          <q-btn
            color="primary"
            label="Productos"
            dense
            flat
            @click="$emit('verDetalle', props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <div v-if="Number(props.row.autorizacion) === 2">
            <q-btn icon="edit" color="primary" dense flat @click="$emit('edit', props.row)" />
            <q-btn icon="delete" color="negative" dense flat @click="$emit('delete', props.row)" />
            <template v-if="Number(props.row.tipopedido) === 2">
              <q-btn
                icon="attach_file"
                color="secondary"
                dense
                flat
                @click="subirBaucher(props.row)"
              />
            </template>
          </div>
          <div v-else>
            <div v-if="Number(props.row.tipopedido) === 2">
              <q-btn
                icon="attach_file"
                color="secondary"
                dense
                flat
                @click="subirBaucher(props.row)"
              />
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md">No hay datos para mostrar.</div>
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
  <baucherPedido v-model="baucherPedidomodal" :modal-value="pedido" :idPedido="pedidoId" />
</template>

<script setup>
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { URL_APIE } from 'src/composables/services'
import baucherPedido from './baucherPedido.vue'
const props = defineProps({
  pedidos: {
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
const pedido = ref(null)
const baucherPedidomodal = ref(false)
defineEmits(['add', 'edit', 'delete'])
const tipoestados = { 1: 'Procesado', 2: 'Pendiente', 3: 'Descartado' }
const pdfData = ref(null)
const filtroAlmacen = ref(null)
const search = ref('')
const mostrarModal = ref(false)
const pedidoId = ref('')
const tiposPedido = [
  { label: 'Pedidos de Compras', value: 1 },
  { label: 'Pedidos de Movimientos', value: 2 },
]
const filtroTipo = ref(1) // Siempre comienza en 1
const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
  { name: 'almacenorigen', label: 'Almacén origen', field: 'almacenorigen', align: 'center' },
  { name: 'almacen', label: 'Almacén destino', field: 'almacen', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'tipopedido', label: 'Tipo', field: 'tipopedido', align: 'align' },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'align' },
  { name: 'autorizacion', label: 'Autorización', field: 'autorizacion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'ruta', label: 'Vaucher', field: 'ruta', align: 'center' },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const filtrados = computed(() => {
  return props.pedidos.filter((p) => {
    const coincideAlmacen = filtroAlmacen.value?.value
      ? String(p.idalmacen).includes(filtroAlmacen.value?.value)
      : true
    const coincideTipo = filtroTipo.value ? Number(p.tipopedido) === filtroTipo.value : true
    const coincideBusqueda = search.value
      ? Object.values(p).some((val) =>
          String(val).toLowerCase().includes(search.value.toLowerCase()),
        )
      : true

    return coincideAlmacen && coincideTipo && coincideBusqueda
  })
})

const ordenados = computed(() => {
  return filtrados.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})

function imprimir() {
  console.log(tiposPedido.value)
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
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Almacén Destino', dataKey: 'almacen' },
    { header: 'Almacén Origen', dataKey: 'almacenorigen' },

    { header: 'Código', dataKey: 'codigo' },
    { header: 'Nro.Pedido', dataKey: 'nropedido' },
    { header: 'Tipo', dataKey: 'tipopedido' },

    { header: 'Observación', dataKey: 'observacion' },
    { header: 'Autorización', dataKey: 'autorizacion' },
    { header: 'Esatado', dataKey: 'estado' },
  ]

  const datos = ordenados.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: item.fecha,
    codigo: item.codigo,
    nropedido: item.nropedido,
    tipopedido: Number(item.tipopedido) === 1 ? 'Pedido Compra' : 'Pedido Movimiento',
    almacenorigen: item.almacenorigen,
    almacen: item.almacen,
    observacion: item.observacion,
    estado: tipoestados[Number(item.estado)],
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
      fecha: { cellWidth: 15, halign: 'left' },
      codigo: { cellWidth: 25, halign: 'left' },
      nropedido: { cellWidth: 10, halign: 'center' },
      tipopedido: { cellWidth: 25, halign: 'left' },
      almacenorigen: { cellWidth: 20, halign: 'left' },
      almacen: { cellWidth: 20, halign: 'left' },
      observacion: { cellWidth: 35, halign: 'left' },
      estado: { cellWidth: 15, halign: 'left' },
      autorizacion: { cellWidth: 20, halign: 'left' },
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
        doc.text('PEDIDOS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        console.log(filtroAlmacen.value)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'Nombre del Almacen: ' + (filtroAlmacen.value?.label || 'Todos los Almacenes'),
          5,
          38,
        )

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
const subirBaucher = (item) => {
  console.log(item)
  baucherPedidomodal.value = !baucherPedidomodal.value
  pedido.value = {
    ...item,
  }
  pedidoId.value = item.id
}
const abrirEnNuevaPestana = (ruta) => {
  window.open(ruta, '_blank')
}
</script>

<style scoped>
.text-nowrap {
  white-space: nowrap;
}
</style>
