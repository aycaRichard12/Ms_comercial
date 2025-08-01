<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Reporte de Índice de Rotación por Almacén</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="generarReporte">
          <div class="row q-col-gutter-md">
            <div class="col-md-4">
              <q-input
                v-model="fechaInicio"
                label="Fecha Inicial*"
                type="date"
                outlined
                dense
                :rules="[(val) => !!val || 'Campo obligatorio']"
              />
            </div>
            <div class="col-md-4">
              <q-input
                v-model="fechaFin"
                label="Fecha Final*"
                type="date"
                outlined
                dense
                :rules="[
                  (val) => !!val || 'Campo obligatorio',
                  (val) => validarFechas(val) || 'Fecha final debe ser mayor o igual a la inicial',
                ]"
              />
            </div>
            <div class="col-md-4">
              <q-select
                v-model="almacenSeleccionado"
                :options="almacenesOptions"
                label="Almacén*"
                outlined
                dense
                option-value="idalmacen"
                option-label="almacen"
                emit-value
                map-options
                :rules="[(val) => !!val || 'Campo obligatorio']"
              />
            </div>
          </div>

          <div class="row justify-center q-mt-md">
            <q-btn label="Generar Reporte" type="submit" color="primary" class="q-mr-sm" />
            <q-btn
              label="Vista Previa"
              color="secondary"
              @click="mostrarVistaPrevia"
              :disable="!datosFiltrados || datosFiltrados.length === 0"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Tabla de resultados -->
    <q-card>
      <q-card-section>
        <div class="table-responsive">
          <q-table
            :rows="datosFiltrados"
            :columns="columnas"
            row-key="codigo"
            flat
            bordered
            :loading="cargando"
            :pagination="pagination"
          >
            <template v-slot:body-cell-rotacion="props">
              <q-td :props="props">
                {{ calcularRotacion(props.row) }}
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Modal de vista previa PDF -->
    <q-dialog v-model="modalVisible" full-width full-height>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">REPORTE DE ÍNDICE DE ROTACIÓN POR ALMACÉN</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div id="reporteP" class="invoice overflow-auto">
            <div style="min-width: 600px">
              <header>
                <div class="row">
                  <div class="col company-details">
                    <h6 class="name">
                      <p>
                        <strong>{{ empresa.nombre }}</strong>
                      </p>
                    </h6>
                    <div>
                      <strong>{{ empresa.direccion }}</strong>
                    </div>
                    <div>
                      <strong>{{ empresa.telefono }}</strong>
                    </div>
                  </div>

                  <div class="col text-center">
                    <h6><strong>REPORTE DE INDICE DE ROTACION POR ALMACEN</strong></h6>
                    <label class="col-form-label">
                      Entre <span>{{ formatearFecha(fechaInicio) }}</span> Y
                      <span>{{ formatearFecha(fechaFin) }}</span>
                    </label>
                  </div>

                  <div class="col text-right">
                    <img :src="empresa.logo" width="130" height="130" />
                  </div>
                </div>
              </header>

              <main>
                <div class="row contacts">
                  <div class="col invoice-to">
                    <div><strong>DATOS DEL REPORTE:</strong></div>
                    <div><strong>Almacén:</strong> {{ nombreAlmacenSeleccionado }}</div>
                    <div><strong>Fecha de Impresión:</strong> {{ fechaActualFormateada }}</div>
                  </div>
                  <div class="col invoice-details">
                    <div><strong>DATOS DEL ENCARGADO:</strong></div>
                    <div>{{ usuario.nombre }}</div>
                    <div>{{ usuario.cargo }}</div>
                  </div>
                </div>

                <table class="q-table" border="0" cellspacing="0" cellpadding="0">
                  <thead class="thead-dark">
                    <tr>
                      <th>N°</th>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Unidad</th>
                      <th>Cant. ventas</th>
                      <th>Inv. externo</th>
                      <th>Rotación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in datosFiltrados" :key="item.codigo">
                      <td>{{ index + 1 }}</td>
                      <td>{{ item.codigo }}</td>
                      <td>{{ item.producto }}</td>
                      <td>{{ item.categoria }}</td>
                      <td>{{ item.descripcion }}</td>
                      <td>{{ item.unidad }}</td>
                      <td>{{ formatearDecimal(item.cantidadventas) }}</td>
                      <td>{{ formatearDecimal(item.cantidadIE) }}</td>
                      <td>{{ formatearDecimal(calcularRotacion(item)) }}</td>
                    </tr>
                  </tbody>
                </table>
              </main>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn label="Descargar PDF" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch'

