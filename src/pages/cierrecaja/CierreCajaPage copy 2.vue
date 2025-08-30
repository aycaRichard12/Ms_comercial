<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Cierre de Caja</div>
    <q-card class="q-mb-md" flat bordered>
      <q-card-section>
        <div class="text-subtitle1">Filtros de Búsqueda</div>
        <q-form @submit="cargarDatosIniciales">
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-3">
              <q-input
                v-model="fechaini"
                label="Fecha Inicial"
                type="date"
                outlined
                dense
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="fechafin"
                label="Fecha Final"
                type="date"
                outlined
                dense
                :rules="[
                  (val) => !!val || 'Campo requerido',
                  (val) => val >= fechaini || 'Fecha final debe ser mayor o igual',
                ]"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="model_puntoVenta"
                label="Punto de venta"
                :options="puntosVenta"
                dense
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>
            <div class="col-12 col-md-3 flex items-end">
              <q-btn
                color="primary"
                text-color="white"
                label="Generar Reporte"
                type="submit"
                :loading="isLoading"
                :disable="!fechaini || !fechafin || !model_puntoVenta"
              >
                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                  Cargando...
                </template>
              </q-btn>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-separator spaced />

    <q-banner v-if="!hasData && !isLoading" class="bg-warning text-white rounded-borders q-my-md">
      <template v-slot:avatar>
        <q-icon name="warning" color="white" />
      </template>
      No hay ventas registradas en este rango de fechas.
    </q-banner>

    <q-card v-if="hasData && !isLoading" flat bordered>
      <q-card-section>
        <q-tabs
          v-model="tipoCierre"
          class="text-teal"
          active-color="primary"
          indicator-color="primary"
          align="left"
          dense
        >
          <q-tab name="concepto" icon="pie_chart" label="Cierre por Concepto" />
          <q-tab name="arqueo" icon="attach_money" label="Cierre por Punto de Venta (Arqueo)" />
        </q-tabs>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="tipoCierre === 'concepto'">
        <div class="text-subtitle1 q-mb-md">Resumen de Ventas por Método de Pago</div>
        <q-table
          :rows="totalesPorMetodo"
          :columns="columnsMetodoPago"
          row-key="metodo"
          hide-bottom
          flat
          bordered
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="label" :props="props">
                {{ props.row.label }}
              </q-td>
              <q-td key="totalSistema" :props="props" class="text-right">
                {{ formatCurrency(props.row.totalSistema) }}
              </q-td>
              <q-td key="totalContado" :props="props" class="text-right">
                <q-input
                  v-model.number="props.row.totalContado"
                  type="number"
                  min="0"
                  dense
                  outlined
                  @update:model-value="calcularDiferenciaConcepto(props.row)"
                  step="0.01"
                />
              </q-td>
              <q-td key="diferencia" :props="props" class="text-right">
                <span :class="props.row.diferencia !== 0 ? 'text-negative' : 'text-positive'">
                  {{ formatCurrency(props.row.diferencia) }}
                </span>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom-row>
            <q-tr class="bg-grey-2 text-weight-bold">
              <q-td colspan="2">Total General</q-td>
              <q-td class="text-right">{{ formatCurrency(totalContadoConcepto) }}</q-td>
              <q-td class="text-right">
                <span :class="diferenciaConceptoTotal !== 0 ? 'text-negative' : 'text-positive'">
                  {{ formatCurrency(diferenciaConceptoTotal) }}
                </span>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>

      <q-card-section v-if="tipoCierre === 'arqueo'">
        <div class="text-subtitle1 q-mb-md">Arqueo de Caja por Denominación</div>
        <q-table
          :rows="denominaciones"
          :columns="columnsArqueo"
          row-key="valor"
          hide-bottom
          flat
          bordered
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="label" :props="props">
                {{ props.row.label }}
              </q-td>
              <q-td key="cantidad" :props="props">
                <q-input
                  v-model.number="props.row.cantidad"
                  type="number"
                  min="0"
                  dense
                  outlined
                  @update:model-value="calcularTotalesArqueo"
                  step="0.01"
                />
              </q-td>
              <q-td key="subtotal" :props="props" class="text-right">
                {{ formatCurrency(props.row.cantidad * props.row.valor) }}
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom-row>
            <q-tr class="bg-grey-2 text-weight-bold">
              <q-td colspan="2">Total Contado</q-td>
              <q-td class="text-right">{{ formatCurrency(totalContadoArqueo) }}</q-td>
            </q-tr>
          </template>
        </q-table>

        <div class="q-mt-md">
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle1">Total Sistema:</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-h6 text-green-8">{{
                formatCurrency(totalSistemaArqueo)
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle1">Diferencia:</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label
                class="text-h6"
                :class="diferenciaArqueo !== 0 ? 'text-negative' : 'text-positive'"
              >
                {{ formatCurrency(diferenciaArqueo) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-if="diferenciaArqueo !== 0 || diferenciaConceptoTotal !== 0"
          v-model="observacion"
          label="Observaciones (obligatorio si hay diferencia)"
          type="textarea"
          outlined
          :rules="[(val) => !!val || 'Este campo es obligatorio si hay diferencias']"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" color="negative" flat @click="resetForm" />
        <q-btn
          :label="tipoCierre === 'arqueo' ? 'Cerrar Caja (Arqueo)' : 'Cerrar Caja por Concepto'"
          :color="isCajaAbierta ? 'primary' : 'grey-5'"
          icon="save"
          @click="validarYEnviar"
          :disable="!isCajaAbierta || isLoading"
        >
          <q-tooltip v-if="!isCajaAbierta" :offset="[10, 10]">
            La caja debe estar abierta para poder cerrarla.
          </q-tooltip>
        </q-btn>
        <q-btn
          label="Imprimir"
          color="primary"
          flat
          icon="print"
          @click="imprimirReporte"
          :disable="!cierreRealizado"
        />
      </q-card-actions>
    </q-card>
  </q-page>

  <q-dialog v-model="showCierresPDF" persistent>
    <q-card style="width: 900px; max-width: 80vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Cierres Anteriores</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <iframe
          src="/pdfs/cierres-anteriores.pdf"
          style="width: 100%; height: 60vh"
          frameborder="0"
        ></iframe>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Descargar PDF" color="primary" icon="file_download" @click="descargarPDF" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCajaStore } from 'stores/caja'
// import { api } from 'src/boot/axios'
import { useCurrencyStore } from 'src/stores/currencyStore'

const $q = useQuasar()
const cajaStore = useCajaStore()
const currencyStore = useCurrencyStore()

const fechaini = ref('')
const fechafin = ref('')
const puntosVenta = ref([
  { label: 'Punto de Venta A', value: 'pv_a' },
  { label: 'Punto de Venta B', value: 'pv_b' },
])
const model_puntoVenta = ref(null)
const tipoCierre = ref('concepto')
const isLoading = ref(false)
const cierreRealizado = ref(false)
const observacion = ref('')
const showCierresPDF = ref(false)

const totalesPorMetodo = reactive([])
const denominaciones = reactive([
  { valor: 200, cantidad: 0, label: 'Billetes de 200' },
  { valor: 100, cantidad: 0, label: 'Billetes de 100' },
  { valor: 50, cantidad: 0, label: 'Billetes de 50' },
  { valor: 20, cantidad: 0, label: 'Billetes de 20' },
  { valor: 10, cantidad: 0, label: 'Billetes de 10' },
  { valor: 5, cantidad: 0, label: 'Monedas de 5' },
  { valor: 2, cantidad: 0, label: 'Monedas de 2' },
  { valor: 1, cantidad: 0, label: 'Monedas de 1' },
  { valor: 0.5, cantidad: 0, label: 'Monedas de 0.5' },
  { valor: 0.2, cantidad: 0, label: 'Monedas de 0.2' },
  { valor: 0.1, cantidad: 0, label: 'Monedas de 0.1' },
])

const totalSistemaArqueo = ref(0)
const totalContadoArqueo = computed(() => {
  return denominaciones.reduce((sum, d) => sum + d.cantidad * d.valor, 0)
})
const diferenciaArqueo = computed(() => totalContadoArqueo.value - totalSistemaArqueo.value)

const totalContadoConcepto = computed(() => {
  return totalesPorMetodo.reduce((sum, m) => sum + (m.totalContado || 0), 0)
})
const diferenciaConceptoTotal = computed(() => {
  return totalesPorMetodo.reduce((sum, m) => sum + m.diferencia, 0)
})

const isCajaAbierta = computed(() => cajaStore.isCajaAbierta)
const hasData = ref(false)

// Columns definitions for Q-table
const columnsMetodoPago = [
  { name: 'label', align: 'left', label: 'Método de Pago', field: 'label' },
  { name: 'totalSistema', align: 'right', label: 'Según Sistema', field: 'totalSistema' },
  { name: 'totalContado', align: 'right', label: 'Según Arqueo', field: 'totalContado' },
  { name: 'diferencia', align: 'right', label: 'Diferencia', field: 'diferencia' },
]

const columnsArqueo = [
  { name: 'label', align: 'left', label: 'Denominación', field: 'label' },
  { name: 'cantidad', align: 'left', label: 'Cantidad', field: 'cantidad' },
  { name: 'subtotal', align: 'right', label: 'Subtotal', field: 'subtotal' },
]

// Fictitious data for testing
const datosVentasFicticios = [
  {
    fecha: '2025-08-01',
    pv: 'pv_a',
    ingresos: 1500,
    egresos: 50,
    anuladas: 20,
    cotizaciones: 120,
    arqueo_x_pv: [
      { id: 'efectivo', metodo: 'Efectivo', monto: 800 },
      { id: 'qr', metodo: 'QR', monto: 300 },
      { id: 'transferencia', metodo: 'Transferencia', monto: 400 },
    ],
  },
  {
    fecha: '2025-08-02',
    pv: 'pv_b',
    ingresos: 2100,
    egresos: 100,
    anuladas: 50,
    cotizaciones: 50,
    arqueo_x_pv: [
      { id: 'efectivo', metodo: 'Efectivo', monto: 1000 },
      { id: 'debito', metodo: 'Débito', monto: 500 },
      { id: 'credito', metodo: 'Crédito', monto: 600 },
    ],
  },
]
// const cierresAnterioresFicticios = [
//   { id: 1, fecha: '2025-07-30', monto: 1250, puntoVenta: 'PV A' },
//   { id: 2, fecha: '2025-07-29', monto: 980, puntoVenta: 'PV B' },
// ]

// Methods
const formatCurrency = (value) => {
  const { simbolo, locale, current } = currencyStore.divisa
  if (typeof value !== 'number') return `${simbolo} 0.00`
  return value.toLocaleString(locale, { style: 'currency', currency: current })
}

const calcularTotalesArqueo = () => {
  // `totalContadoArqueo` y `diferenciaArqueo` son computed properties, no necesitan cálculo manual aquí.
}

const calcularDiferenciaConcepto = (metodo) => {
  metodo.diferencia = (metodo.totalContado || 0) - (metodo.totalSistema || 0)
}

const cargarDatosIniciales = async () => {
  isLoading.value = true
  hasData.value = false
  totalesPorMetodo.splice(0)

  // Simulate API call
  setTimeout(() => {
    const data = datosVentasFicticios.find(
      (d) =>
        d.pv === model_puntoVenta.value && d.fecha >= fechaini.value && d.fecha <= fechafin.value,
    )
    if (data) {
      hasData.value = true
      totalSistemaArqueo.value = data.arqueo_x_pv.find((m) => m.id === 'efectivo')?.monto || 0
      totalesPorMetodo.push(
        ...data.arqueo_x_pv.map((m) => ({
          metodo: m.id,
          label: m.metodo,
          totalSistema: m.monto,
          totalContado: m.monto,
          diferencia: 0,
        })),
      )
      // Recalculate initial differences
      totalesPorMetodo.forEach(calcularDiferenciaConcepto)
      // Reset arqueo denominations
      denominaciones.forEach((d) => (d.cantidad = 0))
    } else {
      hasData.value = false
    }
    isLoading.value = false
  }, 1000)
}

const validarYEnviar = () => {
  if (tipoCierre.value === 'arqueo' && diferenciaArqueo.value !== 0 && !observacion.value) {
    $q.notify({
      type: 'negative',
      message: 'Debe ingresar una observación si hay diferencia en el arqueo.',
    })
    return
  }
  if (
    tipoCierre.value === 'concepto' &&
    diferenciaConceptoTotal.value !== 0 &&
    !observacion.value
  ) {
    $q.notify({
      type: 'negative',
      message: 'Debe ingresar una observación si hay diferencias en los conceptos.',
    })
    return
  }

  $q.dialog({
    title: 'Confirmación de Cierre',
    message: `¿Estás seguro de cerrar la caja para el punto de venta ${model_puntoVenta.value}? Se registrará un total de ${formatCurrency(totalContadoConcepto.value)}.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    cerrarCaja()
  })
}

const cerrarCaja = () => {
  isLoading.value = true
  // Simulate API call to close the cash register
  setTimeout(() => {
    $q.notify({ type: 'positive', message: 'Cierre de caja registrado con éxito.' })
    cajaStore.setCajaAbierta(false)
    cierreRealizado.value = true
    isLoading.value = false
    imprimirReporte()
  }, 1500)
}

const imprimirReporte = () => {
  $q.notify({ type: 'info', message: 'Generando reporte de cierre...' })
  // Simulate showing a PDF viewer after successful closure
  setTimeout(() => {
    showCierresPDF.value = true
  }, 500)
}

const descargarPDF = () => {
  const link = document.createElement('a')
  link.href = '/pdfs/cierres-anteriores.pdf'
  link.setAttribute('download', 'cierres_anteriores.pdf')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const resetForm = () => {
  fechaini.value = ''
  fechafin.value = ''
  model_puntoVenta.value = null
  observacion.value = ''
  cierreRealizado.value = false
  hasData.value = false
  totalesPorMetodo.splice(0)
  denominaciones.forEach((d) => (d.cantidad = 0))
  cajaStore.setCajaAbierta(true) // Simulating re-opening for demo purposes
}

onMounted(() => {
  // Simulating a fresh state on component mount
  cajaStore.setCajaAbierta(true)
})
</script>

<style scoped>
.text-negative {
  color: #c10015;
}
.text-positive {
  color: #21ba45;
}
</style>
