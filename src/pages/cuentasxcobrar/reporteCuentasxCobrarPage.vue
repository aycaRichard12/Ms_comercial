<template>
  <q-page padding>
    <q-card-section class="row flex justify-between">
      <div class="text-h6 text-primary">
        {{ tipoReporte ? 'Reporte de Crédito al Corte' : 'Reporte de Crédito en Periodo' }}
      </div>
      <q-btn
        :icon="tipoReporte ? 'toggle_on' : 'toggle_off'"
        dense
        flat
        :color="tipoReporte ? 'green' : 'grey'"
        @click="cambiarTipoReporte"
        title="CAMBIAR TIPO REPORTE"
      />
    </q-card-section>

    <!-- Fechas y botón generar -->

    <q-form>
      <q-card-section class="row q-col-gutter-x-md flex justify-center">
        <div v-if="!tipoReporte" class="col-12 col-md-4">
          <label for="fechaini">Fecha Inicio</label>
          <q-input
            type="date"
            v-model="startDate"
            id="fechaini"
            dense
            outlined
            :rules="[(val) => !!val || 'Seleccione una fecha válida']"
          >
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <label for="fechafin">Fecha Fin</label>
          <q-input
            type="date"
            v-model="endDate"
            dense
            outlined
            id="fechafin"
            :rules="!tipoReporte ? [validateEndDate] : ''"
          >
          </q-input>
        </div>
      </q-card-section>
      <div class="row q-col-gutter-x-md flex justify-center">
        <div class="col-12 col-md-4 flex justify-center">
          <q-btn
            label="Generar Reporte"
            color="primary"
            @click="generateReport"
            :loading="loading"
            :disable="!idmd5 || !startDate || !endDate"
          />
        </div>
      </div>
    </q-form>

    <!-- Sección de filtros -->
    <q-card-section>
      <q-expansion-item label="Filtros avanzados" icon="filter_list">
        <!-- Indicador de filtros activos -->

        <div class="row q-col-gutter-x-md">
          <!-- Filtro por almacén -->
          <div class="col-12 col-md-3">
            <label for="almacen">Filtrar por Almacén</label>
            <q-select
              v-model="selectedAlmacen"
              :options="almacenOptions"
              id="almacen"
              dense
              outlined
              emit-value
              map-options
              @update:model-value="updateFilter('almacen', $event !== 0)"
            />
          </div>

          <!-- Filtro por cliente -->
          <div class="col-12 col-md-3">
            <label for="cliente">Razon social</label>
            <q-select
              v-model="clienteStore.clienteSeleccionado"
              use-input
              input-debounce="300"
              :options="clientesFiltrados"
              @filter="filterClientes"
              id="cliente"
              dense
              outlined
              option-label="displayName"
              :loading="loadingClientes"
              :disable="loadingClientes"
              clearable
              @update:model-value="updateFilter('cliente', !!$event)"
              @clear="resetClientSelection"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      loadingClientes
                        ? 'Cargando clientes...'
                        : clienteStore.clientes.length === 0
                          ? 'No hay clientes disponibles'
                          : 'No se encontraron coincidencias'
                    }}
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.codigo }} - {{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.nombrecomercial }}</q-item-label>
                    <q-item-label caption
                      >{{ scope.opt.ciudad }} - {{ scope.opt.nit }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Filtro por sucursal -->
          <div class="col-12 col-md-3">
            <label for="sucursal">Seleccionar sucursal</label>
            <q-select
              v-if="clienteStore.clienteSeleccionado"
              v-model="clienteStore.sucursalSeleccionada"
              :options="clienteStore.sucursales"
              option-label="nombre"
              id="sucursal"
              dense
              outlined
              :loading="loadingSucursales"
              :disable="!clienteStore.sucursales.length || loadingSucursales"
              clearable
              @update:model-value="updateFilter('sucursal', !!$event)"
              @clear="resetSucursalSelection"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      loadingSucursales ? 'Cargando sucursales...' : 'No hay sucursales disponibles'
                    }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <!-- Filtro por estado (nuevo) -->
          <div class="col-12 col-md-3">
            <label for="estado">Estado crédito</label>
            <q-select
              v-model="selectedEstado"
              :options="estadoOptions"
              id="estado"
              dense
              outlined
              emit-value
              map-options
              clearable
              @update:model-value="updateFilter('estado', !!$event)"
            />
          </div>

          <!-- Botones de acción -->
          <!-- <div class="col-12 row justify-end q-mt-sm">
            <q-btn label="Aplicar Filtros" color="primary" @click="applyFilters" class="q-mr-sm" />
            <q-btn label="Limpiar Todo" color="negative" outline @click="resetAllFilters" />
          </div> -->
        </div>
      </q-expansion-item>
    </q-card-section>

    <!-- Mensajes de estado -->
    <q-card-section v-if="!idmd5">
      <q-banner dense rounded class="bg-red-2 text-red-10">
        <template v-slot:avatar>
          <q-icon name="warning" color="red" />
        </template>
        No se encontró el ID MD5 en el almacenamiento local. Asegúrate de que esté guardado bajo la
        clave 'md5'.
      </q-banner>
    </q-card-section>

    <q-card-section v-if="reportError">
      <q-banner dense rounded class="bg-red-2 text-red-10">
        <template v-slot:avatar>
          <q-icon name="error" color="red" />
        </template>
        Error al cargar el reporte: {{ reportError }}
      </q-banner>
    </q-card-section>

    <!-- Tabla de resultados -->
    <q-card-section v-if="filteredReportData.length > 0">
      <div class="row justify-between items-center">
        <div class="text-subtitle1">Mostrando {{ filteredReportData.length - 1 }} registros</div>
        <q-btn
          icon="mdi-microsoft-excel"
          label="Exportar"
          color="secondary"
          @click="exportToXLSX"
        />
        <q-btn
          label="Imprimir Reporte"
          color="info"
          icon="print"
          @click="printFilteredTable"
          :disable="reportData.length === 0"
          class="q-ma-lg"
        />
      </div>

      <q-table
        title="Creditos"
        :rows="filteredReportData"
        :columns="columns"
        row-key="idcredito"
        flat
        bordered
        :loading="loading"
        :pagination="pagination"
        no-data-label="No hay datos para mostrar"
        class="sticky-header-table"
        @request="onTableRequest"
      >
        <!-- format: (val) => (val ? Number(val).toFixed(2) : '0.00'), -->
        <!-- Columnas personalizadas -->

        <template v-slot:body-cell-saldo="props">
          <q-td :props="props">
            {{ props.row.montoventa - props.row.totalcobrado }}
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props" v-if="props.row.estado !== 5">
            <q-badge :color="colorEstado[Number(props.row.estado)]">{{
              keyEstado[Number(props.row.estado)]
            }}</q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-moradias="props">
          <q-td :props="props">
            {{
              props.row.fechalimite && Number(props.row.estado) === 3
                ? Math.max(obtenerDias(props.row.fechalimite), 0)
                : 0
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-totalanulado="props">
          <q-td :props="props">
            {{
              Number(props.row.estado) === 4 ? decimas(redondear(parseFloat(props.row.saldo))) : 0.0
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-totalatrasado="props">
          <q-td :props="props">
            {{
              Number(props.row.estado) === 3 ? decimas(redondear(parseFloat(props.row.saldo))) : 0.0
            }}
          </q-td>
        </template>

        <!-- Fila de totales con estilo diferente -->
      </q-table>
    </q-card-section>

    <q-card-section v-else-if="!loading && !reportError && idmd5">
      <q-banner dense rounded class="bg-blue-grey-2 text-blue-grey-10">
        <template v-slot:avatar>
          <q-icon name="info" color="blue-grey" />
        </template>
        No hay datos disponibles para el rango de fechas y filtros seleccionados.
      </q-banner>
    </q-card-section>
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
import { ref, onMounted, computed, watch } from 'vue'
import { date, useQuasar } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, decimas, redondear } from 'src/composables/FuncionesG'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { useClienteStore } from 'stores/cliente'
import { PDFreporteCreditos } from 'src/utils/pdfReportGenerator'
import { exportToXLSX_Reporte_Creditos } from 'src/utils/XCLReportImport'
const mostrarModal = ref(false)
const pdfData = ref(null)
const $q = useQuasar()
const almacenes = useAlmacenStore()
const clienteStore = useClienteStore()
const tipoReporte = ref(false)
// --- Variables reactivas ---
const idmd5 = ref('')
const startDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const endDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const reportData = ref([])
const loading = ref(false)
const reportError = ref(null)
const selectedAlmacen = ref(0)
const selectedEstado = ref(null)
const loadingClientes = ref(false)
const loadingSucursales = ref(false)
const searchCliente = ref('')

// Configuración de paginación
const pagination = ref({
  sortBy: 'fechaventa',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
})

// Filtros activos
const activeFilters = ref({
  almacen: false,
  cliente: false,
  sucursal: false,
  estado: false,
})

// Definición de estados
const keyEstado = {
  1: 'Activo',
  2: 'Finalizado',
  3: 'Atrasado',
  4: 'Anulado',
  5: '',
}

const colorEstado = {
  1: 'green',
  2: 'blue',
  3: 'orange',
  4: 'red',
  5: '',
}

const estadoOptions = [
  { label: 'Activo', value: 1 },
  { label: 'Finalizado', value: 2 },
  { label: 'Atrasado', value: 3 },
  { label: 'Anulado', value: 4 },
]

// --- Definición de columnas ---
const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'right', sortable: true },
  {
    name: 'fechaventa',
    align: 'center',
    label: 'Fecha Crédito',
    field: 'fechaventa',
    format: (val) => (val ? cambiarFormatoFecha(val) : ''),
    sortable: true,
  },
  {
    name: 'razonsocial',
    align: 'left',
    label: 'Cliente',
    field: 'razonsocial',
    sortable: true,
  },
  {
    name: 'sucursal',
    align: 'left',
    label: 'Sucursal',
    field: 'sucursal',
    sortable: true,
  },
  {
    name: 'fechalimite',
    align: 'center',
    label: 'Fecha Límite',
    field: 'fechalimite',
    format: (val) => (val ? cambiarFormatoFecha(val) : ''),
    sortable: true,
  },
  {
    name: 'ncuotas',
    align: 'center',
    label: 'Cuotas',
    field: 'ncuotas',
    sortable: true,
  },
  {
    name: 'cuotaspagadas',
    align: 'center',
    label: 'Cuotas Pagadas',
    field: 'cuotaspagadas',
    format: (val) => (val ? val : '0'),
    sortable: true,
  },
  {
    name: 'valorcuotas',
    align: 'right',
    label: 'Valor Cuota',
    field: 'valorcuotas',
    format: (val) => (val ? Number(val).toFixed(2) : '0.00'),
    sortable: true,
  },
  {
    name: 'montoventa',
    align: 'right',
    label: 'Monto Venta',
    field: 'montoventa',
    format: (val) => (val ? Number(val).toFixed(2) : '0.00'),
    sortable: true,
  },
  {
    name: 'totalcobrado',
    align: 'right',
    label: 'Total Cobrado',
    field: 'totalcobrado',
    format: (val) => (val ? Number(val).toFixed(2) : '0.00'),
    sortable: true,
  },
  {
    name: 'saldo',
    align: 'right',
    label: 'Saldo',
    field: 'saldo',

    sortable: true,
  },
  {
    name: 'totalatrasado',
    align: 'right',
    label: 'Total Atrasado',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'totalanulado',
    align: 'right',
    label: 'Total Anulado',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'moradias',
    align: 'right',
    label: 'Días Mora',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'estado',
    align: 'center',
    label: 'Estado',
    field: 'estado',
    sortable: true,
  },
]
const validateEndDate = (val) => {
  if (!val) return 'Seleccione una fecha válida'
  if (startDate.value && val < startDate.value) {
    return 'La fecha fin no puede ser menor que la fecha inicio'
  }
  return true
}

const cambiarTipoReporte = () => {
  tipoReporte.value = !tipoReporte.value
}
const printFilteredTable = () => {
  const doc = PDFreporteCreditos(filteredReportData.value, startDate.value, endDate.value)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// --- Computed properties ---
const almacenOptions = computed(() => {
  const options = [{ label: 'Todos los almacenes', value: 0 }]
  almacenes.almacenes.forEach((almacen) => {
    options.push({ label: almacen.almacen, value: Number(almacen.idalmacen) })
  })
  return options
})

const clientesFiltrados = computed(() => {
  if (!searchCliente.value) return clienteStore.clientes
  return clienteStore.clientes.filter((c) =>
    `${c.codigo}${c.nombre}${c.nombrecomercial}${c.ciudad}${c.nit}`
      .toLowerCase()
      .includes(searchCliente.value),
  )
})

const filteredReportData = computed(() => {
  let data = [...reportData.value]

  // Aplicar filtros solo si están activos
  if (activeFilters.value.almacen && selectedAlmacen.value !== 0) {
    data = data.filter((row) => Number(row.idalmacen) === selectedAlmacen.value)
  }

  if (activeFilters.value.cliente && clienteStore.clienteSeleccionado) {
    data = data.filter(
      (row) => Number(row.idcliente) === Number(clienteStore.clienteSeleccionado.id),
    )
  }

  if (activeFilters.value.sucursal && clienteStore.sucursalSeleccionada) {
    data = data.filter(
      (row) => Number(row.idsucursal) === Number(clienteStore.sucursalSeleccionada.id),
    )
  }

  if (activeFilters.value.estado && selectedEstado.value) {
    data = data.filter((row) => Number(row.estado) === Number(selectedEstado.value))
  }

  return processDataWithTotals(data)
})

// --- Funciones ---
const obtenerDias = (fechalimite) => {
  const fecha1 = Math.floor(new Date().getTime() / (1000 * 3600 * 24))
  const fecha2 = Math.floor(new Date(fechalimite).getTime() / (1000 * 3600 * 24))
  return fecha1 - fecha2
}

const processDataWithTotals = (data) => {
  if (data.length === 0) return []

  const numberedData = data.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))

  const totales = {
    numero: '',
    fechaventa: '',
    razonsocial: '',
    sucursal: '',
    fechalimite: '',
    ncuotas: '',
    cuotaspagadas: 'TOTAL:',
    valorcuotas: numberedData.reduce((sum, u) => sum + Number(u.valorcuotas || 0), 0),
    montoventa: numberedData.reduce((sum, u) => sum + Number(u.montoventa || 0), 0),
    totalcobrado: numberedData.reduce((sum, u) => sum + Number(u.totalcobrado || 0), 0),
    saldo: numberedData.reduce((sum, u) => sum + Number(u.saldo || 0), 0),
    totalatrasado: numberedData
      .filter((u) => Number(u.estado) === 3)
      .reduce((sum, u) => sum + Number(u.saldo || 0), 0),
    totalanulado: numberedData
      .filter((u) => Number(u.estado) === 4)
      .reduce((sum, u) => sum + Number(u.saldo || 0), 0),
    moradias: '',
    estado: 5,
  }

  return [...numberedData, totales]
}

