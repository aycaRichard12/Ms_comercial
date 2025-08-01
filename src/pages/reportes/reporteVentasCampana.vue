<template>
  <q-page padding class="q-mt-lg">
    <q-form @submit.prevent="handleGenerarReporte">
      <div class="row justify-center q-col-gutter-md">
        <q-input
          v-model="fechaInicio"
          label="Fecha Inicial*"
          type="date"
          class="col-md-4"
          outlined
          dense
          @update:model-value="validarFechas"
        />
        <q-input
          v-model="fechaFin"
          label="Fecha Final*"
          type="date"
          class="col-md-4"
          outlined
          dense
          @update:model-value="validarFechas"
        />
      </div>
      <div class="row justify-center q-pt-md">
        <q-btn
          label="Generar reporte"
          color="primary"
          @click="handleGenerarReporte"
          class="q-mx-sm"
        />
        <q-btn
          label="Vista previa del Reporte"
          color="primary"
          @click="handleVerReporte"
          class="q-mx-sm"
        />
      </div>
    </q-form>

    <div class="q-mt-lg">
      <q-form>
        <div class="row justify-center q-pa-sm">
          <q-select
            v-model="almacenSeleccionado"
            :options="opcionesAlmacenes"
            label="Almacén*"
            emit-value
            map-options
            class="col-md-4"
            outlined
            dense
            :disable="!reporteGenerado"
          />
        </div>
      </q-form>
      <q-table
        :rows="datosFiltrados"
        :columns="columnasTabla"
        row-key="id"
        flat
        bordered
        separator="cell"
        class="q-mt-md"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <span> No hay datos para mostrar. Genere un reporte primero. </span>
          </div>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="mostrarModalPDF" full-screen>
      <q-card class="column full-height">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">REPORTE</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col q-pt-none scroll">
          <div id="reporteN" class="invoice-container">
            <div class="invoice-content">
              <header class="row">
                <div class="col company-details">
                  <h6 class="name">
                    <p>
                      <strong>{{ datosUsuario.empresa?.nombre }}</strong>
                    </p>
                  </h6>
                  <div>
                    <strong>{{ datosUsuario.empresa?.direccion }}</strong>
                  </div>
                  <div>
                    <strong>{{ datosUsuario.empresa?.telefono }}</strong>
                  </div>
                </div>

                <div class="col text-center">
                  <h6 class="text-center"><strong>REPORTE DE CAMPAÑAS</strong></h6>
                  <label class="col-form-label text-center"
                    >Entre <span id="iniciob">{{ cambiarFormatoFecha(fechaInicio) }}</span> Y
                    <span id="finb">{{ cambiarFormatoFecha(fechaFin) }}</span></label
                  >
                  <h6 class="text-center"></h6>
                  <p class="text-center"></p>
                </div>

                <div class="col text-right">
                  <img :src="`.././em/${datosUsuario.empresa?.logo}`" width="130" height="130" />
                </div>
              </header>
              <main>
                <div class="row contacts">
                  <div class="col invoice-to">
                    <div class="text-grey-light"><strong>DATOS DEL REPORTE:</strong></div>
                    <div class="to text-grey-light">
                      <strong>Nombre del almacén</strong>: {{ almacenSeleccionadoTexto }}
                    </div>
                    <div class="date">
                      <strong>Fecha de Impresión:</strong>
                      {{ cambiarFormatoFecha(obtenerFechaActualDato()) }}
                    </div>
                  </div>
                  <div class="col invoice-details">
                    <div class="text-grey-light"><strong>DATOS DEL ENCARGADO:</strong></div>
                    <div class="text-grey-light">{{ datosUsuario.nombre }}</div>
                    <div class="date">{{ datosUsuario.cargo }}</div>
                  </div>
                </div>

                <q-table
                  :rows="datosFiltrados"
                  :columns="columnasPDF"
                  row-key="id"
                  flat
                  bordered
                  separator="cell"
                  hide-bottom
                  class="q-mt-md"
                />
              </main>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn flat label="Descargar en PDF" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js' // Asegúrate de haber instalado html2pdf.js
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG.js'
import { validarUsuario } from 'src/composables/FuncionesG.js'
const $q = useQuasar()

