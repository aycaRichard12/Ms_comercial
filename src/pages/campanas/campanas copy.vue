<template>
  <q-card>
    <q-card-section>
      <div class="row">
        <div class="col-md-12 q-mt-md q-mb-md">
          <q-btn flat color="primary" icon="chevron_left" label="Volver" @click="volverACampanas" />
        </div>
      </div>

      <q-form @submit.prevent="generarReporte">
        <div class="row justify-center" id="parametersform">
          <div class="col-md-4 q-pa-sm">
            <q-input
              filled
              v-model="fechaInicio"
              label="Fecha Inicial*"
              type="date"
              @change="validarFechas"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
          <div class="col-md-4 q-pa-sm">
            <q-input
              filled
              v-model="fechaFin"
              label="Fecha Final*"
              type="date"
              @change="validarFechas"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
        </div>

        <div class="row justify-center q-mt-md">
          <div class="col-auto q-pa-sm">
            <q-btn color="primary" label="Generar reporte" type="submit" />
            <q-btn
              color="primary"
              label="Vista previa del Reporte"
              class="q-ml-sm"
              @click="mostrarVistaPrevia"
              :disable="!datosFiltrados || datosFiltrados.length === 0"
            />
          </div>
        </div>
      </q-form>

      <div class="q-mt-lg">
        <div class="row justify-center q-pa-sm">
          <div class="col-md-4">
            <q-select
              filled
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              label="Almacén*"
              option-value="idalmacen"
              option-label="almacen"
              emit-value
              map-options
            />
          </div>
        </div>

        <q-table
          flat
          bordered
          :rows="datosFiltrados"
          :columns="columnas"
          row-key="name"
          class="q-mt-md"
          :loading="cargando"
        >
          <template v-slot:no-data>
            <div class="full-width row flex-center text-primary q-gutter-sm">
              <span>No hay datos disponibles</span>
            </div>
          </template>
        </q-table>
      </div>
    </q-card-section>

    <!-- Modal para vista previa del PDF -->
    <q-dialog v-model="modalPDFVisible" full-width>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">REPORTE</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div id="reporteN" class="invoice overflow-auto">
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

                  <div class="col" style="text-align: center">
                    <h6 style="text-align: center"><strong>REPORTE DE CAMPAÑAS</strong></h6>
                    <label class="col-form-label" style="text-align: center">
                      Entre <span id="iniciob">{{ cambiarFormatoFecha(fechaInicio) }}</span> Y
                      <span id="finb">{{ cambiarFormatoFecha(fechaFin) }}</span>
                    </label>
                  </div>

                  <div class="col" style="text-align: right">
                    <img :src="empresa.logo" width="130" height="130" id="imagen" />
                  </div>
                </div>
              </header>
              <main>
                <div class="row contacts">
                  <div class="col invoice-to">
                    <div class="text-gray-light"><strong>DATOS DEL REPORTE:</strong></div>
                    <div class="to text-gray-light">
                      <strong>Nombre del almacén</strong>: {{ almacenSeleccionadoNombre }}
                    </div>
                    <div class="date" id="feventa">
                      <strong>Fecha de Impresion:</strong> {{ cambiarFormatoFecha(fechaActual) }}
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
                      <th>Almacén</th>
                      <th>Campaña</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Final</th>
                      <th>Cantidad de Ventas</th>
                    </tr>
                  </thead>
                  <tbody id="listaproductos">
                    <tr v-for="(item, index) in datosFiltrados" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.almacen }}</td>
                      <td>{{ item.nombre }}</td>
                      <td>{{ cambiarFormatoFecha(item.fechainicio) }}</td>
                      <td>{{ cambiarFormatoFecha(item.fechafinal) }}</td>
                      <td>{{ item.nventas }}</td>
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
  </q-card>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import html2pdf from 'html2pdf.js'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { validarUsuario } from 'src/composables/FuncionesGenerales'

