<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="row q-gutter-md items-center justify-between">
          <div class="text-h5 text-primary">Kardex de Inventario</div>

          <q-select
            v-model="metodoValorizacion"
            :options="opcionesMetodo"
            label="Método de Valorización"
            outlined
            dense
            style="width: 200px"
            emit-value
            map-options
          />

          <div class="row items-center q-gutter-sm">
            <q-btn flat round icon="event" color="primary">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="fecha" range @update:model-value="fetchMovimientos"></q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn flat round icon="chevron_left" @click="cambiarMes(-1)" />
            <span class="text-subtitle1">{{ displayDate }}</span>
            <q-btn flat round icon="chevron_right" @click="cambiarMes(1)" />
          </div>

          <div class="row q-gutter-sm">
            <q-btn icon="picture_as_pdf" label="PDF" color="red" @click="exportarPDF" />
            <q-btn icon="description" label="Excel" color="green" @click="exportarExcel" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="kardexData"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template v-slot:no-data>
            <div class="full-width row flex-center text-primary q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>No hay datos disponibles para el período seleccionado.</span>
            </div>
          </template>

          <template v-slot:body-cell-entrada="props">
            <q-td :props="props" class="text-green text-weight-bold">
              {{ props.value > 0 ? props.value : '' }}
            </q-td>
          </template>
          <template v-slot:body-cell-salida="props">
            <q-td :props="props" class="text-red text-weight-bold">
              {{ props.value > 0 ? props.value : '' }}
            </q-td>
          </template>
          <template v-slot:body-cell-precio_unitario="props">
            <q-td :props="props">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>
          <template v-slot:body-cell-valorEntrada="props">
            <q-td :props="props" class="text-green">
              {{ props.value > 0 ? formatCurrency(props.value) : '' }}
            </q-td>
          </template>
          <template v-slot:body-cell-valorSalida="props">
            <q-td :props="props" class="text-red">
              {{ props.value > 0 ? formatCurrency(props.value) : '' }}
            </q-td>
          </template>
          <template v-slot:body-cell-valorSaldo="props">
            <q-td :props="props" class="text-primary text-weight-medium">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-section>
        <div class="row justify-end q-gutter-xl q-pt-md">
          <div class="text-subtitle1">
            Stock Final:
            <span class="text-weight-bold">{{ resumenKardex.cantidadTotal }} unidades</span>
          </div>
          <div class="text-h6">
            Valor Total del Stock:
            <span class="text-weight-bold text-primary">{{
              formatCurrency(resumenKardex.valorTotal)
            }}</span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { date as qDate, useQuasar } from 'quasar'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
//import { api } from 'src/boot/axios'

// --- ESTADO REACTIVO ---
const $q = useQuasar()
const metodoValorizacion = ref('Promedio') // PEPS, UEPS, Promedio
const opcionesMetodo = [
  { label: 'Promedio Ponderado', value: 'Promedio' },
  { label: 'PEPS (FIFO)', value: 'PEPS' },
  { label: 'UEPS (LIFO)', value: 'UEPS' },
]
const movimientosOriginales = ref([])
const loading = ref(false)

// Estado para el manejo de fechas
const hoy = new Date()
const primerDiaMes = qDate.buildDate({ year: hoy.getFullYear(), month: hoy.getMonth() + 1, day: 1 })
const ultimoDiaMes = qDate.endOfDate(hoy, 'month')

const fecha = ref({
  from: qDate.formatDate(primerDiaMes, 'YYYY/MM/DD'),
  to: qDate.formatDate(ultimoDiaMes, 'YYYY/MM/DD'),
})

// --- DATOS SIMULADOS (reemplazar con llamada a la API) ---
const mockData = [
  {
    id: 1,
    fecha: '2025-07-01',
    detalle: 'Saldo Inicial',
    precio_unitario: 10.0,
    entrada: 100,
    salida: 0,
    saldo: 100,
  },
  {
    id: 2,
    fecha: '2025-07-05',
    detalle: 'Compra Lote A',
    precio_unitario: 12.0,
    entrada: 50,
    salida: 0,
    saldo: 150,
  },
  {
    id: 3,
    fecha: '2025-07-10',
    detalle: 'Venta 1',
    precio_unitario: 0,
    entrada: 0,
    salida: 80,
    saldo: 70,
  },
  {
    id: 4,
    fecha: '2025-07-15',
    detalle: 'Compra Lote B',
    precio_unitario: 15.0,
    entrada: 60,
    salida: 0,
    saldo: 130,
  },
  {
    id: 5,
    fecha: '2025-07-20',
    detalle: 'Venta 2',
    precio_unitario: 0,
    entrada: 0,
    salida: 100,
    saldo: 30,
  },
  {
    id: 6,
    fecha: '2025-07-25',
    detalle: 'Devolución Compra Lote A',
    precio_unitario: 12.0,
    entrada: 0,
    salida: 10,
    saldo: 20,
  },
]