import html2pdf from 'html2pdf.js'
import { URL_APICM } from 'src/composables/services'

export default {
  setup() {
    const $q = useQuasar()
    const cargando = ref(false)
    const modalVisible = ref(false)

    // Datos del formulario
    const fechaInicio = ref('')
    const fechaFin = ref('')
    const almacenSeleccionado = ref(null)
    const almacenesOptions = ref([])

    // Datos del reporte
    const datosOriginales = ref([])
    const datosFiltrados = ref([])

    // Información del usuario y empresa
    const usuario = ref({})
    const empresa = ref({})

    // Configuración de la tabla
    const columnas = [
      { name: 'numero', label: 'N°', field: (row) => row.index, align: 'left' },
      { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
      { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
      { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
      { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
      { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
      { name: 'cantidadventas', label: 'Cant. ventas', field: 'cantidadventas', align: 'right' },
      { name: 'cantidadIE', label: 'Inv. externo', field: 'cantidadIE', align: 'right' },
      { name: 'rotacion', label: 'Rotación', field: 'rotacion', align: 'right' },
    ]

    const pagination = {
      rowsPerPage: 10,
    }

    // Computed properties
    const nombreAlmacenSeleccionado = computed(() => {
      const almacen = almacenesOptions.value.find((a) => a.idalmacen === almacenSeleccionado.value)
      return almacen ? almacen.almacen : ''
    })

    const fechaActualFormateada = computed(() => {
      return formatearFecha(new Date().toISOString().split('T')[0])
    })

    // Métodos
    const validarFechas = (fechaFinValue) => {
      if (!fechaInicio.value || !fechaFinValue) return true
      return new Date(fechaInicio.value) <= new Date(fechaFinValue)
    }

    const formatearFecha = (fecha) => {
      if (!fecha) return ''
      const [year, month, day] = fecha.split('-')
      return `${day}/${month}/${year}`
    }

    const formatearDecimal = (valor) => {
      return parseFloat(valor).toFixed(2)
    }

    const calcularRotacion = (item) => {
      if (!fechaInicio.value || !fechaFin.value) return 0

      const date1 = new Date(fechaInicio.value)
      const date2 = new Date(fechaFin.value)

      date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset())
      date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset())

      const differences = date2.getTime() - date1.getTime()
      const dayss = differences / (1000 * 3600 * 24) + 1

      return ((item.cantidadventas - item.cantidadIE) / dayss).toFixed(2)
    }

    const cargarAlmacenes = async () => {
      try {
        const contenidousuario = validarUsuario()
        if (!contenidousuario || !contenidousuario[0]) {
          throw new Error('Usuario no válido')
        }

        const idempresa = contenidousuario[0]?.empresa?.idempresa
        const idusuario = contenidousuario[0]?.idusuario

        if (!idempresa) {
          throw new Error('Empresa no válida')
        }

        const endpoint = `${URL_APICM}api/listaResponsableAlmacen/${idempresa}`
        const resultado = await peticionGET(endpoint)

        if (resultado[0] === 'error') {
          throw new Error(resultado.error)
        }

        // Filtrar almacenes del usuario actual y agregar opción "Todos"
        const userAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
        almacenesOptions.value = [
          { idalmacen: 0, almacen: 'Todos los almacenes' },
          ...userAlmacenes,
        ]

        // Seleccionar "Todos los almacenes" por defecto
        almacenSeleccionado.value = 0
      } catch (error) {
        console.error('Error al cargar almacenes:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar los almacenes',
          caption: error.message,
        })
      }
    }

    const generarReporte = async () => {
      try {
        if (!fechaInicio.value || !fechaFin.value || almacenSeleccionado.value === null) {
          $q.notify({
            type: 'warning',
            message: 'Error',
            caption: 'Ingrese todos los datos necesarios',
          })
          return
        }

        cargando.value = true

        const contenidousuario = validarUsuario()
        const idempresa = contenidousuario[0]?.empresa?.idempresa

        if (!idempresa) {
          throw new Error('Empresa no válida')
        }

        const resp = await fetch(
          `${URL_APICM}api/reporteindicerotacionalmacen/${almacenSeleccionado.value}/${fechaInicio.value}/${fechaFin.value}`,
        )

        if (!resp.ok) {
          throw new Error('Error al obtener el reporte')
        }

        const data = await resp.json()
        datosOriginales.value = data
        datosFiltrados.value = data.map((item, index) => ({ ...item, index: index + 1 }))

        // Guardar información del usuario y empresa para el PDF
        usuario.value = contenidousuario[0]
        empresa.value = contenidousuario[0]?.empresa || {}
      } catch (error) {
        console.error('Error al generar reporte:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al generar el reporte',
          caption: error.message,
        })
      } finally {
        cargando.value = false
      }
    }

    const mostrarVistaPrevia = () => {
      if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
        $q.notify({
          type: 'info',
          message: 'Error',
          caption: 'No se generó ningún reporte',
        })
        return
      }
      modalVisible.value = true
    }

    const descargarPDF = () => {
      const pdf = document.querySelector('#reporteP')

      const opt = {
        margin: 0.5,
        filename: `Reporte de Indice Rotacion Almacén ${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }

      html2pdf().set(opt).from(pdf).save()
    }

    // Función de validación de usuario (simplificada)
    const validarUsuario = () => {
      // Esta función debería implementarse según tu lógica de autenticación
      // Aquí solo un ejemplo básico
      try {
        const usuarioData = localStorage.getItem('usuario')
        return usuarioData ? JSON.parse(usuarioData) : null
      } catch (error) {
        console.error('Error al validar usuario:', error)
        return null
      }
    }

    // Inicialización
    onMounted(() => {
      // Establecer fechas por defecto (hoy)
      const hoy = new Date().toISOString().split('T')[0]
      fechaInicio.value = hoy
      fechaFin.value = hoy

      // Cargar almacenes
      cargarAlmacenes()

      // Validar usuario
      const usuarioData = validarUsuario()
      if (usuarioData && usuarioData[0]) {
        usuario.value = usuarioData[0]
        empresa.value = usuarioData[0]?.empresa || {}
      }
    })

    return {
      // Estados
      cargando,
      modalVisible,
      fechaInicio,
      fechaFin,
      almacenSeleccionado,
      almacenesOptions,
      datosFiltrados,
      usuario,
      empresa,
      columnas,
      pagination,

      // Computed
      nombreAlmacenSeleccionado,
      fechaActualFormateada,

      // Métodos
      validarFechas,
      formatearFecha,
      formatearDecimal,
      calcularRotacion,
      generarReporte,
      mostrarVistaPrevia,
      descargarPDF,
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

.invoice .invoice-details {
  text-align: right;
}

.invoice table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.invoice table td,
.invoice table th {
  padding: 5px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.invoice table th {
  white-space: nowrap;
  font-weight: 400;
  font-size: 12px;
  background: #eee;
}

.invoice table td h3 {
  margin: 0;
  font-weight: 400;
  color: #3989c6;
  font-size: 1.2em;
}
</style>
