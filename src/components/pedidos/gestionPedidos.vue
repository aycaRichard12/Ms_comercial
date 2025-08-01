<template>
  <q-page class="q-ma-md">
    <div>
      <!-- Formulario principal -->
      <q-form @submit.prevent="onSubmit">
        <div class="row justify-center q-col-gutter-md">
          <q-input type="date" v-model="fechai" label="Fecha Inicial*" class="col-12 col-md-4" />
          <q-input type="date" v-model="fechaf" label="Fecha Final*" class="col-12 col-md-4" />
        </div>

        <div class="row justify-center q-mt-md">
          <div class="col-auto">
            <q-btn label="Generar reporte" color="primary" type="submit" class="q-mr-sm" />
            <q-btn label="Vista previa del Reporte" color="primary" outline @click="vistaPrevia" />
          </div>
        </div>
      </q-form>
      <div style="display: flex; justify-content: space-between">
        <q-select
          label="Filtrar por Almacén"
          v-model="almacen"
          :options="almacenes"
          style="width: 200px; min-width: 200px"
          class="q-ma-sm"
          clearable
        />
      </div>
      <q-table
        :rows="filterPedido"
        :columns="columnas"
        row-key="id"
        flat
        class="q-mt-md"
        :style="{ maxHeight: 'calc(100vh - 325px)', overflowY: 'auto' }"
      >
        <template v-slot:body-cell-tipopedido="props">
          <q-td :props="props">
            {{ tipo[Number(props.row.tipopedido)] }}
          </q-td>
        </template>
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            {{ tipoestados[Number(props.row.estado)] }}
          </q-td>
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
        <template #body-cell-acciones="props">
          <q-td align="center">
            <!-- Ver Detalle -->

            <!-- Enviar por WhatsApp -->

            <template v-if="Number(props.row.autorizacion) === 2">
              <q-btn size="sm" icon="visibility" flat @click="verDetalle(props.row)" dense
                ><q-tooltip>Ver Pedido</q-tooltip>
              </q-btn>
              <q-btn icon="delete" color="negative" dense flat @click="confirmDelete(props.row)" />

              <q-btn icon="toggle_off" dense flat color="grey" @click="toggleStatus(props.row)">
                <q-tooltip>Autorizar Pedido</q-tooltip>
              </q-btn>
            </template>
            <template v-else>
              <q-btn size="sm" icon="visibility" flat @click="verDetalle(props.row)" dense
                ><q-tooltip>Ver Pedido</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                icon="mdi-whatsapp"
                color="green"
                flat
                @click="enviarPDFPorWhatsApp(props.row)"
                dense
              >
                <q-tooltip>Enviar PDF por WhatsApp</q-tooltip>
              </q-btn>
            </template>
          </q-td>
        </template>
        <!-- Autorizar -->
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
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { URL_APIE } from 'src/composables/services'
import { decimas } from 'src/composables/FuncionesG'
import { useWhatsapp } from 'src/composables/useWhatsapp'
const { mostrarDialogoWhatsapp } = useWhatsapp()
const pdfData = ref(null)
const mostrarModal = ref(false)

const tipo = { 1: 'Pedido Compra', 2: 'Pedido Movimiento' }
const tipoestados = { 1: 'Procesado', 2: 'Pendiente', 3: 'Descartado' }

const $q = useQuasar()
// Obtener la fecha actual en formato YYYY-MM-DD
const today = new Date().toISOString().slice(0, 10)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

// Fechas
const fechai = ref(today)
const fechaf = ref(today)

// Filtros
const almacen = ref(null)
const canal = ref(null)
const tipopago = ref('')

// Opciones select
const almacenes = ref([])

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}

// Datos de la tabla
const columnas = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'nropedido', label: 'Nro.Pedido', field: 'nropedido', align: 'center' },
  { name: 'tipopedido', label: 'Tipo', field: 'tipopedido', align: 'center' },
  { name: 'almacenorigen', label: 'Almacén Origen', field: 'almacenorigen', align: 'center' },
  { name: 'almacen', label: 'Almacén Destino', field: 'almacen', align: 'center' },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'center' },
  { name: 'autorizacion', label: 'Autorización', field: 'autorizacion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const rows = ref([])
const detallePedido = ref([])
// Acciones
const verDetalle = async (row) => {
  console.log(row)
  await getDatallePedido(row.id)
  if (detallePedido.value) {
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Pedido  sin items',
    })
  }
}