export default {
  name: 'ReporteVentasCampana',

  setup() {
    const $q = useQuasar()

    // Datos reactivos
    const fechaInicio = ref('')
    const fechaFin = ref('')
    const almacenSeleccionado = ref(0)
    const datosOriginales = ref([])
    const datosFiltrados = ref([])
    const opcionesAlmacenes = ref([])
    const cargando = ref(false)
    const modalPDFVisible = ref(false)
    const fechaActual = ref(new Date())

    // Información del usuario y empresa
    const usuario = ref({
      idusuario: null,
      nombre: '',
      cargo: '',
    })

    const empresa = ref({
      idempresa: null,
      nombre: '',
      direccion: '',
      telefono: '',
      logo: '',
    })

    // Columnas para la tabla
    const columnas = [
      { name: 'numero', label: 'N°', field: (row) => row.index, align: 'left' },
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

    // Computed properties
    const almacenSeleccionadoNombre = computed(() => {
      const almacen = opcionesAlmacenes.value.find((a) => a.idalmacen === almacenSeleccionado.value)
      return almacen ? almacen.almacen : 'Todos los almacenes'
    })

    // Métodos

    const validarFechas = () => {
      if (fechaInicio.value && fechaFin.value) {
        const inicio = new Date(fechaInicio.value)
        const fin = new Date(fechaFin.value)

        if (inicio.getTime() > fin.getTime()) {
          $q.notify({
            type: 'negative',
            message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
          })
          fechaInicio.value = ''
        }
      }
    }

    const cargarAlmacenes = async () => {
      try {
        cargando.value = true
        const response = await api.get(`listaResponsableAlmacen/${empresa.value.idempresa}`)

        if (response.data && response.data.length > 0) {
          opcionesAlmacenes.value = [
            { idalmacen: 0, almacen: 'Todos los almacenes' },
            ...response.data.filter((u) => u.idusuario == usuario.value.idusuario),
          ]
        }
      } catch (error) {
        console.error('Error al cargar almacenes:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar la lista de almacenes',
        })
      } finally {
        cargando.value = false
      }
    }

    const generarReporte = async () => {
      try {
        cargando.value = true
        const response = await api.get(
          `reporteventacampaña/${usuario.value.idusuario}/${fechaInicio.value}/${fechaFin.value}`,
        )
        console.log(response)
        datosOriginales.value = response.data
        datosFiltrados.value = response.data
        almacenSeleccionado.value = 0

        $q.notify({
          type: 'positive',
          message: 'Reporte generado correctamente',
        })
      } catch (error) {
        console.error('Error al generar reporte:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al generar el reporte',
        })
      } finally {
        cargando.value = false
      }
    }

    const filtrarDatos = () => {
      if (almacenSeleccionado.value === 0) {
        datosFiltrados.value = [...datosOriginales.value]
      } else {
        datosFiltrados.value = datosOriginales.value.filter(
          (u) => u.idalmacen == almacenSeleccionado.value,
        )
      }
    }

    const mostrarVistaPrevia = () => {
      if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
        $q.notify({
          type: 'info',
          message: 'No se generó ningún reporte',
        })
      } else {
        modalPDFVisible.value = true
      }
    }

    const descargarPDF = () => {
      const pdf = document.querySelector('#reporteN')
      const opt = {
        margin: 0.5,
        filename: `Reporte de Ventas Campañas ${cambiarFormatoFecha(fechaActual.value)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }

      html2pdf().set(opt).from(pdf).save()
    }

    const volverACampanas = () => {
      // Aquí deberías implementar la navegación a la vista de campañas
      // Por ejemplo:
      // router.push('/campanas')
      // O emitir un evento para que el componente padre maneje el cambio
      console.log('Volver a campañas')
    }

    // Inicialización
    onMounted(() => {
      // Simular datos del usuario (deberías obtenerlos de tu sistema de autenticación)
      const contenidousuario = validarUsuario()
      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const idusuario = contenidousuario[0]?.idusuario
      const nombre = contenidousuario[0]?.nombre
      const cargo = contenidousuario[0]?.cargo

      const nombreEmpresa = contenidousuario[0]?.empresa?.nombre
      const direccionEmpresa = contenidousuario[0]?.empresa?.direccion
      const telefonoEmpresa = contenidousuario[0]?.empresa?.telefono
      const logoEmpresa = contenidousuario[0]?.empresa?.logo
      usuario.value = {
        idusuario: idusuario,
        nombre: nombre,
        cargo: cargo,
      }

      empresa.value = {
        idempresa: idempresa,
        nombre: nombreEmpresa,
        direccion: direccionEmpresa,
        telefono: telefonoEmpresa,
        logo: logoEmpresa,
      }

      cargarAlmacenes()
    })

    // Watchers
    watch(almacenSeleccionado, () => {
      filtrarDatos()
    })

    return {
      // Datos reactivos
      fechaInicio,
      fechaFin,
      almacenSeleccionado,
      datosFiltrados,
      opcionesAlmacenes,
      cargando,
      modalPDFVisible,
      fechaActual,

      // Información
      usuario,
      empresa,

      // Computed
      almacenSeleccionadoNombre,

      // Columnas
      columnas,

      // Métodos
      cambiarFormatoFecha,
      validarFechas,
      generarReporte,
      mostrarVistaPrevia,
      descargarPDF,
      volverACampanas,
    }
  },
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