// --- Estados Reactivos ---
const fechaInicio = ref(obtenerFechaActualDato())
const fechaFin = ref(obtenerFechaActualDato())
const almacenSeleccionado = ref('0') // "0" para "Todos los almacenes"
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const datosUsuario = reactive({})
const mostrarModalPDF = ref(false)
const reporteGenerado = ref(false)

// --- Propiedades Calculadas ---
const almacenSeleccionadoTexto = computed(() => {
  const selected = opcionesAlmacenes.value.find((op) => op.value === almacenSeleccionado.value)
  return selected ? selected.label : 'Todos los almacenes'
})

const columnasTabla = [
  { name: 'n', label: 'N°', field: 'n', align: 'left', format: (val, row, index) => index + 1 },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'nombre', label: 'Campaña', field: 'nombre', align: 'left' },
  {
    name: 'fechainicio',
    label: 'Fecha Inicio',
    field: 'fechainicio',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  {
    name: 'fechafinal',
    label: 'Fecha Final',
    field: 'fechafinal',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  { name: 'nventas', label: 'Cantidad de Ventas', field: 'nventas', align: 'left' },
]

const columnasPDF = [
  { name: 'n', label: 'N°', field: 'n', align: 'left', format: (val, row, index) => index + 1 },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'nombre', label: 'Campaña', field: 'nombre', align: 'left' },
  {
    name: 'fechainicio',
    label: 'Fecha Inicio',
    field: 'fechainicio',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  {
    name: 'fechafinal',
    label: 'Fecha Final',
    field: 'fechafinal',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  { name: 'nventas', label: 'Cantidad de Ventas', field: 'nventas', align: 'left' },
]

// --- Watchers ---
watch(almacenSeleccionado, (newVal) => {
  filtrarYOrdenarDatos(newVal)
})

// --- Funciones ---

/**
 * Carga la lista de almacenes disponibles para el usuario.
 */
async function cargarListaAlmacenes() {
  try {
    const contenidousuario = validarUsuario()
    Object.assign(datosUsuario, contenidousuario[0]) // Asigna los datos del usuario al objeto reactivo
    const idempresa = datosUsuario.empresa?.idempresa
    const idusuario = datosUsuario.idusuario
    const endpoint = `listaResponsableAlmacen/${idempresa}`

    const response = await api.get(endpoint)
    console.log(response)
    const resultado = response.data
    if (resultado && resultado[0] === 'error') {
      console.error('Error al cargar almacenes:', resultado.error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar almacenes.',
        position: 'top',
      })
    } else {
      opcionesAlmacenes.value = []
      opcionesAlmacenes.value.push({ label: 'Todos los almacenes', value: '0' })
      const use = resultado.filter((u) => u.idusuario == idusuario)
      use.forEach((key) => {
        opcionesAlmacenes.value.push({
          label: key.almacen,
          value: key.idalmacen,
          dataValue: key.sucursales[0].codigosin,
        })
      })
    }
  } catch (error) {
    console.error('Error en cargarListaAlmacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al cargar los almacenes.',
      position: 'top',
    })
  }
}

/**
 * Valida que la fecha de inicio no sea mayor que la fecha final.
 */
function validarFechas() {
  const inicio = new Date(fechaInicio.value)
  const fin = new Date(fechaFin.value)

  if (inicio.getTime() > fin.getTime()) {
    $q.notify({
      type: 'info',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
      position: 'top',
    })
    // Se podría resetear la fecha o ajustar para corregir el error
    // fechaInicio.value = obtenerFechaActual(); // Ejemplo de reseteo
  }
}

/**
 * Genera el reporte de ventas de campaña.
 */
