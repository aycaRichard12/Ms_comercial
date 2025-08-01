<template>
  <q-page class="q-pa-md">
    <q-card-section>
      <div class="row">
        <q-inner-loading :showing="loading" />

        <div class="col-md-2 q-mr-md">
          <q-select
            v-model="almacenSeleccionado"
            :options="almacenOptions"
            label="Selecciona un almacén"
            emit-value
            map-options
            dense
            @update:model-value="cargarProductos"
          />
        </div>
        <div class="col-md-6 q-mr-md">
          <q-select
            v-if="!loading && !error"
            v-model="productoSeleccionado"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Producto *"
            :options="filteredProductos"
            dense
            @filter="filtrarProductos"
            clearable
          />
        </div>
        <div class="col-md-2 q-mr-md">
          <q-select
            v-model="tipoOperacion"
            :options="operacion"
            label="Seleccionar un tipo Kardex"
            emit-value
            map-options
            dense
            clearable
          />
        </div>
        <div class="col-md-1 q-mr-md">
          <q-btn
            :icon="tipoReporte ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="tipoReporte ? 'green' : 'grey'"
            @click="TipoFecha"
            title="CAMBIAR TIPO REPORTE"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-section class="">
      <div>
        <div class="row justify-center q-col-gutter-md" v-if="tipoReporte">
          <q-input type="date" v-model="fechai" label="Fecha Inicial*" class="col-12 col-md-4" />
          <q-input type="date" v-model="fechaf" label="Fecha Final*" class="col-12 col-md-4" />
        </div>
        <div style="display: flex; justify-content: center" v-else>
          <q-btn flat round icon="chevron_left" @click="changeMonth(-1)" />
          <div style="font-size: 15px" class="q-mt-sm">{{ formattedMonthYear }}</div>
          <q-btn flat round icon="chevron_right" @click="changeMonth(1)" />
        </div>
      </div>
      <div class="row justify-center q-mt-md">
        <div class="col-auto">
          <q-btn label="Generar reporte" color="primary" @click="generarReporte" class="q-mr-sm" />
        </div>
      </div>
    </q-card-section>
    <q-card-actions class="justify-between">
      <div>
        <q-btn
          color="primary"
          label="Vista Previa"
          @click="exportToPdf"
          icon="picture_as_pdf"
          class="q-mr-md"
        />
        <q-btn color="green" label="Exportar" @click="exportToExcel" icon="insert_drive_file" />
      </div>
    </q-card-actions>

    <q-card-section v-if="loading" class="text-center">
      <q-spinner-dots color="primary" size="3em" />
      <p>Cargando datos del Kardex...</p>
    </q-card-section>

    <q-card-section v-else-if="!kardexData.length" class="text-center">
      <q-icon name="info" size="3em" color="grey" />
      <p class="text-h6 q-mt-md">No hay datos para este mes.</p>
    </q-card-section>

    <div v-else>
      <q-table
        :rows="processedKardexData"
        :columns="columns"
        flat
        row-key="id"
        separator="horizontal"
      >
        <template v-slot:body-cell-entrada="props">
          <q-td :props="props">
            <span :class="{ 'text-positive': props.row.entrada > 0 }">
              {{ props.row.entrada }}
            </span>
          </q-td>
        </template>
        <template v-slot:body-cell-salida="props">
          <q-td :props="props">
            <span :class="{ 'text-negative': props.row.salida > 0 }">
              {{ props.row.salida }}
            </span>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { date } from 'quasar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { api } from 'src/boot/axios'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { useQuasar } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha, mes_a_Esp } from 'src/composables/FuncionesG'
import { useProductosDisponibleAlmacen } from 'src/stores/productosDisponibles'

const tipoReporte = ref(false)
const productosStore = useProductosDisponibleAlmacen()
const filteredProductos = ref([])
const productoSeleccionado = ref(null)
async function cargarProductos(idAlmacen) {
  if (!idAlmacen) return
  await productosStore.listaProductos(idAlmacen)
}
const { productos, loading, error } = storeToRefs(productosStore)

function filtrarProductos(val, update) {
  if (val === '') {
    update(() => {
      filteredProductos.value = productos.value
    })
    return
  }
  console.log(productos.value)
  update(() => {
    const filtro = val.toLowerCase()
    filteredProductos.value = productos.value.filter((prod) =>
      prod.label.toLowerCase().includes(filtro),
    )
  })
}

