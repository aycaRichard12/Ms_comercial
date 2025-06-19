<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row justify-center q-col-gutter-md">
          <div class="col-md-4">
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              label="Almacén*"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              clearable
              required
            />
          </div>
        </div>

        <div class="row justify-center q-mt-md">
          <q-btn color="primary" label="Generar reporte" class="q-mr-sm" @click="generarReporte" />
          <q-btn
            color="primary"
            label="Vista previa del Reporte"
            @click="mostrarVistaPrevia"
            :disable="!datosFiltrados.length"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Filtros -->
    <q-card class="q-mb-md" v-if="datosFiltrados.length">
      <q-card-section>
        <div class="row justify-center q-col-gutter-md">
          <div class="col-md-4">
            <q-select
              v-model="filtroEstado"
              :options="opcionesEstado"
              label="Filtrar por estado del producto"
              emit-value
              map-options
            />
          </div>
          <div class="col-md-4">
            <q-select
              v-model="ordenStock"
              :options="opcionesOrden"
              label="Ordenar por stock"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de resultados -->
    <q-card v-if="datosFiltrados.length">
      <q-table
        :rows="datosFiltrados"
        :columns="columnas"
        row-key="id"
        bordered
        flat
        separator="cell"
        :pagination="paginacion"
      >
        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="11" class="text-right">Sumatorias</q-td>
            <q-td class="text-right">{{ sumatoriaStock }}</q-td>
            <q-td class="text-right">{{ sumatoriaCostoTotal }}</q-td>
            <q-td></q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- Modal de vista previa PDF -->
    <q-dialog v-model="modalVisible" full-width>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">REPORTE</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div id="reporteAG" class="invoice overflow-auto">
            <div style="min-width: 600px">
              <header>
                <div class="row">
                  <div class="col company-details">
                    <h6 class="name">
                      <p id="nomempresa">
                        <strong>{{ empresa.nombre }}</strong>
                      </p>
                    </h6>
                    <div id="dirempresa">
                      <strong>{{ empresa.direccion }}</strong>
                    </div>
                    <div id="celempresa">
                      <strong>{{ empresa.telefono }}</strong>
                    </div>
                  </div>

                  <div class="col">
                    <h6 style="text-align: center"><strong>REPORTE PRODUCTOS ALMACEN</strong></h6>
                    <h6 style="text-align: center" id="Nro"></h6>
                  </div>

                  <div class="col" style="text-align: right">
                    <img
                      :src="`.././em/${empresa.logo}`"
                      width="130"
                      height="130"
                      data-holder-rendered="true"
                      id="imagen"
                    />
                  </div>
                </div>
              </header>
              <main>
                <div class="row contacts">
                  <div class="col invoice-to">
                    <div class="text-gray-light"><strong>DATOS DEL REPORTE:</strong></div>
                    <div class="to text-gray-light">
                      <strong>Nombre del almacén</strong>: {{ nombreAlmacenSeleccionado }}
                    </div>
                    <div class="date" id="feventa">
                      <strong>Fecha de Impresion:</strong> {{ fechaActualFormateada }}
                    </div>
                  </div>
                  <div class="col invoice-details">
                    <div class="text-gray-light"><strong>DATOS DEL ENCARGADO:</strong></div>
                    <div class="text-gray-light" id="user">{{ usuario.nombre }}</div>
                    <div class="date" id="rol">{{ usuario.cargo }}</div>
                  </div>
                </div>

                <table class="table" border="0" cellspacing="0" cellpadding="0">
                  <thead class="table-success" id="cabeceraPDF">
                    <tr>
                      <th>N°</th>
                      <th class="text-center">Fecha registro</th>
                      <th class="text-center">Almacén</th>
                      <th class="text-center">Código</th>
                      <th class="text-center">Producto</th>
                      <th class="text-center">Categoría</th>
                      <th class="text-center">Sub categoría</th>
                      <th class="text-center">Descripción</th>
                      <th class="text-center">Unidad</th>
                      <th class="text-center">País</th>
                      <th class="text-center">Stock minimo</th>
                      <th class="text-center">Stock</th>
                      <th class="text-center">Costo total</th>
                      <th class="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody id="listaproductos">
                    <tr v-for="(item, index) in datosFiltrados" :key="index">
                      <td class="text-end">{{ index + 1 }}</td>
                      <td class="text-end">{{ formatearFecha(item.fecha) }}</td>
                      <td>{{ item.almacen }}</td>
                      <td>{{ item.codigo }}</td>
                      <td>{{ item.producto }}</td>
                      <td>{{ item.categoria }}</td>
                      <td>{{ item.subcategoria }}</td>
                      <td>{{ item.descripcion }}</td>
                      <td>{{ item.unidad }}</td>
                      <td>{{ item.pais }}</td>
                      <td class="text-end">{{ item.stockminimo }}</td>
                      <td class="text-end">{{ item.stock }}</td>
                      <td class="text-end">{{ formatearDecimal(calcularCostoTotal(item)) }}</td>
                      <td>{{ estadoTexto(item.estado) }}</td>
                    </tr>
                    <tr>
                      <td colspan="11" style="text-align: right">Sumatorias</td>
                      <td class="text-end">{{ sumatoriaStock }}</td>
                      <td class="text-end">{{ sumatoriaCostoTotal }}</td>
                    </tr>
                  </tbody>
                </table>
              </main>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn label="Descargar en PDF" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { date } from 'quasar'