async function generarReporte() {
  if (!fechaInicio.value || !fechaFin.value) {
    $q.notify({
      type: 'info',
      message: 'Por favor, seleccione ambas fechas para generar el reporte.',
      position: 'top',
    })
    return
  }

  $q.loading.show({
    message: 'Generando reporte...',
  })

  try {
    const idusuario = datosUsuario.idusuario
    const point = `reporteventacampaña/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
    const response = await api.get(point)
    console.log(response.status)
    const data = response.data

    if (response.status === 200) {
      datosOriginales.value = data
      datosFiltrados.value = data // Inicialmente, los datos filtrados son todos los originales
      reporteGenerado.value = true
      almacenSeleccionado.value = '0' // Reinicia el filtro de almacén
      $q.notify({
        type: 'positive',
        message: 'Reporte generado con éxito.',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al generar el reporte: ' + (data.error || 'Mensaje desconocido'),
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error en generarReporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al generar el reporte.',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

/**
 * Filtra los datos del reporte según el almacén seleccionado.
 * @param {string} dato - El ID del almacén o "0" para todos.
 */
function filtrarYOrdenarDatos(dato) {
  if (dato === '0') {
    datosFiltrados.value = [...datosOriginales.value]
  } else {
    datosFiltrados.value = datosOriginales.value.filter((u) => String(u.idalmacen) === String(dato))
  }
}

/**
 * Maneja el clic en el botón "Generar reporte".
 */
async function handleGenerarReporte() {
  await generarReporte()
  if (reporteGenerado.value) {
    await cargarListaAlmacenes() // Recarga los almacenes después de generar el reporte
  }
}

/**
 * Maneja el clic en el botón "Vista previa del Reporte".
 */
function handleVerReporte() {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se ha generado ningún reporte o el reporte está vacío.',
      position: 'top',
    })
  } else {
    mostrarModalPDF.value = true
  }
}

/**
 * Descarga el PDF del reporte.
 */
function descargarPDF() {
  const pdfContent = document.getElementById('reporteN')
  if (!pdfContent) {
    $q.notify({
      type: 'negative',
      message: 'No se encontró el contenido del reporte para descargar.',
      position: 'top',
    })
    return
  }

  $q.loading.show({
    message: 'Generando PDF...',
  })

  const opt = {
    margin: 0.5,
    filename: `Reporte de Ventas Campañas ${obtenerFechaActualDato()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, letterRendering: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }

  html2pdf()
    .set(opt)
    .from(pdfContent)
    .save()
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'PDF descargado con éxito.',
        position: 'top',
      })
    })
    .catch((error) => {
      console.error('Error al generar PDF:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al descargar el PDF.',
        position: 'top',
      })
    })
    .finally(() => {
      $q.loading.hide()
    })
}

// --- Ciclo de Vida ---
onMounted(async () => {
  // Carga inicial de datos de usuario para asegurar que datosUsuario está poblado
  const contenidousuario = validarUsuario()
  if (contenidousuario && contenidousuario.length > 0) {
    Object.assign(datosUsuario, contenidousuario[0])
  }
  // No cargar almacenes aquí, se cargarán después de generar el reporte
})
</script>

<style lang="scss" scoped>
// Estilos para el PDF, adaptados de tu HTML original
.invoice-container {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  min-height: 297mm; /* A4 height for better PDF rendering */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  .invoice-content {
    min-width: 600px;
    font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
    font-size: 12px;
    line-height: 1.6em;
    color: #555;
  }

  header {
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;

    .company-details {
      text-align: left;
    }

    .col {
      padding: 0 10px;
      vertical-align: top;
    }

    img {
      max-width: 100%;
      height: auto;
    }
  }

  main {
    .contacts {
      margin-bottom: 20px;

      .invoice-to,
      .invoice-details {
        vertical-align: top;
      }
    }

    .q-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;

      thead th {
        background-color: #e0f2f1; // Quasar teal light
        color: #004d40; // Quasar teal dark
        font-weight: bold;
        padding: 8px;
        text-align: left;
        border: 1px solid #ccc;
      }

      tbody td {
        padding: 8px;
        border: 1px solid #eee;
      }
    }
  }
}
</style>