const today = new Date().toISOString().slice(0, 10)
const $q = useQuasar()
const almacenes = useAlmacenStore()
const almacenSeleccionado = ref(null)
const tipoOperacion = ref(null)
const idmd5 = ref('')
const operacion = [
  { value: 1, label: 'PEPS' },
  { value: 2, label: 'UEPS' },
  { value: 3, label: 'PROMEDIO' },
]
const almacenOptions = computed(() => {
  const options = []
  almacenes.almacenes.forEach((almacen) => {
    options.push({ label: almacen.almacen, value: Number(almacen.idalmacen) })
  })
  return options
})

// --- State ---
const kardexData = ref([])
const currentDate = ref(new Date()) // Represents the month/year currently displayed
const fechai = ref(today)
const fechaf = ref(today)
const TipoFecha = () => {
  tipoReporte.value = !tipoReporte.value
}
// --- Computed Properties ---
const formattedMonthYear = computed(() => {
  const { startDate, endDate } = getMonthStartEndDates(currentDate.value)

  console.log(startDate, endDate)
  return (
    mes_a_Esp(date.formatDate(currentDate.value, 'MMMM YYYY').toUpperCase()) +
    ' ' +
    cambiarFormatoFecha(startDate) +
    ' ' +
    cambiarFormatoFecha(endDate)
  )
})

const columns = [
  { name: 'id', label: 'N°', field: 'id', align: 'center' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'left' },
  {
    name: 'precio_unitario',
    label: 'Precio Unitario',
    field: 'precio_unitario',
    format: (val) => val.toFixed(2),
    align: 'right',
  },
  { name: 'entrada', label: 'Entrada', field: 'entrada', align: 'right' },
  { name: 'salida', label: 'Salida', field: 'salida', align: 'right' },
  { name: 'saldo', label: 'Saldo', field: 'saldo', align: 'right' },
  {
    name: 'valor_entrada',
    label: 'Valor Entrada',
    field: 'valor_entrada',
    format: (val) => val.toFixed(2),
    align: 'right',
  },
  {
    name: 'valor_salida',
    label: 'Valor Salida',
    field: 'valor_salida',
    format: (val) => val.toFixed(2),
    align: 'right',
  },
  {
    name: 'valor_saldo',
    label: 'Valor Saldo',
    field: 'valor_saldo',
    format: (val) => val.toFixed(2),
    align: 'right',
  },
]

const processedKardexData = computed(() => {
  return kardexData.value.map((item) => {
    const valorEntrada = item.entrada * item.precio_unitario
    const valorSalida = item.salida * item.precio_unitario

    const valorSaldo = item.saldo * item.precio_unitario

    return {
      ...item,
      valor_entrada: valorEntrada,
      valor_salida: valorSalida,
      valor_saldo: valorSaldo,
    }
  })
})

// --- Helper Functions for Dates ---
const getMonthStartEndDates = (targetDate) => {
  const startOfMonth = date.startOfDate(targetDate, 'month')
  const endOfMonth = date.endOfDate(targetDate, 'month')
  return {
    startDate: date.formatDate(startOfMonth, 'YYYY-MM-DD'),
    endDate: date.formatDate(endOfMonth, 'YYYY-MM-DD'),
  }
}

