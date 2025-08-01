<template>
  <q-page class="q-pa-md">
    <q-card-section class="">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-center">{{ formattedMonthYear }}</div>
        </div>
        <div class="col-auto">
          <q-btn flat round icon="chevron_left" @click="changeMonth(-1)" />
          <q-btn flat round icon="chevron_right" @click="changeMonth(1)" />
          <q-btn flat round icon="calendar_today" @click="showDateRangePicker = true" />
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right" class="q-pa-md">
      <q-btn color="primary" label="Exportar a PDF" @click="exportToPdf" icon="picture_as_pdf" />
      <q-btn
        color="green"
        label="Exportar a Excel"
        @click="exportToExcel"
        icon="insert_drive_file"
      />
    </q-card-actions>

    <q-card-section v-if="loading" class="text-center">
      <q-spinner-dots color="primary" size="3em" />
      <p>Cargando datos del Kardex...</p>
    </q-card-section>

    <q-card-section v-else-if="!kardexData.length" class="text-center">
      <q-icon name="info" size="3em" color="grey" />
      <p class="text-h6 q-mt-md">No hay datos para este mes.</p>
    </q-card-section>

    <q-card v-else>
      <q-table :rows="processedKardexData" :columns="columns" row-key="id">
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
    </q-card>

    <q-dialog v-model="showDateRangePicker">
      <q-card>
        <q-card-section>
          <div class="text-h6">Seleccionar Rango de Fechas</div>
        </q-card-section>

        <q-card-section>
          <q-date v-model="selectedDateRange" range />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Aceptar" color="primary" @click="applyDateRange" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { date } from 'quasar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { api } from 'src/boot/axios'
// --- State ---
const kardexData = ref([])
const loading = ref(true)
const currentDate = ref(new Date()) // Represents the month/year currently displayed
const showDateRangePicker = ref(false)
const selectedDateRange = ref({ from: '', to: '' }) // For manual date selection

// --- Computed Properties ---
const formattedMonthYear = computed(() => {
  return date.formatDate(currentDate.value, 'MMMM YYYY').toUpperCase()
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

    // Calculate valor_saldo based on current item's saldo and its price_unitario
    // This assumes the saldo is a 'snapshot' at that point with the given price_unitario
    const valorSaldo = item.saldo * item.precio_unitario

    // If you need a running accumulated value, you'd need to track it differently,
    // potentially making this an imperative loop instead of map if dependencies are complex.
    // For now, it's based on the individual item's saldo and price.

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

const applyDateRange = () => {
  if (selectedDateRange.value.from && selectedDateRange.value.to) {
    // When a range is selected, we'll set the current month to the start date of the range
    // and then refetch data. Note: The current month navigation will then be based on this.
    currentDate.value = new Date(selectedDateRange.value.from)
    // You might want to adjust fetchKardexData to use selectedDateRange directly if a
    // custom range is truly desired for display, rather than just forcing the month.
    // For simplicity, here we just set the month and refetch.
    fetchKardexData()
  }
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

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchKardexData()
})

watch(currentDate, () => {
  fetchKardexData()
})
</script>

<style lang="sass">
.kardex-table
  .q-table__container
    border-radius: 8px
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: #f5f5f5 // Light grey for header background
  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
  &.q-table--no-wrap thead tr:first-child th
    background-color: #f5f5f5 // Ensure sticky header has background

.text-positive
  color: #21ba45 // Quasar positive green

.text-negative
  color: #c10015 // Quasar negative red
</style>