import { html2pdf } from 'html2pdf.js'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const filtroEstado = ref(0)
const ordenStock = ref(1)
const modalVisible = ref(false)
const usuario = ref({})
const empresa = ref({})
const nombreAlmacenSeleccionado = ref('')
const idempresa = idempresa_md5()
const opcionesEstado = [
  { label: 'Todos', value: 0 },
  { label: 'Activos', value: 1 },
  { label: 'Inactivos', value: 2 },
]

const opcionesOrden = [
  { label: 'Descendente', value: 1 },
  { label: 'Ascendente', value: 2 },
]

const columnas = [
  { name: 'numero', label: 'N°', align: 'right', field: (row) => row.__index + 1 },
  {
    name: 'fecha',
    label: 'Fecha registro',
    field: 'fecha',
    format: (val) => formatearFecha(val),
  },
  { name: 'almacen', label: 'Almacén', field: 'almacen' },
  { name: 'codigo', label: 'Código', field: 'codigo' },
  { name: 'producto', label: 'Producto', field: 'producto' },
  { name: 'categoria', label: 'Categoría', field: 'categoria' },
  { name: 'subcategoria', label: 'Sub categoría', field: 'subcategoria' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion' },
  { name: 'unidad', label: 'Unidad', field: 'unidad' },
  { name: 'pais', label: 'País', field: 'pais' },
  { name: 'stockminimo', label: 'Stock mínimo', field: 'stockminimo', align: 'right' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right' },
  {
    name: 'costototal',
    label: 'Costo total',
    align: 'right',
    field: (row) => calcularCostoTotal(row),
    format: (val) => formatearDecimal(val),
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    format: (val) => estadoTexto(val),
  },
]

const paginacion = {
  rowsPerPage: 10,
}

const sumatoriaStock = computed(() => {
  return formatearDecimal(
    datosFiltrados.value.reduce((sum, dato) => sum + parseFloat(dato.stock || 0), 0),
  )
})

const sumatoriaCostoTotal = computed(() => {
  return formatearDecimal(
    datosFiltrados.value.reduce(
      (sum, dato) => sum + parseFloat(dato.costounitario || 0) * parseFloat(dato.stock || 0),
      0,
    ),
  )
})

const fechaActualFormateada = computed(() => {
  return formatearFecha(new Date().toISOString())
})

onMounted(async () => {
  await cargarAlmacenes()
})

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaAlmacen/${idempresa}`)
    console.log(response)
    if (Array.isArray(response.data)) {
      opcionesAlmacenes.value = response.data
        .filter((almacen) => Number(almacen.estado) === 1)
        .map((almacen) => ({
          ...almacen,
          label: almacen.nombre,
          value: almacen.id,
        }))
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de almacenes',
    })
  }
}

async function generarReporte() {
  if (!almacenSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un almacén',
    })
    return
  }

  try {
    const response = await api.get(
      `reporteproductoalmacen/${almacenSeleccionado.value}/${idempresa}`,
    )
    datosOriginales.value = response.data
    filtrarYOrdenarDatos()

    // Guardar nombre del almacén seleccionado
    const almacen = opcionesAlmacenes.value.find((a) => a.id === almacenSeleccionado.value)
    nombreAlmacenSeleccionado.value = almacen ? almacen.nombre : ''
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  }
}

function filtrarYOrdenarDatos() {
  // Aplicar filtro
  let datos = [...datosOriginales.value]

  if (filtroEstado.value !== 0) {
    datos = datos.filter((item) => item.estado === filtroEstado.value)
  }

  // Aplicar orden
  if (ordenStock.value === 2) {
    datos.sort((a, b) => parseFloat(a.stock) - parseFloat(b.stock))
  } else {
    datos.sort((a, b) => parseFloat(b.stock) - parseFloat(a.stock))
  }

  datosFiltrados.value = datos
}

function mostrarVistaPrevia() {
  if (!datosFiltrados.value.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para mostrar',
    })
    return
  }
  modalVisible.value = true
}

function descargarPDF() {
  const element = document.getElementById('reporteAG')
  const opt = {
    margin: 0.5,
    filename: `Reporte Producto Almacén ${formatearFecha(new Date().toISOString())}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, letterRendering: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
  }

  // Necesitarás importar html2pdf.js en tu proyecto
  html2pdf().set(opt).from(element).save()
}