// --- API Calls ---
const fetchKardexData = async () => {
  loading.value = true
  const { startDate, endDate } = getMonthStartEndDates(currentDate.value)
  console.log(startDate, endDate)
  // Simulate API call delay and data
  try {
    //Replace with your actual API endpoint
    const response = await api.get('/api/kardex', {
      params: {
        startDate,
        endDate,
      },
    })
    kardexData.value = response.data

    // --- Simulated Data for demonstration ---
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
    if (
      currentDate.value.getMonth() === new Date().getMonth() &&
      currentDate.value.getFullYear() === new Date().getFullYear()
    ) {
      kardexData.value = [
        {
          id: 1,
          fecha: '2025-01-01',
          detalle: 'COM',
          precio_unitario: 10.0,
          entrada: 100,
          salida: 0,
          saldo: 100,
        },
        {
          id: 2,
          fecha: '2025-01-05',
          detalle: 'VEN',
          precio_unitario: 10.0,
          entrada: 0,
          salida: 20,
          saldo: 80,
        },
        {
          id: 3,
          fecha: '2025-01-10',
          detalle: 'COM',
          precio_unitario: 10.5,
          entrada: 50,
          salida: 0,
          saldo: 130,
        },
        {
          id: 4,
          fecha: '2025-01-15',
          detalle: 'VEN',
          precio_unitario: 10.5,
          entrada: 0,
          salida: 30,
          saldo: 100,
        },
      ]
    } else if (
      currentDate.value.getMonth() === (new Date().getMonth() - 1 + 12) % 12 &&
      currentDate.value.getFullYear() === new Date().getFullYear()
    ) {
      // Previous month
      kardexData.value = [
        {
          id: 5,
          fecha: '2024-12-01',
          detalle: 'COM',
          precio_unitario: 9.5,
          entrada: 70,
          salida: 0,
          saldo: 70,
        },
        {
          id: 6,
          fecha: '2024-12-10',
          detalle: 'VEN',
          precio_unitario: 9.5,
          entrada: 0,
          salida: 10,
          saldo: 60,
        },
      ]
    } else {
      kardexData.value = [] // No data for other months
    }
    // --- End Simulated Data ---
  } catch (error) {
    console.error('Error fetching Kardex data:', error)
    kardexData.value = [] // Clear data on error
    // Optionally show a user-friendly error message
  } finally {
    loading.value = false
  }
}

// --- Month Navigation ---
const changeMonth = (offset) => {
  currentDate.value = date.addToDate(currentDate.value, { month: offset })
}

// --- Export Functions ---
const exportToPdf = () => {
  const doc = new jsPDF()
  const tableColumn = columns.map((col) => col.label)
  const tableRows = processedKardexData.value.map((item) =>
    columns.map((col) => {
      let value = item[col.field]
      if (typeof col.format === 'function') {
        value = col.format(value)
      }
      return value
    }),
  )

  doc.text(`Kardex - ${formattedMonthYear.value}`, 14, 15)
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [2, 119, 189] }, // Quasar primary color
  })
  doc.save(`Kardex_${date.formatDate(currentDate.value, 'YYYY-MM')}.pdf`)
}

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(
    processedKardexData.value.map((item) => {
      // Prepare data for Excel, applying formatting for numerical values
      const row = {}
      columns.forEach((col) => {
        let value = item[col.field]
        if (typeof col.format === 'function') {
          value = col.format(value)
        }
        row[col.label] = value
      })
      return row
    }),
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kardex')
  XLSX.writeFile(wb, `Kardex_${date.formatDate(currentDate.value, 'YYYY-MM')}.xlsx`)
}
async function generarReporte() {
  const almacen = almacenSeleccionado.value
  if (!almacen) {
    $q.notify({
      type: 'negative',
      message: 'Selecciona un almacén',
      timeout: 5000,
      position: 'top',
    })
    return
  }
  const producto = productoSeleccionado.value
  if (!producto) {
    $q.notify({
      type: 'negative',
      message: 'Seleccione un Producto',
      timeout: 5000,
      position: 'top',
    })
    return
  }
  const operacion = tipoOperacion.value
  if (!operacion) {
    $q.notify({
      type: 'negative',
      message: 'Seleccione Tipo Opercacion',
      timeout: 5000,
      position: 'top',
    })
  }
  let fechaInicio
  let fechaFinal
  if (!tipoReporte.value) {
    const { startDate, endDate } = getMonthStartEndDates(currentDate.value)
    fechaInicio = startDate
    fechaFinal = endDate
  } else {
    fechaInicio = fechai.value
    fechaFinal = fechaf.value
  }
  console.log(almacen, producto?.value, operacion, fechaInicio, fechaFinal)
}
// --- Lifecycle Hooks ---
onMounted(() => {
  fetchKardexData()
  const storedMd5 = idusuario_md5()

  if (storedMd5) {
    idmd5.value = storedMd5
    almacenes.listaAlmacenes()
  } else {
    $q.notify({
      type: 'negative',
      message: 'ID MD5 no encontrado. Asegúrate de iniciar sesión correctamente.',
      timeout: 5000,
    })
  }

  if (almacenSeleccionado.value) {
    cargarProductos(almacenSeleccionado.value)
  }
})

watch(currentDate, () => {
  fetchKardexData()
})
</script>

<style lang="sass">


.text-positive
  color: #21ba45 // Quasar positive green

.text-negative
  color: #c10015 // Quasar negative red
</style>