const filterClientes = (val, update) => {
  update(() => {
    searchCliente.value = val.toLowerCase()
  })
}

const updateFilter = (filterName, isActive) => {
  activeFilters.value[filterName] = isActive
}

// const applyFilters = () => {
//   // Forzar recálculo al cambiar filtros
//   filteredReportData.value = [...filteredReportData.value]
// }

const resetClientSelection = () => {
  clienteStore.clienteSeleccionado = null
  clienteStore.sucursalSeleccionada = null
  activeFilters.value.cliente = false
  activeFilters.value.sucursal = false
}

const resetSucursalSelection = () => {
  clienteStore.sucursalSeleccionada = null
  activeFilters.value.sucursal = false
}

// const resetAllFilters = () => {
//   selectedAlmacen.value = 0
//   selectedEstado.value = null
//   resetClientSelection()
//   applyFilters()
// }

const generateReport = async () => {
  if (!idmd5.value) {
    $q.notify({
      type: 'negative',
      message: 'No hay ID MD5 disponible para generar el reporte.',
    })
    return
  }

  if (!startDate.value || !endDate.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, selecciona un rango de fechas.',
    })
    return
  }

  loading.value = true
  reportError.value = null
  reportData.value = []

  try {
    //{{ tipoReporte ? 'Reporte de Crédito al Corte' : 'Reporte de Crédito en Periodo' }}
    let point = ''
    if (tipoReporte.value) {
      point = `reporteCreditosAlCorte/${idmd5.value}/${startDate.value}/${endDate.value}`
    } else {
      point = `reportecreditos/${idmd5.value}/${startDate.value}/${endDate.value}`
    }
    const response = await api.get(point)

    if (response.data.estado === 'exito') {
      reportData.value = response.data.data
      pagination.value.rowsNumber = reportData.value.length

      if (reportData.value.length === 0) {
        $q.notify({
          type: 'info',
          message: 'No se encontraron registros para el rango de fechas seleccionado.',
          timeout: 2000,
        })
      } else {
        $q.notify({
          type: 'positive',
          message: `Reporte generado con ${reportData.value.length} registros.`,
          timeout: 1000,
        })
      }
    } else {
      reportError.value = response.data.mensaje || 'Error desconocido de la API.'
      $q.notify({
        type: 'negative',
        message: reportError.value,
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('Error fetching credit report:', error)
    reportError.value = 'Error al obtener el reporte.'
    if (error.response) {
      reportError.value += ` (${error.response.status}: ${error.response.data?.mensaje || error.response.data})`
    }
    $q.notify({
      type: 'negative',
      message: reportError.value,
      timeout: 5000,
    })
  } finally {
    loading.value = false
  }
}

const exportToXLSX = () => {
  if (reportData.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos en la tabla para exportar. Genere un reporte primero.',
      position: 'top',
    })
    return
  }

  $q.notify({
    message: 'Exportando a Excel con estilos...',
    color: 'green',
    icon: 'file_download',
  })

  // Prepare data: only include fields that should be in the Excel file
  // and apply any necessary formatting or transformations.
  exportToXLSX_Reporte_Creditos(reportData.value, startDate.value, endDate.value)

  $q.notify({
    type: 'positive',
    message: 'Reporte Excel generado con éxito.',
    position: 'top',
  })
}

const onTableRequest = (props) => {
  pagination.value = props.pagination
}

// --- Lifecycle Hooks ---
onMounted(async () => {
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

  if (clienteStore.clientes.length === 0) {
    loadingClientes.value = true
    try {
      await clienteStore.cargarClientes()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar clientes',
        caption: error.message,
      })
    } finally {
      loadingClientes.value = false
    }
  }
})

// Watchers
watch(
  () => clienteStore.clienteSeleccionado,
  (newVal) => {
    if (newVal) {
      loadingSucursales.value = true
      clienteStore.cargarSucursales(newVal.id).finally(() => {
        loadingSucursales.value = false
      })
    } else {
      clienteStore.sucursales = []
      clienteStore.sucursalSeleccionada = null
    }
  },
)
</script>
