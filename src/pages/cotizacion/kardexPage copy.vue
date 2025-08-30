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
// Reemplazaría `funGeneral` con un composable o un archivo de utilidades
const usuario = validarUsuario()[0]
console.log(usuario)

const $q = useQuasar()

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
    name: 'cansalida',
    label: 'Cant. Salida',
    field: (row) => Number(row.cansalida).toFixed(3),
    align: 'right',
  },
  {
    name: 'cansaldo',
    label: 'Cant. Saldo',
    field: (row) => Number(row.cansaldo).toFixed(3),
    align: 'right',
  },
  { name: 'ingreso', label: 'Entrada', field: 'ingreso', align: 'right' },
  { name: 'egreso', label: 'Salida', field: 'egreso', align: 'right' },
  { name: 'saldoT', label: 'Saldo', field: 'saldoT', align: 'right' },
]

const productosFiltrados = ref([])

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

// const obtenerFechaActualDato = () => {
//   const date = new Date()
//   const year = date.getFullYear()
//   const month = String(date.getMonth() + 1).padStart(2, '0')
//   const day = String(date.getDate()).padStart(2, '0')
//   return `${year}-${month}-${day}`
// }

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
    console.log(data)
    datosOriginales.value = data
    datosFiltrados.value = procesarDatosKardex(data)
    reporteGenerado.value = true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al generar el reporte.' })
  }
}

function procesarDatosKardex(data) {
  const code = {
    VE: 'VENTAS',
    MOV1: 'MOVIMIENTO+',
    MOV2: 'MOVIMIENTO-',
    MIC: 'COMPRAS',
    RO: 'ROBOS',
    MER: 'MERMAS',
    AN: 'ANULADO',
  }
  let objkardex = []
  let totalfinal = 0
  let saldoAnterior = 0

  data.forEach((key, index) => {
    let canentrada = '0'
    let cansalida = '0'
    let ingreso = '0'
    let egreso = '0'
    const descripcion = code[key.codigo] || 'MOVIMIENTO DESCONOCIDO'

    if (index === 0) {
      totalfinal = key.stock * key.precio
      objkardex.push({
        c: 1,
        fecha: key.fecha,
        descripcion: 'SALDO INICIAL',
        canentrada: '0',
        cansalida: '0',
        cansaldo: key.stock,
        ingreso: '0',
        egreso: '0',
        saldoT: key.stock * key.precio,
      })
    } else {
      const cantidadMovimiento = Math.abs(key.stock - saldoAnterior)

      if (['VENTAS', 'MOVIMIENTO-', 'ROBOS', 'MERMAS', 'ANULADO'].includes(descripcion)) {
        cansalida = cantidadMovimiento
        egreso = key.precio * cantidadMovimiento
        totalfinal -= parseFloat(egreso)
      } else if (['MOVIMIENTO+', 'COMPRAS'].includes(descripcion)) {
        canentrada = cantidadMovimiento
        ingreso = key.precio * cantidadMovimiento
        totalfinal += parseFloat(ingreso)
      }
      objkardex.push({
        c: index + 1,
        fecha: key.fecha,
        descripcion: descripcion,
        canentrada: canentrada,
        cansalida: cansalida,
        cansaldo: key.stock,
        ingreso: ingreso,
        egreso: egreso,
        saldoT: totalfinal,
      })
    }
    saldoAnterior = key.stock
  })

  return objkardex
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
