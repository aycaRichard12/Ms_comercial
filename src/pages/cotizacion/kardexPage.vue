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
        </div>
        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <label for="metodo">Método de valoración *</label>
            <q-select
              dense
              outlined
              v-model="metodoValoracion"
              :options="metodosValoracion"
              id="metodo"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
              @update:model-value="recalcularKardex"
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
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

import { URL_APICM } from 'src/composables/services'
import { validarUsuario } from 'src/composables/FuncionesG'
import { PDFKardex } from 'src/utils/pdfReportGenerator'

const usuario = validarUsuario()[0]
const $q = useQuasar()

// Variables del formulario
const fechaiR = ref('')
const fechafR = ref('')
const almacenR = ref(null)
const idproductoR = ref(null)
const metodoValoracion = ref('PEPS') // Valor por defecto

// Opciones para el selector de métodos
const metodosValoracion = [
  { label: 'PEPS (Primeras Entradas, Primeras Salidas)', value: 'PEPS' },
  { label: 'UEPS (Últimas Entradas, Primeras Salidas)', value: 'UEPS' },
  { label: 'Promedio Ponderado', value: 'PROMEDIO' },
]

// Datos y estados
const almacenes = ref([])
const productosDisponibles = ref([])
const datosFiltrados = ref([])
const datosOriginales = ref([])
const movimientosOriginales = ref([]) // Almacena los movimientos sin procesar
const reporteGenerado = ref(false)
const mostrarPDF = ref(false)
const pdfData = ref(null)
const productosFiltrados = ref([])

