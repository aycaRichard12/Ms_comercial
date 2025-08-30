<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-icon name="point_of_sale" size="xl" color="primary" class="q-mr-sm" />
        <div class="text-h4 text-primary text-weight-bold">Cierre de Caja</div>
      </div>
      <q-separator class="q-mb-lg" />

      <q-card class="q-mb-lg" bordered flat>
        <q-card-section>
          <div class="text-h6"><q-icon name="filter_alt" class="q-mr-sm" />Filtros de Búsqueda</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit="cargarDatosIniciales" @reset="onReset" class="q-gutter-md">
            <div class="row q-col-gutter-md items-end">
              <div class="col-12 col-md-3">
                <label for="fechaini">Fecha Inicial</label>
                <q-input
                  v-model="fechaini"
                  id="fechaini"
                  type="date"
                  outlined
                  dense
                  :rules="['date', (val) => !!val || 'Campo requerido']"
                />
              </div>

              <div class="col-12 col-md-3">
                <label for="fechafin">Fecha Final</label>
                <q-input
                  v-model="fechafin"
                  id="fechafin"
                  type="date"
                  outlined
                  dense
                  :rules="[
                    'date',
                    (val) => !!val || 'Campo requerido',
                    (val) => val >= fechaini || 'Debe ser mayor o igual a la fecha inicial',
                  ]"
                />
              </div>
              <div class="col-12 col-md-4">
                <label for="puntoventa">Punto de Venta</label>
                <q-select
                  v-model="model_puntoVenta"
                  :options="puntosVenta"
                  id="puntoventa"
                  dense
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Campo requerido']"
                  options-dense
                />
              </div>
              <div class="col-12 col-md-2 flex items-center q-gutter-sm">
                <q-btn
                  color="primary"
                  icon="search"
                  label="Generar"
                  type="submit"
                  class="full-width"
                  :loading="isLoading"
                />
                <q-btn
                  color="grey-7"
                  icon="refresh"
                  @click="onReset"
                  flat
                  round
                  title="Limpiar filtros"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <div v-if="isLoading" class="flex flex-center q-my-xl">
        <q-spinner-dots color="primary" size="3em" />
        <div class="q-ml-md text-grey-8">Cargando datos...</div>
      </div>

      <q-banner
        v-if="!isLoading && !datos.length && datosCargados"
        inline-actions
        class="text-white bg-amber-8 q-mb-lg"
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        No se encontraron ventas registradas en el rango de fechas y punto de venta seleccionado.
      </q-banner>

      <div v-if="!isLoading && datos.length" class="row q-col-gutter-lg">
        <div class="col-12 col-lg-8">
          <q-table
            title="Resumen de Ventas por Método de Pago"
            :rows="totalesPorMetodo"
            :columns="columnasTabla"
            row-key="metodo"
            flat
            bordered
            hide-bottom
            :rows-per-page-options="[0]"
          >
            <template v-slot:body-cell-totalContado="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.totalContado"
                  type="number"
                  min="0"
                  dense
                  outlined
                  @update:model-value="calcularDiferencia(props.row)"
                  step="0.01"
                  style="max-width: 150px; display: inline-block"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-diferencia="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.diferencia === 0 ? 'green-2' : 'red-2'"
                  :text-color="props.row.diferencia === 0 ? 'green-9' : 'red-9'"
                  class="text-weight-bold"
                >
                  {{ formatCurrency(props.row.diferencia) }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </div>

        <div class="col-12 col-lg-4">
          <q-card bordered flat>
            <q-card-section>
              <div class="text-h6"><q-icon name="summarize" class="q-mr-sm" />Resumen General</div>
            </q-card-section>
            <q-separator />
            <q-list separator>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="blue-1" text-color="blue-8" icon="receipt_long" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Total Sistema</q-item-label>
                </q-item-section>
                <q-item-section side class="text-weight-bold text-blue-8">
                  {{ formatCurrency(totalSistema) }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="green-8" icon="account_balance_wallet" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Total Arqueo</q-item-label>
                </q-item-section>
                <q-item-section side class="text-weight-bold text-green-8">
                  {{ formatCurrency(totalArqueo) }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-avatar
                    :color="totalDiferencia === 0 ? 'green-1' : 'red-1'"
                    :text-color="totalDiferencia === 0 ? 'green-8' : 'red-8'"
                    icon="swap_horiz"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Diferencia Total</q-item-label>
                </q-item-section>
                <q-item-section
                  side
                  class="text-weight-bold"
                  :class="totalDiferencia === 0 ? 'text-green-8' : 'text-red-8'"
                >
                  {{ formatCurrency(totalDiferencia) }}
                </q-item-section>
              </q-item>
            </q-list>
            <q-separator />
            <q-card-section v-if="totalDiferencia !== 0">
              <q-input
                v-model="observacion"
                label="Observaciones (obligatorio)"
                type="textarea"
                outlined
                dense
                :rules="[(val) => !!val || 'Debe justificar la diferencia']"
              />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                label="Cerrar Caja"
                color="primary"
                icon="lock"
                @click="confirmarCierre"
                :disable="!isCajaAbierta"
              >
                <q-tooltip v-if="!isCajaAbierta">La caja ya se encuentra cerrada.</q-tooltip>
              </q-btn>
              <q-btn
                label="Imprimir"
                color="secondary"
                icon="print"
                flat
                @click="imprimirReporte"
                :disable="!cierreRealizado"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="dialogoConfirmacion">
      <q-card style="width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6"><q-icon name="info" /> Confirmar Cierre de Caja</div>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <p>
            Se procederá a cerrar la caja para el
            <b>Punto de Venta {{ model_puntoVenta?.label }}</b> con fecha
            <b>{{ new Date().toLocaleDateString() }}</b
            >.
          </p>
          <q-list bordered separator>
            <q-item>
              <q-item-section>Total Sistema:</q-item-section>
              <q-item-section side class="text-weight-bold">{{
                formatCurrency(totalSistema)
              }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Total Declarado:</q-item-section>
              <q-item-section side class="text-weight-bold">{{
                formatCurrency(totalArqueo)
              }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Diferencia:</q-item-section>
              <q-item-section
                side
                class="text-weight-bold"
                :class="totalDiferencia === 0 ? 'text-green' : 'text-red'"
                >{{ formatCurrency(totalDiferencia) }}</q-item-section
              >
            </q-item>
          </q-list>
          <p class="q-mt-md">¿Desea continuar?</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn label="Confirmar Cierre" color="primary" @click="realizarCierre" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="visorPdf" full-width full-height>
      <q-card>
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Reporte de Cierres de Caja</div>
          <q-space />
          <q-btn icon="download" flat round dense @click="descargarPdf" title="Descargar PDF" />
          <q-btn icon="close" flat round dense v-close-popup title="Cerrar" />
        </q-card-section>
        <q-card-section class="q-pa-none" style="height: calc(100% - 50px)">
          <iframe
            :src="pdfUrl"
            frameborder="0"
            style="width: 100%; height: 100%"
            allowfullscreen
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
// Simulación de un store Pinia para el estado de la caja
const useCajaStore = () => ({
  isCajaAbierta: ref(true),
  setCajaAbierta: (val) => (useCajaStore().isCajaAbierta.value = val),
})
const $q = useQuasar()
const cajaStore = useCajaStore()
// --- DATOS DE ESTADO ---
const fechaini = ref(format(new Date(), 'yyyy-MM-dd'))
const fechafin = ref(format(new Date(), 'yyyy-MM-dd'))
const puntosVenta = ref([])
const model_puntoVenta = ref(null)
const isLoading = ref(false)
const datosCargados = ref(false)
const cierreRealizado = ref(false)
const observacion = ref('')
const dialogoConfirmacion = ref(false)
const visorPdf = ref(false)
const pdfUrl = ref('')
// Datos principales
const datos = ref([]) // Ventas individuales (datos crudos)
const totalesPorMetodo = ref([]) // Agrupados para la tabla
// --- DATOS FICTICIOS ---
const mockVentas = [
  {
    id: 1,
    fecha: '2025-08-12',
    puntoVenta: 1,
    metodoPago: 'efectivo',
    monto: 150.5,
  },
  { id: 2, fecha: '2025-08-12', puntoVenta: 1, metodoPago: 'qr', monto: 75.0 },
  { id: 3, fecha: '2025-08-13', puntoVenta: 1, metodoPago: 'efectivo', monto: 200.0 },
  { id: 4, fecha: '2025-08-13', puntoVenta: 2, metodoPago: 'transferencia', monto: 300.0 },
  { id: 5, fecha: '2025-08-14', puntoVenta: 1, metodoPago: 'debito', monto: 120.0 },
  { id: 6, fecha: '2025-08-14', puntoVenta: 1, metodoPago: 'venta-credito', monto: 500.0 },
]
const mockPuntosVenta = [
  { label: 'Sucursal Central', value: 1 },
  { label: 'Almacén Principal', value: 2 },
  { label: 'Punto Ferial', value: 3 },
]
// --- PROPIEDADES COMPUTADAS ---
const isCajaAbierta = computed(() => cajaStore.isCajaAbierta.value)
const totalSistema = computed(() =>
  totalesPorMetodo.value.reduce((sum, item) => sum + item.totalSistema, 0),
)
const totalArqueo = computed(() =>
  totalesPorMetodo.value.reduce((sum, item) => sum + item.totalContado, 0),
)
const totalDiferencia = computed(() =>
  totalesPorMetodo.value.reduce((sum, item) => sum + item.diferencia, 0),
)
// --- CONFIGURACIÓN DE LA TABLA ---
const columnasTabla = [
  {
    name: 'label',
    label: 'Método de Pago',
    align: 'left',
    field: 'label',
    sortable: true,
  },
  {
    name: 'totalSistema',
    label: 'Según Sistema',
    align: 'right',
    field: 'totalSistema',
    format: (val) => formatCurrency(val),
  },
  {
    name: 'totalContado',
    label: 'Según Arqueo',
    align: 'center',
    field: 'totalContado',
  },
  {
    name: 'diferencia',
    label: 'Diferencia',
    align: 'right',
    field: 'diferencia',
  },
]
// --- MÉTODOS ---
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$ 0.00'
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
onMounted(() => {
  cargarPuntosDeVenta()
})
const cargarPuntosDeVenta = () => {
  // Simulación de API
  setTimeout(() => {
    puntosVenta.value = mockPuntosVenta
    if (puntosVenta.value.length) {
      model_puntoVenta.value = puntosVenta.value[0].value
    }
  }, 500)
}
const cargarDatosIniciales = () => {
  if (!fechaini.value || !fechafin.value || !model_puntoVenta.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, complete todos los filtros.',
      position: 'top',
    })
    return
  }
  isLoading.value = true
  datosCargados.value = false
  // Simulación de llamada a API
  setTimeout(() => {
    const ventasFiltradas = mockVentas.filter(
      (v) =>
        v.fecha >= fechaini.value &&
        v.fecha <= fechafin.value &&
        v.puntoVenta === model_puntoVenta.value,
    )
    datos.value = ventasFiltradas
    // Procesar datos para la tabla
    const metodos = {
      efectivo: { label: 'Efectivo', total: 0 },
      qr: { label: 'QR', total: 0 },
      transferencia: { label: 'Transferencia', total: 0 },
      debito: { label: 'Débito', total: 0 },
      credito: { label: 'Crédito', total: 0 },
      'venta-credito': { label: 'Venta a Crédito', total: 0 },
    }
    ventasFiltradas.forEach((venta) => {
      if (metodos[venta.metodoPago]) {
        metodos[venta.metodoPago].total += venta.monto
      }
    })
    totalesPorMetodo.value = Object.keys(metodos).map((key) => ({
      metodo: key,
      label: metodos[key].label,
      totalSistema: metodos[key].total,
      totalContado: metodos[key].total, // Valor inicial igual al del sistema
      diferencia: 0,
    }))
    isLoading.value = false
    datosCargados.value = true
  }, 1500)
}
const calcularDiferencia = (metodo) => {
  metodo.diferencia = (metodo.totalContado || 0) - metodo.totalSistema
}
const onReset = () => {
  fechaini.value = format(new Date(), 'yyyy-MM-dd')
  fechafin.value = format(new Date(), 'yyyy-MM-dd')
  model_puntoVenta.value = puntosVenta.value.length ? puntosVenta.value[0].value : null
  datos.value = []
  totalesPorMetodo.value = []
  datosCargados.value = false
  cierreRealizado.value = false
}
const confirmarCierre = () => {
  if (totalDiferencia.value !== 0 && !observacion.value) {
    $q.notify({
      type: 'negative',
      message: 'Debe ingresar una observación si hay diferencias.',
      position: 'top',
    })
    return
  }
  dialogoConfirmacion.value = true
}
const realizarCierre = () => {
  dialogoConfirmacion.value = false
  $q.loading.show({ message: 'Cerrando caja...' })
  // Simulación de API POST para cerrar caja
  setTimeout(() => {
    $q.loading.hide()
    $q.notify({
      type: 'positive',
      message: '¡Caja cerrada exitosamente!',
      icon: 'check_circle',
      position: 'top',
    })
    cierreRealizado.value = true
    cajaStore.setCajaAbierta(false) // Actualiza el estado de la caja
    // Generar y mostrar el PDF
    generarYMostrarPdf()
  }, 2000)
}
const generarYMostrarPdf = () => {
  // En un caso real, aquí llamarías a tu backend para generar el PDF.
  // Para la simulación, creamos un PDF falso con jsPDF.
  // Nota: Deberías agregar jsPDF a tu proyecto (`npm install jspdf`)
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Historial de Cierres de Caja', 14, 22)
    doc.setFontSize(11)
    doc.text('Este es un reporte simulado de cierres anteriores.', 14, 30)
    // Datos ficticios para el historial
    const historial = [
      { fecha: '2025-08-13', pv: 'Sucursal Central', monto: 1250.75, dif: 0 },
      { fecha: '2025-08-12', pv: 'Sucursal Central', monto: 850.0, dif: -5.0 },
      { fecha: '2025-08-11', pv: 'Almacén Principal', monto: 2300.25, dif: 0 },
    ]
    let y = 40
    historial.forEach((cierre) => {
      doc.text(
        `Fecha: ${cierre.fecha} - PV: ${cierre.pv} - Monto: ${formatCurrency(
          cierre.monto,
        )} - Dif: ${formatCurrency(cierre.dif)}`,
        14,
        y,
      )
      y += 10
    })
    // Convertir el PDF a una URL para el iframe
    pdfUrl.value = doc.output('datauristring')
    visorPdf.value = true
  })
}
const descargarPdf = () => {
  // Lógica para descargar el PDF que se está mostrando
  const link = document.createElement('a')
  link.href = pdfUrl.value
  link.download = `reporte_cierres_${new Date().toISOString().split('T')[0]}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const imprimirReporte = () => {
  // Esta función ahora puede re-abrir el visor de PDF si ya se cerró
  if (pdfUrl.value) {
    visorPdf.value = true
  } else {
    $q.notify({ type: 'info', message: 'Primero debe realizar el cierre para generar el reporte.' })
  }
}
</script>

<style scoped>
.text-red-8 {
  color: #c10015;
}
.text-green-8 {
  color: #21ba45;
}
</style>
