<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Reporte de Índice de Rotación por Cliente</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="generarReporte">
          <div class="row q-col-gutter-md">
            <!-- Fecha Inicial -->
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-input
                v-model="fechaInicio"
                label="Fecha Inicial*"
                type="date"
                outlined
                dense
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>

            <!-- Fecha Final -->
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-input
                v-model="fechaFin"
                label="Fecha Final*"
                type="date"
                outlined
                dense
                :rules="[(val) => !!val || 'Campo requerido']"
              />
            </div>

            <!-- Cliente -->
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-select
                v-model="clienteSeleccionado"
                label="Razón Social*"
                :options="clientesOptions"
                option-label="label"
                option-value="value"
                use-input
                outlined
                dense
                @filter="filtrarClientes"
                :rules="[(val) => !!val || 'Campo requerido']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"> No hay resultados </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Sucursal -->
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-select
                v-model="sucursalSeleccionada"
                label="Sucursal*"
                :options="sucursalesOptions"
                option-label="label"
                option-value="value"
                outlined
                dense
                :rules="[(val) => !!val || 'Campo requerido']"
                :disable="!clienteSeleccionado"
              />
            </div>
          </div>

          <div class="row q-mt-md justify-center">
            <div class="col-auto">
              <q-btn type="submit" color="primary" label="Generar Reporte" class="q-mr-sm" />
              <q-btn
                color="primary"
                label="Vista Previa"
                @click="mostrarVistaPrevia"
                :disable="!datosFiltrados || datosFiltrados.length === 0"
              />
            </div>
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
            row-key="id"
            flat
            bordered
            :loading="cargando"
            :pagination="paginacion"
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
    <q-dialog v-model="modalVisible" full-width maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista Previa del Reporte</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div id="reportePDF">
            <div class="invoice overflow-auto">
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
                      <h6 class="text-center">
                        <strong>REPORTE DE ÍNDICE DE ROTACIÓN POR CLIENTE</strong>
                      </h6>
                      <div class="col-form-label text-center">
                        Entre <span>{{ formatearFecha(fechaInicio) }}</span> Y
                        <span>{{ formatearFecha(fechaFin) }}</span>
                      </div>
                    </div>

                    <div class="col text-right">
                      <img :src="empresa.logo" width="130" height="130" />
                    </div>
                  </div>
                </header>

                <main>
                  <div class="row contacts">
                    <div class="col invoice-to">
                      <div class="text-gray-light"><strong>DATOS DEL REPORTE:</strong></div>
                      <div class="to text-gray-light">
                        <strong>Razón Social y Sucursal</strong>: {{ clienteSeleccionado?.label }} /
                        {{ sucursalSeleccionada?.label }}
                      </div>
                      <div class="date">
                        <strong>Fecha de Impresión:</strong> {{ formatearFecha(fechaActual) }}
                      </div>
                    </div>
                    <div class="col invoice-details">
                      <div class="text-gray-light"><strong>DATOS DEL ENCARGADO:</strong></div>
                      <div class="text-gray-light">{{ usuario.nombre }}</div>
                      <div class="date">{{ usuario.cargo }}</div>
                    </div>
                  </div>

                  <q-table
                    :rows="datosFiltrados"
                    :columns="columnasPDF"
                    row-key="id"
                    flat
                    bordered
                    hide-pagination
                  >
                    <template v-slot:body-cell-rotacion="props">
                      <q-td :props="props">
                        {{ calcularRotacion(props.row) }}
                      </q-td>
                    </template>
                  </q-table>
                </main>
              </div>
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
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { date } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()
    const { formatDate } = date

    // Datos del usuario y empresa
    const usuario = ref({})
    const empresa = ref({})

    // Estado del componente
    const cargando = ref(false)
    const modalVisible = ref(false)
    const fechaInicio = ref('')
    const fechaFin = ref('')
    const fechaActual = ref(new Date())
    const clienteSeleccionado = ref(null)
    const sucursalSeleccionada = ref(null)
    const datosOriginales = ref([])
    const datosFiltrados = ref([])
    const clientesOptions = ref([])
    const clientesOriginal = ref([])
    const sucursalesOptions = ref([])

    // Columnas de la tabla
    const columnas = [
      {
        name: 'numero',
        label: 'N°',
        field: (row) => datosFiltrados.value.indexOf(row) + 1,
        align: 'left',
      },
      { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
      { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
      { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
      { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
      { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
      { name: 'cantidadVentas', label: 'Cant. Ventas', field: 'cantidadventas', align: 'right' },
      { name: 'inventarioExterno', label: 'Inv. Externo', field: 'cantidadIE', align: 'right' },
      {
        name: 'rotacion',
        label: 'Rotación',
        field: (row) => calcularRotacion(row),
        align: 'right',
      },
    ]

    const columnasPDF = [
      {
        name: 'numero',
        label: 'N°',
        field: (row) => datosFiltrados.value.indexOf(row) + 1,
        align: 'left',
      },
      { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
      { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
      { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
      { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
      { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
      { name: 'cantidadVentas', label: 'Cant. Ventas', field: 'cantidadventas', align: 'right' },
      { name: 'inventarioExterno', label: 'Inv. Externo', field: 'cantidadIE', align: 'right' },
      {
        name: 'rotacion',
        label: 'Rotación',
        field: (row) => calcularRotacion(row),
        align: 'right',
      },
    ]

    const paginacion = {
      rowsPerPage: 10,
    }

    // Funciones de formato
    const formatearFecha = (fecha) => {
      if (!fecha) return ''
      return formatDate(fecha, 'DD/MM/YYYY')
    }

    const redondear = (valor, decimales = 2) => {
      return Number(valor.toFixed(decimales))
    }

    // Cálculo de rotación
    const calcularRotacion = (item) => {
      if (!fechaInicio.value || !fechaFin.value) return 0

      const date1 = new Date(fechaInicio.value)
      const date2 = new Date(fechaFin.value)

      date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset())
      date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset())

      const differences = date2.getTime() - date1.getTime()
      const days = differences / (1000 * 3600 * 24) + 1

      return redondear((item.cantidadventas - item.cantidadIE) / days)
    }

    // Cargar datos iniciales
    const cargarDatosIniciales = async () => {
      try {
        // Obtener datos del usuario (simulado)
        const response = await api.get('/usuario/actual')
        usuario.value = response.data.usuario
        empresa.value = response.data.empresa

        // Cargar lista de clientes
        await cargarClientes()

        // Establecer fecha actual como fecha final por defecto
        fechaActual.value = new Date()
        fechaFin.value = formatDate(fechaActual.value, 'YYYY-MM-DD')

        // Establecer fecha inicial como 30 días antes
        const fechaInicial = new Date(fechaActual.value)
        fechaInicial.setDate(fechaInicial.getDate() - 30)
        fechaInicio.value = formatDate(fechaInicial, 'YYYY-MM-DD')
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar datos iniciales',
        })
      }
    }

    // Cargar lista de clientes
    const cargarClientes = async () => {
      try {
        const response = await api.get(`/api/listaCliente/${empresa.value.idempresa}`)
        clientesOriginal.value = response.data.map((cliente) => ({
          label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial}`,
          value: cliente.id,
          data: cliente,
        }))
        clientesOptions.value = [...clientesOriginal.value]
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar la lista de clientes',
        })
      }
    }

    // Filtrar clientes en el select
    const filtrarClientes = (val, update) => {
      if (val === '') {
        update(() => {
          clientesOptions.value = clientesOriginal.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        clientesOptions.value = clientesOriginal.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1,
        )
      })
    }

    // Cargar sucursales cuando se selecciona un cliente
    const cargarSucursales = async (idCliente) => {
      try {
        const response = await api.get(`/api/listaSucursal/${idCliente}`)
        sucursalesOptions.value = response.data.map((sucursal) => ({
          label: sucursal.nombre,
          value: sucursal.id,
        }))
      } catch (error) {
        console.error('Error al cargar sucursales:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar las sucursales del cliente',
        })
      }
    }

    // Generar reporte
    const generarReporte = async () => {
      if (!validarFormulario()) return

      cargando.value = true

      try {
        const params = {
          fechaInicio: fechaInicio.value,
          fechaFin: fechaFin.value,
          idCliente: clienteSeleccionado.value.value,
          idSucursal: sucursalSeleccionada.value.value,
        }

        const response = await api.get('/api/reporteindicerotacioncliente', { params })

        datosOriginales.value = response.data
        datosFiltrados.value = [...response.data]

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

    // Validar formulario antes de generar reporte
    const validarFormulario = () => {
      if (!fechaInicio.value || !fechaFin.value) {
        $q.notify({
          type: 'warning',
          message: 'Debe seleccionar ambas fechas',
        })
        return false
      }

      if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
        $q.notify({
          type: 'warning',
          message: 'La fecha de inicio no puede ser mayor que la fecha de fin',
        })
        return false
      }

      if (!clienteSeleccionado.value) {
        $q.notify({
          type: 'warning',
          message: 'Debe seleccionar un cliente',
        })
        return false
      }

      if (!sucursalSeleccionada.value) {
        $q.notify({
          type: 'warning',
          message: 'Debe seleccionar una sucursal',
        })
        return false
      }

      return true
    }

    // Mostrar vista previa del PDF
    const mostrarVistaPrevia = () => {
      if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
        $q.notify({
          type: 'warning',
          message: 'No hay datos para mostrar en el reporte',
        })
        return
      }

      modalVisible.value = true
    }

    // Descargar PDF
    const descargarPDF = () => {
      // Implementar lógica para generar PDF usando html2pdf o similar
      $q.notify({
        type: 'info',
        message: 'Función de descarga de PDF en desarrollo',
      })
    }

    // Watchers
    watch(clienteSeleccionado, (newVal) => {
      if (newVal) {
        sucursalSeleccionada.value = null
        cargarSucursales(newVal.value)
      }
    })

    // Cargar datos al montar el componente
    onMounted(() => {
      cargarDatosIniciales()
    })

    return {
      // Estado
      usuario,
      empresa,
      cargando,
      modalVisible,
      fechaInicio,
      fechaFin,
      fechaActual,
      clienteSeleccionado,
      sucursalSeleccionada,
      datosFiltrados,
      clientesOptions,
      sucursalesOptions,
      columnas,
      columnasPDF,
      paginacion,

      // Métodos
      formatearFecha,
      redondear,
      calcularRotacion,
      filtrarClientes,
      generarReporte,
      mostrarVistaPrevia,
      descargarPDF,
    }
  },
}
</script>

<style scoped>
.invoice {
  background: #fff;
  padding: 20px;
}

.invoice header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #3989c6;
}

.invoice .company-details {
  text-align: right;
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
  padding: 8px;
  border: 1px solid #ddd;
}

.text-gray-light {
  color: #777;
}
</style>
