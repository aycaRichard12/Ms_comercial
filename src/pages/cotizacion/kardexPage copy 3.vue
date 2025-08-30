<template>
  <q-page padding>
    <q-card-section>
      <q-form @submit="generarReporte">
        <div class="row q-col-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <label for="fechaINi">Fecha Inicial *</label>
            <q-input
              v-model="fechaiR"
              type="date"
              id="fechaINi"
              dense
              outlined
              hint="Fecha de inicio para el reporte"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <label for="fechafin">Fecha Final *</label>
            <q-input
              dense
              outlined
              v-model="fechafR"
              type="date"
              id="fechafin"
              hint="Fecha de fin para el reporte"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <label for="almacen">Almacén *</label>
            <q-select
              dense
              outlined
              v-model="almacenR"
              :options="almacenesOptions"
              id="almacen"
              option-label="almacen"
              option-value="idalmacen"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
              @update:model-value="listaProductosDisponibles"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <label for="producto">Producto *</label>
            <q-select
              dense
              outlined
              v-model="idproductoR"
              use-input
              input-debounce="0"
              id="producto"
              :options="productosFiltrados"
              option-label="descripcion"
              option-value="id"
              emit-value
              map-options
              @filter="filterProductos"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> Sin resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <label for="metodo">Método de Valoración *</label>
            <q-select
              dense
              outlined
              v-model="metodoValoracion"
              :options="['PEPS', 'UEPS', 'Promedio']"
              id="metodo"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
        </div>
        <div class="row q-mt-md justify-center">
          <q-btn type="submit" label="Generar reporte" color="primary" class="q-mr-sm" />
          <q-btn
            v-if="datosFiltrados.length > 0"
            label="Vista previa del Reporte"
            color="secondary"
            @click="cargarPDF"
          />
        </div>
      </q-form>
    </q-card-section>
    <q-table
      title="Reporte Kardex"
      :rows="datosFiltrados"
      :columns="columns"
      row-key="c"
      flat
      bordered
      no-data-label="Aún no se ha generado ningún Reporte"
    />
    <q-dialog v-model="mostrarPDF" persistent full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarPDF = false" />
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
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

import { URL_APICM } from 'src/composables/services'
import { validarUsuario } from 'src/composables/FuncionesG'
import { PDFKardex } from 'src/utils/pdfReportGenerator'

const usuario = validarUsuario()[0]
const $q = useQuasar()

// Variables de estado existentes
const fechaiR = ref('')
const fechafR = ref('')
const almacenR = ref(null)
const idproductoR = ref(null)
const almacenes = ref([])
const productosDisponibles = ref([])
const datosFiltrados = ref([])
const datosOriginales = ref([])
const reporteGenerado = ref(false)
const mostrarPDF = ref(false)
const pdfData = ref(null)

// NUEVA VARIABLE: Método de valoración
const metodoValoracion = ref('PEPS') // Valor por defecto

// Columns para la tabla
const columns = [
  { name: 'c', label: 'N°', field: 'c', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: (row) => cambiarFormatoFecha(row.fecha), align: 'left' },
  { name: 'descripcion', label: 'Descripcion', field: 'descripcion', align: 'left' },
  {
    name: 'canentrada',
    label: 'Cant. Entrada',
    field: (row) => Number(row.canentrada).toFixed(3),
    align: 'right',
  },
  {
    name: 'costoEntrada',
    label: 'Costo Ent.',
    field: (row) => Number(row.costoEntrada || 0).toFixed(3),
    align: 'right',
  },
  {
    name: 'ingreso',
    label: 'Ingreso Total',
    field: (row) => (row.ingreso ? Number(row.ingreso).toFixed(3) : ''),
    align: 'right',
  },
  {
    name: 'cansalida',
    label: 'Cant. Salida',
    field: (row) => Number(row.cansalida).toFixed(3),
    align: 'right',
  },
  {
    name: 'costoSalida',
    label: 'Costo Sal.',
    field: (row) => Number(row.costoSalida || 0).toFixed(3),
    align: 'right',
  },
  {
    name: 'egreso',
    label: 'Egreso Total',
    field: (row) => (row.egreso ? Number(row.egreso).toFixed(3) : ''),
    align: 'right',
  },
  {
    name: 'cansaldo',
    label: 'Cant. Saldo',
    field: (row) => Number(row.cansaldo).toFixed(3),
    align: 'right',
  },
  {
    name: 'costoSaldo',
    label: 'Costo Saldo',
    field: (row) => Number(row.costoSaldo || 0).toFixed(3),
    align: 'right',
  },
  {
    name: 'saldoT',
    label: 'Saldo Total',
    field: (row) => Number(row.saldoT).toFixed(3),
    align: 'right',
  },
]