// Columnas de la tabla
const columns = [
  { name: 'c', label: 'N°', field: 'c', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: (row) => cambiarFormatoFecha(row.fecha), align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  {
    name: 'canentrada',
    label: 'Cant. Entrada',
    field: (row) => Number(row.canentrada).toFixed(3),
    align: 'right',
  },
  {
    name: 'costoEntrada',
    label: 'Costo Unit. Entrada',
    field: (row) => Number(row.costoEntrada).toFixed(2),
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
    label: 'Costo Unit. Salida',
    field: (row) => Number(row.costoSalida).toFixed(2),
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
    label: 'Costo Unit. Saldo',
    field: (row) => Number(row.costoSaldo).toFixed(2),
    align: 'right',
  },
  {
    name: 'ingreso',
    label: 'Total Entrada',
    field: (row) => Number(row.ingreso).toFixed(2),
    align: 'right',
  },
  {
    name: 'egreso',
    label: 'Total Salida',
    field: (row) => Number(row.egreso).toFixed(2),
    align: 'right',
  },
  {
    name: 'saldoT',
    label: 'Total Saldo',
    field: (row) => Number(row.saldoT).toFixed(2),
    align: 'right',
  },
]

// Computed
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

// Métodos
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

async function listaAlmacenes() {
  try {
    const idempresa = usuario.empresa.idempresa
    const endpoint = `${URL_APICM}api/listaResponsableAlmacen/${idempresa}`

    const { data } = await axios.get(endpoint)
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

async function generarReporte() {
  if (!fechaiR.value || !fechafR.value || !almacenR.value || !idproductoR.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, ingrese todos los datos necesarios.',
      position: 'top',
    })
    return
  }

  if (!validarFechas()) {
    return
  }

  try {
    const endpoint = `${URL_APICM}api/kardex/${fechaiR.value}/${fechafR.value}/${almacenR.value}/${idproductoR.value}`
    const { data } = await axios.get(endpoint)

    // Guardar los datos originales para recalcular con diferentes métodos
    movimientosOriginales.value = data
    datosOriginales.value = data

    // Procesar según el método seleccionado
    procesarMovimientos()

    reporteGenerado.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el reporte.' })
  }
}

function procesarMovimientos() {
  if (!movimientosOriginales.value || movimientosOriginales.value.length === 0) return

  switch (metodoValoracion.value) {
    case 'PEPS':
      datosFiltrados.value = calcularPEPS(movimientosOriginales.value)
      break
    case 'UEPS':
      datosFiltrados.value = calcularUEPS(movimientosOriginales.value)
      break
    case 'PROMEDIO':
      datosFiltrados.value = calcularPromedio(movimientosOriginales.value)
      break
    default:
      datosFiltrados.value = calcularPEPS(movimientosOriginales.value)
  }
}

function recalcularKardex() {
  if (reporteGenerado.value) {
    procesarMovimientos()
  }
}

// Métodos de valoración de inventarios
function calcularPEPS(movimientos) {
  const code = {
    VE: 'VENTAS',
    MOV1: 'MOVIMIENTO+',
    MOV2: 'MOVIMIENTO-',
    MIC: 'COMPRAS',
    RO: 'ROBOS',
    MER: 'MERMAS',
    AN: 'ANULADO',
  }

  let kardex = []
  let inventario = [] // Array para manejar los lotes de inventario (PEPS)

  // Procesar cada movimiento
  movimientos.forEach((mov, index) => {
    const descripcion = code[mov.codigo] || 'MOVIMIENTO DESCONOCIDO'
    const esEntrada = ['MOVIMIENTO+', 'COMPRAS'].includes(descripcion)
    const esSalida = ['VENTAS', 'MOVIMIENTO-', 'ROBOS', 'MERMAS', 'ANULADO'].includes(descripcion)

    let registro = {
      c: index + 1,
      fecha: mov.fecha,
      descripcion: descripcion,
      canentrada: 0,
      costoEntrada: 0,
      cansalida: 0,
      costoSalida: 0,
      cansaldo: 0,
      costoSaldo: 0,
      ingreso: 0,
      egreso: 0,
      saldoT: 0,
    }

    if (index === 0) {
      // Primer registro es el saldo inicial
      inventario.push({
        cantidad: mov.stock,
        costo: mov.precio,
        fecha: mov.fecha,
      })

      registro.cansaldo = mov.stock
      registro.costoSaldo = mov.precio
      registro.saldoT = mov.stock * mov.precio
      registro.descripcion = 'SALDO INICIAL'
    } else {
      if (esEntrada) {
        // Agregar al inventario como nuevo lote (al final)
        const cantidad = Math.abs(mov.stock - getCantidadTotalInventario(inventario))
        inventario.push({
          cantidad: cantidad,
          costo: mov.precio,
          fecha: mov.fecha,
        })

        registro.canentrada = cantidad
        registro.costoEntrada = mov.precio
        registro.ingreso = cantidad * mov.precio
      } else if (esSalida) {
        // Sacar del inventario según PEPS (desde el principio)
        const cantidadNecesaria = Math.abs(mov.stock - getCantidadTotalInventario(inventario))
        let cantidadRestante = cantidadNecesaria
        let costoTotalSalida = 0

        while (cantidadRestante > 0 && inventario.length > 0) {
          const primerLote = inventario[0]
          const cantidadUsar = Math.min(primerLote.cantidad, cantidadRestante)

          costoTotalSalida += cantidadUsar * primerLote.costo
          cantidadRestante -= cantidadUsar
          primerLote.cantidad -= cantidadUsar

          if (primerLote.cantidad <= 0) {
            inventario.shift() // Eliminar el lote si ya no queda cantidad
          }
        }

        registro.cansalida = cantidadNecesaria
        registro.costoSalida = cantidadNecesaria > 0 ? costoTotalSalida / cantidadNecesaria : 0
        registro.egreso = costoTotalSalida
      }

      // Actualizar saldos
      registro.cansaldo = getCantidadTotalInventario(inventario)
      registro.costoSaldo = getCostoPromedioInventario(inventario)
      registro.saldoT = getValorTotalInventario(inventario)
    }

    kardex.push(registro)
  })

  return kardex
}

function calcularUEPS(movimientos) {
  const code = {
    VE: 'VENTAS',
    MOV1: 'MOVIMIENTO+',
    MOV2: 'MOVIMIENTO-',
    MIC: 'COMPRAS',
    RO: 'ROBOS',
    MER: 'MERMAS',
    AN: 'ANULADO',
  }

  let kardex = []
  let inventario = [] // Array para manejar los lotes de inventario (UEPS)

  // Procesar cada movimiento
  movimientos.forEach((mov, index) => {
    const descripcion = code[mov.codigo] || 'MOVIMIENTO DESCONOCIDO'
    const esEntrada = ['MOVIMIENTO+', 'COMPRAS'].includes(descripcion)
    const esSalida = ['VENTAS', 'MOVIMIENTO-', 'ROBOS', 'MERMAS', 'ANULADO'].includes(descripcion)

    let registro = {
      c: index + 1,
      fecha: mov.fecha,
      descripcion: descripcion,
      canentrada: 0,
      costoEntrada: 0,
      cansalida: 0,
      costoSalida: 0,
      cansaldo: 0,
      costoSaldo: 0,
      ingreso: 0,
      egreso: 0,
      saldoT: 0,
    }

    if (index === 0) {
      // Primer registro es el saldo inicial
      inventario.push({
        cantidad: mov.stock,
        costo: mov.precio,
        fecha: mov.fecha,
      })

      registro.cansaldo = mov.stock
      registro.costoSaldo = mov.precio
      registro.saldoT = mov.stock * mov.precio
      registro.descripcion = 'SALDO INICIAL'
    } else {
      if (esEntrada) {
        // Agregar al inventario como nuevo lote (al final)
        const cantidad = Math.abs(mov.stock - getCantidadTotalInventario(inventario))
        inventario.push({
          cantidad: cantidad,
          costo: mov.precio,
          fecha: mov.fecha,
        })

        registro.canentrada = cantidad
        registro.costoEntrada = mov.precio
        registro.ingreso = cantidad * mov.precio
      } else if (esSalida) {
        // Sacar del inventario según UEPS (desde el final)
        const cantidadNecesaria = Math.abs(mov.stock - getCantidadTotalInventario(inventario))
        let cantidadRestante = cantidadNecesaria
        let costoTotalSalida = 0

        while (cantidadRestante > 0 && inventario.length > 0) {
          const ultimoLote = inventario[inventario.length - 1]
          const cantidadUsar = Math.min(ultimoLote.cantidad, cantidadRestante)

          costoTotalSalida += cantidadUsar * ultimoLote.costo
          cantidadRestante -= cantidadUsar
          ultimoLote.cantidad -= cantidadUsar

          if (ultimoLote.cantidad <= 0) {
            inventario.pop() // Eliminar el lote si ya no queda cantidad
          }
        }

        registro.cansalida = cantidadNecesaria
        registro.costoSalida = cantidadNecesaria > 0 ? costoTotalSalida / cantidadNecesaria : 0
        registro.egreso = costoTotalSalida
      }

      // Actualizar saldos
      registro.cansaldo = getCantidadTotalInventario(inventario)
      registro.costoSaldo = getCostoPromedioInventario(inventario)
      registro.saldoT = getValorTotalInventario(inventario)
    }

    kardex.push(registro)
  })

  return kardex
}

function calcularPromedio(movimientos) {
  const code = {
    VE: 'VENTAS',
    MOV1: 'MOVIMIENTO+',
    MOV2: 'MOVIMIENTO-',
    MIC: 'COMPRAS',
    RO: 'ROBOS',
    MER: 'MERMAS',
    AN: 'ANULADO',
  }

  let kardex = []
  let inventario = {
    cantidad: 0,
    costoPromedio: 0,
    valorTotal: 0,
  }

  // Procesar cada movimiento
  movimientos.forEach((mov, index) => {
    const descripcion = code[mov.codigo] || 'MOVIMIENTO DESCONOCIDO'
    const esEntrada = ['MOVIMIENTO+', 'COMPRAS'].includes(descripcion)
    const esSalida = ['VENTAS', 'MOVIMIENTO-', 'ROBOS', 'MERMAS', 'ANULADO'].includes(descripcion)

    let registro = {
      c: index + 1,
      fecha: mov.fecha,
      descripcion: descripcion,
      canentrada: 0,
      costoEntrada: 0,
      cansalida: 0,
      costoSalida: 0,
      cansaldo: 0,
      costoSaldo: 0,
      ingreso: 0,
      egreso: 0,
      saldoT: 0,
    }

    if (index === 0) {
      // Primer registro es el saldo inicial
      inventario = {
        cantidad: mov.stock,
        costoPromedio: mov.precio,
        valorTotal: mov.stock * mov.precio,
      }

      registro.cansaldo = inventario.cantidad
      registro.costoSaldo = inventario.costoPromedio
      registro.saldoT = inventario.valorTotal
      registro.descripcion = 'SALDO INICIAL'
    } else {
      if (esEntrada) {
        const cantidadEntrada = Math.abs(mov.stock - inventario.cantidad)
        const valorEntrada = cantidadEntrada * mov.precio

        // Calcular nuevo costo promedio
        const nuevoValorTotal = inventario.valorTotal + valorEntrada
        const nuevaCantidad = inventario.cantidad + cantidadEntrada
        const nuevoCostoPromedio = nuevaCantidad > 0 ? nuevoValorTotal / nuevaCantidad : 0

        inventario = {
          cantidad: nuevaCantidad,
          costoPromedio: nuevoCostoPromedio,
          valorTotal: nuevoValorTotal,
        }

        registro.canentrada = cantidadEntrada
        registro.costoEntrada = mov.precio
        registro.ingreso = valorEntrada
      } else if (esSalida) {
        const cantidadSalida = Math.abs(mov.stock - inventario.cantidad)
        const valorSalida = cantidadSalida * inventario.costoPromedio

        inventario = {
          cantidad: inventario.cantidad - cantidadSalida,
          costoPromedio: inventario.costoPromedio, // El costo promedio no cambia en salidas
          valorTotal: inventario.valorTotal - valorSalida,
        }

        registro.cansalida = cantidadSalida
        registro.costoSalida = inventario.costoPromedio
        registro.egreso = valorSalida
      }

      // Actualizar saldos
      registro.cansaldo = inventario.cantidad
      registro.costoSaldo = inventario.costoPromedio
      registro.saldoT = inventario.valorTotal
    }

    kardex.push(registro)
  })

  return kardex
}

// Funciones auxiliares para manejo de inventario
function getCantidadTotalInventario(inventario) {
  return inventario.reduce((total, lote) => total + lote.cantidad, 0)
}

function getValorTotalInventario(inventario) {
  return inventario.reduce((total, lote) => total + lote.cantidad * lote.costo, 0)
}

function getCostoPromedioInventario(inventario) {
  const cantidadTotal = getCantidadTotalInventario(inventario)
  if (cantidadTotal === 0) return 0
  return getValorTotalInventario(inventario) / cantidadTotal
}

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
    metodoValoracion.value,
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
