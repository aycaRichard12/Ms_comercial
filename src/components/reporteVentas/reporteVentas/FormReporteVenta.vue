<template>
  <q-page>
    <!-- Formulario principal -->
    <q-form @submit.prevent="onSubmit">
      <div class="row justify-center q-col-gutter-x-md q-ma-sm">
        <div class="col-12 col-md-3">
          <label for="fechaini">Fecha Inicial*</label>
          <q-input type="date" v-model="fechai" id="fechaini" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <label for="fechafin">Fecha Final*</label>
          <q-input type="date" v-model="fechaf" id="fechafin" dense outlined />
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <div class="">
          <q-btn label="Generar reporte" color="primary" type="submit" class="q-mr-sm" />
        </div>
      </div>
    </q-form>
    <div class="row flex justify-between q-ma-md">
      <q-btn icon="picture_as_pdf" label="Vista previa" color="red" outline @click="vistaPrevia" />
      <q-btn
        icon="mdi-microsoft-excel"
        label="Exportar Excel"
        color="green"
        outline
        @click="exportXLSX"
      />
    </div>
    <div class="row q-col-gutter-x-md q-ma-sm">
      <div class="col-12 col-md-2">
        <label for="almacen">Filtrar por Almacén</label>
        <q-select id="almacen" dense outlined v-model="almacen" :options="almacenes" clearable />
      </div>

      <div class="col-12 col-md-3">
        <label for="cliente">Filtrar por razón social</label>
        <q-input
          v-model="clienteBusqueda"
          id="cliente"
          dense
          outlined
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

      <div class="col-12 col-md-2">
        <label for="sucursal">Filtrar por sucursal del cliente</label>
        <q-input
          v-model="sucursalBusqueda"
          id="sucursal"
          dense
          outlined
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

      <div class="col-12 col-md-2">
        <label for="canal">Filtrar por canal de venta</label>
        <q-select id="canal" dense outlined="" v-model="canal" :options="canales" clearable />
      </div>

      <div class="col-12 col-md-3">
        <label for="tipopago">Filtrar por tipo de pago</label>
        <q-select
          id="tipopago"
          dense
          outlined=""
          v-model="tipopago"
          :options="[
            { label: 'todo', value: '0' },
            { label: 'A crédito', value: 'credito' },
            { label: 'Al contado', value: 'contado' },
          ]"
          clearable
        />
      </div>
    </div>
    <q-table
      title="Reporte ventas"
      :rows="filteredCompra"
      :columns="columnas"
      row-key="id"
      flat
      class="q-ma-sm"
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
import { redondear } from 'src/composables/FuncionesG'
import { PDFComprovanteVenta } from 'src/utils/pdfReportGenerator'
import { PDFreporteVentasPeriodo } from 'src/utils/pdfReportGenerator'
import { PDFenviarFacturaCorreo } from 'src/utils/pdfReportGenerator'
import { exportTOXLSX_Reporte_Ventas } from 'src/utils/XCLReportImport'
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
const today = new Date().toISOString().slice(0, 10)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

// Fec
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
async function enviarFacturaCorreo(idcliente) {
  PDFenviarFacturaCorreo(idcliente, detalleVenta, $q)
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
  const doc = PDFComprovanteVenta(detalleVenta)
  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const vistaPrevia = () => {
  console.log(filteredCompra.value, almacen.value)
  const doc = PDFreporteVentasPeriodo(filteredCompra, almacen)

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const exportXLSX = () => {
  exportTOXLSX_Reporte_Ventas(filteredCompra, almacen, fechai, fechaf)
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
    const datos = response.data
    const filtrados = datos.filter((obj) => Number(obj.estado) == 1)
    rows.value = filtrados // Asume que la API devuelve un array
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