const productosFiltrados = ref([])

// Funciones de filtro y validación existentes
const filterProductos = (val, update) => {
  if (val === '') {
    update(() => {
      productosFiltrados.value = productosDisponibles.value
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    productosFiltrados.value = productosDisponibles.value.filter(
      (v) =>
        v.descripcion.toLowerCase().indexOf(needle) > -1 ||
        v.codigo.toLowerCase().indexOf(needle) > -1,
    )
  })
}
const almacenesOptions = computed(() => {
  return [{ almacen: 'Todos los almacenes', idalmacen: 0 }, ...almacenes.value]
})
const almacenLabel = computed(() => {
  const selected = almacenes.value.find((a) => a.idalmacen === almacenR.value)
  return selected ? selected.almacen : 'N/A'
})
const productoLabel = computed(() => {
  const selected = productosDisponibles.value.find((p) => p.id === idproductoR.value)
  return selected ? `${selected.codigo} - ${selected.descripcion}` : 'N/A'
})
const validarFechas = () => {
  const fechaInicio = new Date(fechaiR.value)
  const fechaFin = new Date(fechafR.value)

  if (fechaInicio > fechaFin) {
    $q.notify({
      type: 'warning',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
      position: 'top',
    })
    return false
  }
  return true
}
const cambiarFormatoFecha = (fecha) => {
  if (!fecha) return ''
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

// Funciones de carga de datos existentes
async function listaAlmacenes() {
  console.log(usuario)
  try {
    const idempresa = usuario.empresa.idempresa
    console.log(idempresa)
    const endpoint = `${URL_APICM}api/listaResponsableAlmacen/${idempresa}`

    const { data } = await axios.get(endpoint)
    console.log(data)
    if (data && data.length > 0) {
      almacenes.value = data.filter((u) => u.idusuario === usuario.idusuario)
    } else {
      $q.notify({ type: 'negative', message: 'No se encontraron almacenes.' })
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar almacenes.' })
  }
}
async function listaProductosDisponibles() {
  try {
    const idempresa = usuario.empresa.idempresa
    const endpoint = `${URL_APICM}api/listaProductoAlmacen/${idempresa}`
    const { data } = await axios.get(endpoint)

    if (data && data.length > 0) {
      if (almacenR.value === 0) {
        productosDisponibles.value = data
      } else {
        productosDisponibles.value = data.filter((u) => u.idalmacen === almacenR.value)
      }
      productosFiltrados.value = productosDisponibles.value
    } else {
      productosDisponibles.value = []
      productosFiltrados.value = []
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar productos.' })
  }
}

// NUEVA FUNCIÓN PRINCIPAL para generar el reporte
async function generarReporte() {
  if (
    !fechaiR.value ||
    !fechafR.value ||
    !almacenR.value ||
    !idproductoR.value ||
    !metodoValoracion.value
  ) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, ingrese todos los datos necesarios.',
      position: 'top',
    })
    return
  }
  if (!validarFechas()) return

  try {
    const endpoint = `${URL_APICM}api/kardex/${fechaiR.value}/${fechafR.value}/${almacenR.value}/${idproductoR.value}`
    const { data } = await axios.get(endpoint)
    datosOriginales.value = data
    // Llamar a la función de cálculo basada en el método seleccionado
    calcularKardex()
    reporteGenerado.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el reporte.' })
  }
}

// NUEVA FUNCIÓN para procesar el Kardex
function calcularKardex() {
  if (!datosOriginales.value.length) {
    datosFiltrados.value = []
    return
  }
  switch (metodoValoracion.value) {
    case 'PEPS':
      datosFiltrados.value = calcularPEPS(datosOriginales.value)
      break
    case 'UEPS':
      datosFiltrados.value = calcularUEPS(datosOriginales.value)
      break
    case 'Promedio':
      datosFiltrados.value = calcularPromedio(datosOriginales.value)
      break
    default:
      datosFiltrados.value = []
  }
}

// FUNCIONES DE CÁLCULO DE MÉTODOS

function procesarMovimiento(
  key,
  index,
  stockTotal,
  costoTotal,
  movimientosPEPS,
  movimientosUEPS,
  metodo,
) {
  const code = {
    VE: 'VENTAS',
    MOV1: 'MOVIMIENTO+',
    MOV2: 'MOVIMIENTO-',
    MIC: 'COMPRAS',
    RO: 'ROBOS',
    MER: 'MERMAS',
    AN: 'ANULADO',
  }
  let movimiento = {
    c: index + 1,
    fecha: key.fecha,
    descripcion: code[key.codigo] || 'MOVIMIENTO DESCONOCIDO',
    canentrada: 0,
    cansalida: 0,
    costoEntrada: 0,
    costoSalida: 0,
    ingreso: 0,
    egreso: 0,
    cansaldo: 0,
    costoSaldo: 0,
    saldoT: 0,
  }

  if (index === 0) {
    // Saldo inicial
    movimiento.descripcion = 'SALDO INICIAL'
    movimiento.cansaldo = key.stock
    movimiento.costoEntrada = key.precio
    movimiento.costoSaldo = key.precio
    movimiento.saldoT = key.stock * key.precio
    stockTotal = key.stock
    costoTotal = key.stock * key.precio
    if (metodo === 'PEPS') {
      movimientosPEPS.push({ cantidad: key.stock, costo: key.precio })
    }
    if (metodo === 'UEPS') {
      movimientosUEPS.push({ cantidad: key.stock, costo: key.precio })
    }
  } else {
    const cantidadMovimiento = Math.abs(
      key.stock - (index > 0 ? datosOriginales.value[index - 1].stock : 0),
    )
    if (['VENTAS', 'MOVIMIENTO-', 'ROBOS', 'MERMAS', 'ANULADO'].includes(movimiento.descripcion)) {
      movimiento.cansalida = cantidadMovimiento
      stockTotal -= cantidadMovimiento
      if (metodo === 'PEPS') {
        let cantidadSalidaRestante = cantidadMovimiento
        let costoTotalSalida = 0
        while (cantidadSalidaRestante > 0 && movimientosPEPS.length > 0) {
          const lote = movimientosPEPS[0]
          const cantidadATomar = Math.min(cantidadSalidaRestante, lote.cantidad)
          costoTotalSalida += cantidadATomar * lote.costo
          lote.cantidad -= cantidadATomar
          cantidadSalidaRestante -= cantidadATomar
          if (lote.cantidad === 0) {
            movimientosPEPS.shift()
          }
        }
        movimiento.egreso = costoTotalSalida
        movimiento.costoSalida = costoTotalSalida / movimiento.cansalida
      } else if (metodo === 'UEPS') {
        let cantidadSalidaRestante = cantidadMovimiento
        let costoTotalSalida = 0
        while (cantidadSalidaRestante > 0 && movimientosUEPS.length > 0) {
          const lote = movimientosUEPS[movimientosUEPS.length - 1]
          const cantidadATomar = Math.min(cantidadSalidaRestante, lote.cantidad)
          costoTotalSalida += cantidadATomar * lote.costo
          lote.cantidad -= cantidadATomar
          cantidadSalidaRestante -= cantidadATomar
          if (lote.cantidad === 0) {
            movimientosUEPS.pop()
          }
        }
        movimiento.egreso = costoTotalSalida
        movimiento.costoSalida = costoTotalSalida / movimiento.cansalida
      } else if (metodo === 'Promedio') {
        movimiento.egreso = cantidadMovimiento * (costoTotal / (stockTotal + cantidadMovimiento))
        movimiento.costoSalida = costoTotal / (stockTotal + cantidadMovimiento)
      }
      costoTotal -= movimiento.egreso
    } else if (['MOVIMIENTO+', 'COMPRAS'].includes(movimiento.descripcion)) {
      movimiento.canentrada = cantidadMovimiento
      movimiento.ingreso = key.precio * cantidadMovimiento
      movimiento.costoEntrada = key.precio
      stockTotal += cantidadMovimiento
      costoTotal += movimiento.ingreso
      if (metodo === 'PEPS') {
        movimientosPEPS.push({ cantidad: cantidadMovimiento, costo: key.precio })
      }
      if (metodo === 'UEPS') {
        movimientosUEPS.push({ cantidad: cantidadMovimiento, costo: key.precio })
      }
    }
    movimiento.cansaldo = stockTotal
    movimiento.saldoT = costoTotal
    if (metodo === 'Promedio' && stockTotal > 0) {
      movimiento.costoSaldo = costoTotal / stockTotal
    } else if (metodo !== 'Promedio') {
      // El costo del saldo se calcula como el promedio ponderado de los lotes restantes
      let costoTotalSaldos = 0
      let cantidadTotalSaldos = 0
      const lotes = metodo === 'PEPS' ? movimientosPEPS : movimientosUEPS
      for (const lote of lotes) {
        costoTotalSaldos += lote.cantidad * lote.costo
        cantidadTotalSaldos += lote.cantidad
      }
      movimiento.costoSaldo = cantidadTotalSaldos > 0 ? costoTotalSaldos / cantidadTotalSaldos : 0
    }
  }
  return { movimiento, stockTotal, costoTotal, movimientosPEPS, movimientosUEPS }
}

function calcularPEPS(movimientos) {
  let kardex = []
  let movimientosPEPS = []
  let stockTotal = 0
  let costoTotal = 0

  movimientos.forEach((key, index) => {
    const {
      movimiento,
      stockTotal: nuevoStock,
      costoTotal: nuevoCosto,
      movimientosPEPS: nuevosMovimientosPEPS,
    } = procesarMovimiento(key, index, stockTotal, costoTotal, movimientosPEPS, [], 'PEPS')
    kardex.push(movimiento)
    stockTotal = nuevoStock
    costoTotal = nuevoCosto
    movimientosPEPS = nuevosMovimientosPEPS
  })

  return kardex
}

function calcularUEPS(movimientos) {
  let kardex = []
  let movimientosUEPS = []
  let stockTotal = 0
  let costoTotal = 0

  movimientos.forEach((key, index) => {
    const {
      movimiento,
      stockTotal: nuevoStock,
      costoTotal: nuevoCosto,
      movimientosUEPS: nuevosMovimientosUEPS,
    } = procesarMovimiento(key, index, stockTotal, costoTotal, [], movimientosUEPS, 'UEPS')
    kardex.push(movimiento)
    stockTotal = nuevoStock
    costoTotal = nuevoCosto
    movimientosUEPS = nuevosMovimientosUEPS
  })

  return kardex
}

function calcularPromedio(movimientos) {
  let kardex = []
  let stockTotal = 0
  let costoTotal = 0

  movimientos.forEach((key, index) => {
    const {
      movimiento,
      stockTotal: nuevoStock,
      costoTotal: nuevoCosto,
    } = procesarMovimiento(key, index, stockTotal, costoTotal, [], [], 'Promedio')
    kardex.push(movimiento)
    stockTotal = nuevoStock
    costoTotal = nuevoCosto
  })

  return kardex
}

// Watcher para recalcular el Kardex cuando el método cambia
watch(metodoValoracion, () => {
  if (reporteGenerado.value) {
    calcularKardex()
  }
})

// Función de carga de PDF existente
function cargarPDF() {
  if (datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No se ha generado ningún reporte para previsualizar.',
      position: 'top',
    })
    return
  }
  const doc = PDFKardex(
    datosFiltrados.value,
    almacenLabel.value,
    productoLabel.value,
    fechaiR.value,
    fechafR.value,
    metodoValoracion.value, // Pasar el método de valoración
  )
  pdfData.value = doc.output('dataurlstring')
  mostrarPDF.value = true
}

onMounted(() => {
  listaAlmacenes()
  listaProductosDisponibles()
})
</script>

<style scoped>
.invoice {
  position: relative;
  background-color: #fff;
  min-height: 680px;
  padding: 15px;
}

.invoice header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #c9c9c9;
}

.invoice .company-details {
  text-align: left;
}

.invoice .company-details img {
  border-radius: 50%;
}

.invoice .contacts {
  margin-bottom: 20px;
}
</style>