const onSubmit = async () => {
  try {
    const response = await api.get(`reportepedidos/${idusuario}/${fechai.value}/${fechaf.value}`) // Cambia a tu ruta real
    rows.value = response.data // Asume que la API devuelve un array
    console.log(rows.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const processedRows = computed(() => {
  return rows.value.map((row, index) => ({
    fecha: cambiarFormatoFecha(row.fecha),
    id: row.id,
    autorizacion: row.autorizacion,
    observacion: row.observacion,
    codigo: row.codigo,
    idalmacen: row.idalmacen,
    almacen: row.almacen,
    estado: row.estado,
    tipopedido: row.tipopedido,
    idalmacenorigen: row.idalmacenorigen,
    almacenorigen: row.almacenorigen,
    idusuario: row.idusuario,
    nropedido: row.nropedido,
    nro: index + 1,
  }))
})
const filterPedido = computed(() => {
  return processedRows.value.filter((compra) => {
    console.log(canal.value, tipopago.value)
    const porAlmacen = !almacen.value || compra.idalmacen == almacen.value.value

    return porAlmacen
  })
})
const getDatallePedido = async (id) => {
  try {
    const response = await api.get(`getPedido_/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

function imprimirReporte() {
  console.log(detallePedido.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detallePedido.value))

  const datos = detallePlano[0].detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
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
      descripcion: { cellWidth: 100, halign: 'left' },
      cantidad: { cellWidth: 80, halign: 'right' },
    },
    didParseCell: function (data) {
      if (data.row.index >= datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa) {
          doc.addImage(`${URL_APIE}/${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
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
        doc.text('ORDEN PEDIDO', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        doc.setDrawColor(0)
        doc.setLineWidth(0.2)
        doc.line(5, 30, 200, 30)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS ORDEN:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        const cliente = `${detallePlano[0].almacen}`
        doc.text(cliente, 5, 38)

        doc.text(detallePlano[0].empresa.direccion, 5, 41)
        doc.text(detallePlano[0].empresa.email, 5, 44)
        doc.text('Fecha de Orden: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuarios[0].usuario, 200, 38, { align: 'right' })
        doc.text(detallePlano[0].usuarios[0].cargo, 200, 41, { align: 'right' })
        doc.text('Tipo ' + tipo[detallePlano[0].tipopedido], 200, 44, { align: 'right' })
      }
    },
  })

  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
const vistaPrevia = () => {
  console.log(filterPedido.value)
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
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Nro.Pedido', dataKey: 'nropedido' },
    { header: 'Tipo', dataKey: 'tipopedido' },
    { header: 'Almacén Origen', dataKey: 'almacenorigen' },
    { header: 'Almacén Destino', dataKey: 'almacen' },
    { header: 'Observación', dataKey: 'observacion' },
    { header: 'Esatado', dataKey: 'estado' },
  ]
  // filterPedido.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = filterPedido.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: item.fecha,
    codigo: item.codigo,
    nropedido: item.nropedido,
    tipopedido: tipo[Number(item.tipopedido)],
    almacenorigen: item.almacenorigen,
    almacen: item.almacen,
    observacion: item.observacion,
    estado: tipoestados[Number(item.estado)],
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
      nropedido: { cellWidth: 15, halign: 'center' },
      tipopedido: { cellWidth: 25, halign: 'left' },
      almacenorigen: { cellWidth: 25, halign: 'left' },
      almacen: { cellWidth: 25, halign: 'left' },
      observacion: { cellWidth: 40, halign: 'left' },
      estado: { cellWidth: 15, halign: 'left' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
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
        doc.text('REPORTE DE PEDIDOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'Entre ' + cambiarFormatoFecha(fechai.value) + ' Y ' + cambiarFormatoFecha(fechaf.value),
          doc.internal.pageSize.getWidth() / 2,
          19,
          {
            align: 'center',
          },
        )
        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Nombre del Almacen: ' + (almacen.value?.label || 'Todo los Almacenes'), 5, 38)

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
const toggleStatus = async (item) => {
  try {
    const responsev = await api.get(`verificarDetallePedido/${item.id}`)
    console.log(responsev.data)
    if (!responsev.data.tieneDetalle) {
      $q.notify({
        type: 'negative',
        message: 'El pedido está vacío y no puede ser confirmado.',
      })
      return
    }

    $q.dialog({
      title: 'Confirmar',
      message: '¿Deseas confirmar este pedido?',
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        const response = await api.get(`actualizarEstadoPedido/${item.id}/1`)
        if (response.data.estado === 'error') {
          $q.notify({
            type: 'negative',
            message: response.data.mensaje,
          })
        } else {
          onSubmit()
          enviarPDFPorWhatsApp(item) // llamada a función si es exitosa
        }
      } catch (error) {
        console.error('Error al autorizar el pedido:', error)
        $q.notify({
          type: 'negative',
          message: 'No se pudo autorizar el pedido. Intenta de nuevo.',
        })
      }
    })
  } catch (error) {
    console.error('Error al verificar detalle del pedido:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al verificar si el pedido tiene productos.',
    })
  }
}
const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Pedido?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarPedido/${item.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        getDatallePedido()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}
const enviarPDFPorWhatsApp = async (row) => {
  console.log(row)
  await getDatallePedido(row.id)

  if (!detallePedido.value) {
    $q.notify({
      type: 'negative',
      message: 'Pedido sin items',
    })
    return
  }

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo

  const detallePlano = JSON.parse(JSON.stringify(detallePedido.value))
  const datos = detallePlano[0].detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
  }))

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  autoTable(doc, {
    columns,
    body: datos,
    startY: 50,
    margin: { horizontal: 5 },
    styles: { fontSize: 5, cellPadding: 2 },
    headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: 'center' },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 100, halign: 'left' },
      cantidad: { cellWidth: 80, halign: 'right' },
    },
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}/${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }
        doc.setFontSize(7).setFont(undefined, 'bold').text(nombreEmpresa, 5, 10)
        doc.setFontSize(6).setFont(undefined, 'normal').text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)
        doc
          .setFontSize(10)
          .setFont(undefined, 'bold')
          .text('ORDEN PEDIDO', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
        doc.setDrawColor(0).setLineWidth(0.2).line(5, 30, 200, 30)
        doc.setFontSize(7).setFont(undefined, 'bold').text('DATOS ORDEN:', 5, 35)
        doc.setFontSize(6).setFont(undefined, 'normal')
        doc.text(`${detallePlano[0].almacen}`, 5, 38)
        doc.text(detallePlano[0].empresa.direccion, 5, 41)
        doc.text(detallePlano[0].empresa.email, 5, 44)
        doc.text('Fecha de Orden: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc
          .setFontSize(7)
          .setFont(undefined, 'bold')
          .text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })
        doc.setFontSize(6).setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuarios[0].usuario, 200, 38, { align: 'right' })
        doc.text(detallePlano[0].usuarios[0].cargo, 200, 41, { align: 'right' })
        doc.text('Tipo ' + tipo[detallePlano[0].tipopedido], 200, 44, { align: 'right' })
      }
    },
  })

  // ✅ Convertir PDF a Blob
  const pdfBlob = doc.output('blob')

  // ✅ Crear objeto FormData para enviarlo al servidor
  const formData = new FormData()

  const nombreArchivo = `OrdenPedido_${row.id}.pdf`
  formData.append('ver', 'subir_pdf')

  formData.append('file', pdfBlob, nombreArchivo)

  const response = await fetch('https://mistersofts.com/app/cmv1/api/', {
    method: 'POST',
    body: formData,
    mode: 'cors', // Esto fuerza a mostrar errores CORS claramente
  })

  console.log('Tamaño del PDF:', pdfBlob.size)
  if (pdfBlob.size === 0) throw new Error('El PDF está vacío')
  const result = await response.text() // Si el servidor no envía JSON
  console.log('Respuesta del servidor:', result)
  console.log('Response completo:', {
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers],
    body: result,
  })
  if (result.includes('error') || result.includes('fail')) {
    // Ajusta según lo que devuelva tu servidor
    throw new Error(result)
  }
  if (!response.ok) {
    throw new Error(result || 'Error al subir el PDF')
  }

  // WhatsApp después de la subida exitosa
  const linkPDF = `https://mistersofts.com/app/cmv1/api/pdfs/${nombreArchivo}`
  mostrarDialogoWhatsapp(
    `Aquí tienes la orden de pedido: ${linkPDF}\n\n*Nota: Este enlace estará activo por 48 horas y luego será eliminado.*`,
  )
}

onMounted(() => {
  cargarAlmacenes()
  onSubmit()
})
</script>