// --- LÓGICA DE DATOS ---

// Simulación de llamada a la API (Axios)
// const fetchMovimientos2 = async () => {
//   loading.value = true
//   // En una app real, usarías Axios aquí:
//   const params = {
//     fecha_inicial: fecha.value.from,
//     fecha_final: fecha.value.to,
//   }
//   const response = await api.get('/api/kardex', { params })
//   movimientosOriginales.value = response.data

//   // Simulación con timeout
//   await new Promise((resolve) => setTimeout(resolve, 500))

//   // Filtramos el mock data según el rango de fecha para simular la API
//   const fechaInicio = qDate.extractDate(fecha.value.from, 'YYYY/MM/DD')
//   const fechaFin = qDate.extractDate(fecha.value.to, 'YYYY/MM/DD')

//   movimientosOriginales.value = mockData
//     .map((m) => ({ ...m, fechaObj: qDate.extractDate(m.fecha, 'YYYY-MM-DD') }))
//     .filter((m) =>
//       qDate.isBetweenDates(m.fechaObj, fechaInicio, fechaFin, {
//         inclusiveFrom: true,
//         inclusiveTo: true,
//       }),
//     )
//     .sort((a, b) => a.fechaObj - b.fechaObj || a.id - b.id)

//   loading.value = false
// }
const fetchMovimientos = async () => {
  loading.value = true

  // --- LÍNEAS A ELIMINAR O COMENTAR ---
  /*
  const params = {
    fecha_inicial: fecha.value.from,
    fecha_final: fecha.value.to,
  }
  const response = await api.get('/api/kardex', { params })
  movimientosOriginales.value = response.data
  */
  // ------------------------------------

  // Simulación con timeout (esto está bien)
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filtramos el mock data según el rango de fecha (esto es lo que queremos ejecutar)
  const fechaInicio = qDate.extractDate(fecha.value.from, 'YYYY/MM/DD')
  const fechaFin = qDate.extractDate(fecha.value.to, 'YYYY/MM/DD')

  movimientosOriginales.value = mockData
    .map((m) => ({ ...m, fechaObj: qDate.extractDate(m.fecha, 'YYYY-MM-DD') }))
    .filter((m) =>
      qDate.isBetweenDates(m.fechaObj, fechaInicio, fechaFin, {
        inclusiveFrom: true,
        inclusiveTo: true,
      }),
    )
    .sort((a, b) => a.fechaObj - b.fechaObj || a.id - b.id)

  loading.value = false
}
onMounted(() => {
  fetchMovimientos()
})

// --- LÓGICA DE CÁLCULO DEL KARDEX ---

const kardexData = computed(() => {
  if (!movimientosOriginales.value || movimientosOriginales.value.length === 0) {
    return []
  }

  const movimientos = JSON.parse(JSON.stringify(movimientosOriginales.value))

  switch (metodoValorizacion.value) {
    case 'PEPS':
      return calcularPEPS(movimientos)
    case 'UEPS':
      return calcularUEPS(movimientos)
    case 'Promedio':
    default:
      return calcularPromedioPonderado(movimientos)
  }
})

function calcularPromedioPonderado(movimientos) {
  let saldoValorTotal = 0
  let saldoCantidadTotal = 0

  return movimientos.map((mov) => {
    let valorEntrada = 0
    let valorSalida = 0

    if (mov.entrada > 0) {
      valorEntrada = mov.entrada * mov.precio_unitario
      saldoCantidadTotal += mov.entrada
      saldoValorTotal += valorEntrada
    } else if (mov.salida > 0) {
      const costoPromedio = saldoCantidadTotal > 0 ? saldoValorTotal / saldoCantidadTotal : 0
      valorSalida = mov.salida * costoPromedio
      saldoCantidadTotal -= mov.salida
      saldoValorTotal -= valorSalida
    }

    return {
      ...mov,
      valorEntrada,
      valorSalida,
      valorSaldo: saldoValorTotal,
    }
  })
}