// Funciones de utilidad
function formatearFecha(fecha) {
  return date.formatDate(fecha, 'DD/MM/YYYY')
}

function formatearDecimal(valor) {
  return parseFloat(valor || 0).toFixed(2)
}

function calcularCostoTotal(item) {
  return parseFloat(item.costounitario || 0) * parseFloat(item.stock || 0)
}

function estadoTexto(estado) {
  return estado === 1 ? 'Activo' : 'Inactivo'
}
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
  border-bottom: 1px solid #3989c6;
}

.invoice .company-details {
  text-align: right;
}

.invoice .company-details .name {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .contacts {
  margin-bottom: 20px;
}

.invoice .invoice-to {
  text-align: left;
}

.invoice .invoice-to .to {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .invoice-details {
  text-align: right;
}

.invoice .invoice-details .invoice-id {
  margin-top: 0;
  color: #3989c6;
}

.invoice main {
  padding-bottom: 50px;
}

.invoice main .thanks {
  margin-top: -100px;
  font-size: 40px;
  margin-bottom: 50px;
}

.invoice main .notices {
  padding-left: 6px;
  border-left: 6px solid #3989c6;
}

.invoice main .notices .notice {
  font-size: 1.2em;
}

.invoice table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.invoice table td,
.invoice table th {
  padding: 15px;
  background: #eee;
  border-bottom: 1px solid #fff;
}

.invoice table th {
  white-space: nowrap;
  font-weight: 400;
  font-size: 16px;
}

.invoice table td h3 {
  margin: 0;
  font-weight: 400;
  color: #3989c6;
  font-size: 1.2em;
}

.invoice table .qty,
.invoice table .total,
.invoice table .unit {
  text-align: right;
  font-size: 1.2em;
}

.invoice table .no {
  color: #fff;
  font-size: 1.6em;
  background: #3989c6;
}

.invoice table .unit {
  background: #ddd;
}

.invoice table .total {
  background: #3989c6;
  color: #fff;
}

.invoice table tbody tr:last-child td {
  border: none;
}

.invoice table tfoot td {
  background: 0 0;
  border-bottom: none;
  white-space: nowrap;
  text-align: right;
  padding: 10px 20px;
  font-size: 1.2em;
  border-top: 1px solid #aaa;
}

.invoice table tfoot tr:first-child td {
  border-top: none;
}

.invoice table tfoot tr:last-child td {
  color: #3989c6;
  font-size: 1.4em;
  border-top: 1px solid #3989c6;
}

.invoice table tfoot tr td:first-child {
  border: none;
}

.invoice footer {
  width: 100%;
  text-align: center;
  color: #777;
  border-top: 1px solid #aaa;
  padding: 8px 0;
}

@media print {
  .invoice {
    font-size: 11px !important;
    overflow: hidden !important;
  }

  .invoice footer {
    position: absolute;
    bottom: 10px;
    page-break-after: always;
  }

  .invoice > div:last-child {
    page-break-before: always;
  }
}
</style>
