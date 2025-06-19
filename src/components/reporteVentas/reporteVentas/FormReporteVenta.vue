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
        <div style="flex: 1 1 0; min-width: 250px" class="q-ma-sm">
          <q-input
            v-model="clienteBusqueda"
            label="Filtrar por razón social"
            @click="dialogClientes = true"
            readonly
            clearable
          >
            <template v-if="clienteSeleccionadoId" v-slot:append>
              <q-btn
                dense
                flat
                round
                icon="close"
                color="negative"
                size="sm"
                @click.stop="clearCliente"
                class="q-mr-xs"
              />
            </template>
          </q-input>
          <q-dialog v-model="dialogClientes" persistent>
            <q-card style="width: 80vw; max-width: 800px">
              <q-card-section class="row items-center">
                <q-input
                  v-model="clienteFilter"
                  label="Filtrar clientes..."
                  dense
                  class="col-grow"
                  autofocus
                />
                <q-btn flat round icon="close" v-close-popup />
              </q-card-section>

              <q-card-section style="max-height: 70vh" class="scroll">
                <q-list bordered separator>
                  <q-item
                    v-for="cliente in clientesFiltrados"
                    :key="cliente.value"
                    clickable
                    @click="selectCliente(cliente)"
                    :active="cliente.value === clienteSeleccionadoId"
                    active-class="bg-blue-1 text-primary"
                  >
                    <q-item-section>
                      <q-item-label>{{ cliente.label }}</q-item-label>
                      <q-item-label caption>ID: {{ cliente.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-dialog>
        </div>
        <div style="flex: 1 1 0; min-width: 250px" class="q-ma-sm">
          <q-input
            v-model="sucursalBusqueda"
            label="Filtrar por sucursal del cliente"
            class="col-12 col-md-3"
            @click="dialogSucursal = true"
            readonly
            clearable
          >
            <template v-if="SucursalSelecionadoId" v-slot:append>
              <q-btn
                dense
                flat
                round
                icon="close"
                color="negative"
                size="sm"
                @click="clearSucursal"
                class="q-mr-xs"
              />
            </template>
          </q-input>
          <q-dialog v-model="dialogSucursal" persistent>
            <q-card style="width: 80vw; max-width: 800px">
              <q-card-section class="row items-center">
                <q-input
                  v-model="sucursalFilter"
                  label="Filtrar clientes..."
                  dense
                  class="col-grow"
                  autofocus
                />
                <q-btn flat round icon="close" v-close-popup />
              </q-card-section>

              <q-card-section style="max-height: 70vh" class="scroll">
                <q-list bordered separator>
                  <q-item
                    v-for="sucursal in sucursalesFilter"
                    :key="sucursal.value"
                    clickable
                    @click="selectSucursal(sucursal)"
                    :active="sucursal.value === sucursalFilter"
                    active-class="bg-blue-1 text-primary"
                  >
                    <q-item-section>
                      <q-item-label>{{ sucursal.label }}</q-item-label>
                      <q-item-label caption>ID: {{ sucursal.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-dialog>
        </div>

        <q-select
          label="Filtrar por canal de venta"
          v-model="canal"
          :options="canales"
          class="q-ma-sm"
          style="width: 180px; min-width: 180px"
          clearable
        />

        <q-select
          label="Filtrar por tipo de pago"
          v-model="tipopago"
          style="width: 180px; min-width: 180px"
          :options="[
            { label: 'todo', value: '0' },
            { label: 'A crédito', value: 'credito' },
            { label: 'Al contado', value: 'contado' },
          ]"
          class="q-ma-sm"
          clearable
        />
      </div>
      <q-table
        :rows="filteredCompra"
        :columns="columnas"
        row-key="id"
        flat
        class="q-mt-md"
        :style="{ maxHeight: 'calc(100vh - 325px)', overflowY: 'auto' }"
      >
        <template v-slot:body-cell-tipoventa="props">
          <q-td :props="props">
            {{ tipo[Number(props.row.tipoventa)] }}
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td align="center">
            <q-btn size="sm" icon="visibility" flat @click="verDetalle(props.row)" />
            <q-btn
              size="sm"
              icon="email"
              flat
              color="primary"
              @click="crearMensaje(props.row)"
              class="q-ml-sm"
            />
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
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { URL_APIE } from 'src/composables/services'
import { decimas, redondear, numeroALetras } from 'src/composables/FuncionesG'

const pdfData = ref(null)
const mostrarModal = ref(false)

const tipo = {
  0: 'Comprobante Venta',
  1: 'Factura Compra-Venta',
  2: 'Factura Alquileres',
  3: 'Factura Comercial Exportación',
  24: 'Nota de Crédito-Débido',
}

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
const sucursal = ref('')
const canal = ref(null)
const tipopago = ref('')

// Opciones select
const almacenes = ref([])
const canales = ref([])

// Autocompletado
const dialogClientes = ref(false)
const clienteBusqueda = ref('')
const clienteFilter = ref('')
const clienteSeleccionadoId = ref(null)
const clientes = ref([])

const dialogSucursal = ref(false)
const sucursalBusqueda = ref('')
const sucursalFilter = ref('')
const SucursalSelecionadoId = ref(null)
const sucursales = ref([])

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
async function getSucursale() {
  console.log(clienteSeleccionadoId.value)
  try {
    const response = await api.get(`listaSucursal/${clienteSeleccionadoId.value}`)
    sucursales.value = response.data.map((cli) => ({
      value: cli.id,
      label: `${cli.nombre}`,
    }))
  } catch (error) {
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
  }
}
async function getClientes() {
  try {
    const response = await api.get(`listaCliente/${idempresa}`)
    clientes.value = response.data.map((cli) => ({
      value: cli.id,
      label: `${cli.codigo} - ${cli.nombre} - ${cli.nombrecomercial} - ${cli.ciudad} - ${cli.nit}`,
    }))
  } catch (error) {
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
  }
}
async function getCanalVenta() {
  try {
    const response = await api.get(`listaCanalVenta/${idempresa}`)
    canales.value = response.data.map((cli) => ({
      value: cli.id,
      label: `${cli.canal}`,
    }))
  } catch (error) {
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
  }
}
const clientesFiltrados = computed(() => {
  if (!clienteFilter.value) return clientes.value
  const search = clienteFilter.value.toLowerCase()
  return clientes.value.filter((c) => c.label.toLowerCase().includes(search))
})

const selectCliente = (cliente) => {
  clienteSeleccionadoId.value = cliente.value
  clienteBusqueda.value = cliente.label
  dialogClientes.value = false
  getSucursale()
  clearSucursal()
}

const clearCliente = () => {
  clienteSeleccionadoId.value = null
  clienteBusqueda.value = ''
  clearSucursal()
}

const sucursalesFilter = computed(() => {
  if (!sucursalFilter.value) return sucursales.value
  const search = sucursalFilter.value.toLowerCase()
  return sucursales.value.filter((c) => c.label.toLowerCase().includes(search))
})

const selectSucursal = (sucursal) => {
  SucursalSelecionadoId.value = sucursal.value
  sucursalBusqueda.value = sucursal.label
  dialogSucursal.value = false
}

const clearSucursal = () => {
  SucursalSelecionadoId.value = null
  sucursalBusqueda.value = ''
}

// Datos de la tabla
const columnas = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha' },
  { name: 'cliente', label: 'Cliente', field: 'cliente' },
  //{ name: 'sucursal', label: 'Sucursal', field: 'sucursal' },
  { name: 'tipoventa', label: 'Tipo-Venta', field: 'tipoventa' },
  { name: 'tipopago', label: 'Tipo-Pago', field: 'tipopago' },
  { name: 'nfactura', label: 'Nro.Factura', field: 'nfactura' },
  { name: 'canal', label: 'Canal', field: 'canal' },
  { name: 'total', label: 'Total', field: 'total' },
  { name: 'descuento', label: 'Dscto.', field: 'descuento' },
  { name: 'ventatotal', label: 'Monto', field: 'ventatotal' },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

const rows = ref([])
const detalleVenta = ref([])
// Acciones
const verDetalle = async (row) => {
  console.log(row)
  await getDetalleVenta(row.idventa)
  if (detalleVenta.value) {
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }
}
const crearMensaje = async (row) => {
  try {
    const response = await api.get(`obtenerEmailCliente/${row.idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email
    $q.dialog({
      title: 'Confirmar',
      message: `¿Enviar factura a correo  "${clientEmail}"?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      console.log(row.idcliente)

      await getDetalleVenta(row.idventa)
      if (detalleVenta.value) {
        enviarFacturaCorreo(row.idcliente)
      } else {
        $q.notify({
          type: 'negative',
          message: 'Venta sin items',
        })
      }
    })
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const enviarFacturaCorreo = async (idcliente) => {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono
  const logoEmpresa = usuario.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano[0].detalle[0].reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano[0].descuento)))

  const descuento = decimas(detallePlano[0].descuento || 0)
  const montoTexto = numeroALetras(montototal, detallePlano[0].divisa)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal), descripcion: montoTexto },
  )
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
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })

  try {
    const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    const pdfBlob = doc.output('blob')

    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `factura-${detallePlano[0].nfactura}.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', detallePlano[0].nfactura)
    formData.append('clientName', detallePlano[0].cliente)
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Factura enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar la factura por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}
const getDetalleVenta = async (id) => {
  try {
    const response = await api.get(`detallesVenta/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detalleVenta.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

function imprimirReporte() {
  console.log(detalleVenta.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano[0].detalle[0].reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano[0].descuento)))

  const descuento = decimas(detallePlano[0].descuento || 0)
  const montoTexto = numeroALetras(montototal, detallePlano[0].divisa)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal), descripcion: montoTexto },
  )
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
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const vistaPrevia = () => {
  console.log(filteredCompra.value)
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
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Tipo-Venta', dataKey: 'tipoventa' },
    { header: 'Tipo-Pago', dataKey: 'tipopago' },
    { header: 'Nro.Factura', dataKey: 'nfactura' },
    { header: 'Canal', dataKey: 'canal' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Dscto', dataKey: 'descuento' },
    { header: 'Monto', dataKey: 'ventatotal' },
  ]
  // filteredCompra.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = filteredCompra.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    cliente: item.cliente,
    sucursal: item.sucursal,
    tipoventa: tipo[item.tipoventa],
    tipopago: item.tipopago,
    nfactura: item.nfactura,
    canal: item.canal,
    total: item.total,
    descuento: decimas(item.descuento),
    ventatotal: decimas(item.ventatotal),
  }))

  const descuento = filteredCompra.value.reduce(
    (sum, row) => sum + redondear(parseFloat(row.descuento)),
    0,
  )

  const total = filteredCompra.value.reduce(
    (sum, row) =>
      sum + redondear(parseFloat(row.ventatotal)) + redondear(parseFloat(row.descuento)),
    0,
  )

  datos.push({
    canal: 'Total Sumatorias',
    total: decimas(total),
    descuento: decimas(descuento),
    ventatotal: decimas(total + descuento),
  })

  console.log(almacen.value)
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
      cliente: { cellWidth: 25, halign: 'left' },
      sucursal: { cellWidth: 25, halign: 'left' },
      tipoventa: { cellWidth: 25, halign: 'center' },
      tipopago: { cellWidth: 15, halign: 'center' },
      nfactura: { cellWidth: 15, halign: 'center' },
      canal: { cellWidth: 20, halign: 'left' },
      total: { cellWidth: 15, halign: 'right' },
      descuento: { cellWidth: 15, halign: 'right' },
      ventatotal: { cellWidth: 15, halign: 'right' },
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
        doc.text('REPORTE VENTAS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

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

const onSubmit = async () => {
  console.log('Generar reporte con filtros:', {
    fechai: fechai.value,
    fechaf: fechaf.value,
    sucursal: sucursal.value,
    canal: canal.value,
    almacen: almacen.value,
    tipopago: tipopago.value,
  })
  try {
    const response = await api.get(`reporteventas/${idusuario}/${fechai.value}/${fechaf.value}`) // Cambia a tu ruta real
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
    ...row,
    nro: index + 1,
    total: redondear(parseFloat(row.ventatotal) + parseFloat(row.descuento)),
  }))
})
const filteredCompra = computed(() => {
  return processedRows.value.filter((compra) => {
    console.log(canal.value, tipopago.value)
    const porAlmacen = !almacen.value || compra.idalmacen == almacen.value.value
    const porCliente =
      !clienteSeleccionadoId.value || compra.idcliente == clienteSeleccionadoId.value
    const porSucursal =
      !SucursalSelecionadoId.value || compra.idsucursal == SucursalSelecionadoId.value
    const porCanal = !canal.value || compra.idcanal == canal.value?.value
    const porTipoPago = !tipopago.value || compra.tipopago == tipopago.value?.value

    return porAlmacen && porCliente && porSucursal && porCanal && porTipoPago
  })
})

onMounted(() => {
  cargarAlmacenes()
  getClientes()
  getCanalVenta()
})
</script>