function calcularPEPS(movimientos) {
  const lotes = [] // Cola (FIFO)
  let saldoValorTotal = 0

  return movimientos.map((mov) => {
    let valorEntrada = 0
    let valorSalida = 0

    if (mov.entrada > 0) {
      valorEntrada = mov.entrada * mov.precio_unitario
      lotes.push({ cantidad: mov.entrada, precio: mov.precio_unitario })
      saldoValorTotal += valorEntrada
    } else if (mov.salida > 0) {
      let cantidadASalir = mov.salida
      let costoSalidaTotal = 0

      while (cantidadASalir > 0 && lotes.length > 0) {
        const loteActual = lotes[0]
        const cantidadConsumida = Math.min(cantidadASalir, loteActual.cantidad)

        costoSalidaTotal += cantidadConsumida * loteActual.precio
        loteActual.cantidad -= cantidadConsumida
        cantidadASalir -= cantidadConsumida

        if (loteActual.cantidad === 0) {
          lotes.shift() // Saca el primer lote
        }
      }
      valorSalida = costoSalidaTotal
      saldoValorTotal -= valorSalida
    }

    return { ...mov, valorEntrada, valorSalida, valorSaldo: saldoValorTotal }
  })
}

function calcularUEPS(movimientos) {
  const lotes = [] // Pila (LIFO)
  let saldoValorTotal = 0

  return movimientos.map((mov) => {
    let valorEntrada = 0
    let valorSalida = 0

    if (mov.entrada > 0) {
      valorEntrada = mov.entrada * mov.precio_unitario
      lotes.push({ cantidad: mov.entrada, precio: mov.precio_unitario })
      saldoValorTotal += valorEntrada
    } else if (mov.salida > 0) {
      let cantidadASalir = mov.salida
      let costoSalidaTotal = 0

      while (cantidadASalir > 0 && lotes.length > 0) {
        const loteActual = lotes[lotes.length - 1]
        const cantidadConsumida = Math.min(cantidadASalir, loteActual.cantidad)

        costoSalidaTotal += cantidadConsumida * loteActual.precio
        loteActual.cantidad -= cantidadConsumida
        cantidadASalir -= cantidadConsumida

        if (loteActual.cantidad === 0) {
          lotes.pop() // Saca el último lote
        }
      }
      valorSalida = costoSalidaTotal
      saldoValorTotal -= valorSalida
    }

    return { ...mov, valorEntrada, valorSalida, valorSaldo: saldoValorTotal }
  })
}

// --- RESUMEN Y FORMATO ---
const resumenKardex = computed(() => {
  if (kardexData.value.length === 0) {
    return { cantidadTotal: 0, valorTotal: 0 }
  }
  const ultimoMovimiento = kardexData.value[kardexData.value.length - 1]
  return {
    cantidadTotal: ultimoMovimiento.saldo,
    valorTotal: ultimoMovimiento.valorSaldo,
  }
})

const formatCurrency = (value) => {
  if (typeof value !== 'number') return ''
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)
}

// --- NAVEGACIÓN POR FECHA ---
const displayDate = computed(() => {
  const from = qDate.formatDate(fecha.value.from, 'D MMMM YYYY', {
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  })
  const to = qDate.formatDate(fecha.value.to, 'D MMMM YYYY', {
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  })
  if (from === to) return from

  const fromDate = qDate.extractDate(fecha.value.from, 'YYYY/MM/DD')
  const toDate = qDate.extractDate(fecha.value.to, 'YYYY/MM/DD')

  if (
    fromDate.getFullYear() === toDate.getFullYear() &&
    fromDate.getMonth() === toDate.getMonth()
  ) {
    return qDate.formatDate(fromDate, 'MMMM YYYY', {
      months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
    })
  }

  return `${from} - ${to}`
})

function cambiarMes(offset) {
  const fechaActual = qDate.extractDate(fecha.value.from, 'YYYY/MM/DD')
  const nuevaFecha = qDate.addToDate(fechaActual, { months: offset })

  const primerDia = qDate.startOfDate(nuevaFecha, 'month')
  const ultimoDia = qDate.endOfDate(nuevaFecha, 'month')

  fecha.value = {
    from: qDate.formatDate(primerDia, 'YYYY/MM/DD'),
    to: qDate.formatDate(ultimoDia, 'YYYY/MM/DD'),
  }
  fetchMovimientos()
}

// --- DEFINICIÓN DE COLUMNAS PARA Q-TABLE ---
const columns = [
  { name: 'id', label: 'N°', field: 'id', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'left' },
  {
    name: 'precio_unitario',
    label: 'P. Unitario',
    field: 'precio_unitario',
    align: 'right',
    format: (val) => (val > 0 ? formatCurrency(val) : ''),
  },
  { name: 'entrada', label: 'Entrada (Cant.)', field: 'entrada', align: 'right' },
  { name: 'salida', label: 'Salida (Cant.)', field: 'salida', align: 'right' },
  { name: 'saldo', label: 'Saldo (Cant.)', field: 'saldo', align: 'right' },
  { name: 'valorEntrada', label: 'Valor Entrada', field: 'valorEntrada', align: 'right' },
  { name: 'valorSalida', label: 'Valor Salida', field: 'valorSalida', align: 'right' },
  { name: 'valorSaldo', label: 'Valor Saldo', field: 'valorSaldo', align: 'right' },
]

// --- FUNCIONES DE EXPORTACIÓN ---
function exportarPDF() {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Kardex de Inventario - Método: ${metodoValorizacion.value}`, 14, 15)
  doc.setFontSize(10)
  doc.text(`Período: ${displayDate.value}`, 14, 22)

  const head = [columns.map((col) => col.label)]
  const body = kardexData.value.map((row) =>
    columns.map((col) => {
      // Formatear valores para el PDF
      if (['precio_unitario', 'valorEntrada', 'valorSalida', 'valorSaldo'].includes(col.name)) {
        return row[col.field] > 0 ? formatCurrency(row[col.field]) : ''
      }
      return row[col.field] > 0 || typeof row[col.field] === 'string' ? row[col.field] : ''
    }),
  )

  doc.autoTable({
    startY: 28,
    head: head,
    body: body,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  })

  const finalY = doc.lastAutoTable.finalY || 28
  doc.setFontSize(12)
  doc.text(`Resumen:`, 14, finalY + 10)
  doc.text(
    `Cantidad Total en Stock: ${resumenKardex.value.cantidadTotal} unidades`,
    14,
    finalY + 16,
  )
  doc.text(
    `Valor Total del Stock: ${formatCurrency(resumenKardex.value.valorTotal)}`,
    14,
    finalY + 22,
  )

  doc.save(`Kardex_${metodoValorizacion.value}_${qDate.formatDate(Date.now(), 'YYYY-MM-DD')}.pdf`)
  $q.notify({ type: 'positive', message: 'PDF generado correctamente.' })
}

function exportarExcel() {
  // Preparar datos sin formato para Excel
  const dataToExport = kardexData.value.map((row) => ({
    'N°': row.id,
    Fecha: row.fecha,
    Detalle: row.detalle,
    'P. Unitario': row.precio_unitario,
    'Entrada (Cant.)': row.entrada,
    'Salida (Cant.)': row.salida,
    'Saldo (Cant.)': row.saldo,
    'Valor Entrada': row.valorEntrada,
    'Valor Salida': row.valorSalida,
    'Valor Saldo': row.valorSaldo,
  }))

  // Añadir fila de resumen
  dataToExport.push({}) // Fila vacía
  dataToExport.push({
    Detalle: 'TOTALES',
    'Saldo (Cant.)': resumenKardex.value.cantidadTotal,
    'Valor Saldo': resumenKardex.value.valorTotal,
  })

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kardex')
  XLSX.writeFile(
    wb,
    `Kardex_${metodoValorizacion.value}_${qDate.formatDate(Date.now(), 'YYYY-MM-DD')}.xlsx`,
  )
  $q.notify({ type: 'positive', message: 'Excel generado correctamente.' })
}
</script>

<style scoped>
/* Clases de Quasar como text-green y text-red ya hacen gran parte del trabajo.
   Se pueden añadir estilos adicionales si es necesario. */
.q-table th {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
