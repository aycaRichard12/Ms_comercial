<template>
  <q-page class="q-pa-md">
    <!-- Contenedor principal -->
    <div v-if="vistaActiva === 'principal'">
      <!-- Filtros y botones superiores -->
      <div class="row q-col-gutter-x-md q-mb-md">
        <div class="col-12 col-md-3">
          <label for="almacen">Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="opcionesAlmacenes"
            id="almacen"
            dense
            outlined
            style="min-width: 200px"
            @update:model-value="filtrarDatos"
            map-options
            class="q-mr-sm"
            clearable
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="estado">Estado</label>
          <q-select
            v-model="filtroEstado"
            :options="opcionesEstados"
            id="estado"
            dense
            outlined
            @update:model-value="filtrarDatos"
            map-options
            clearable
          />
        </div>

        <div class="col-12 col-md-6">
          <div class="row q-col-gutter-x-md">
            <div class="col-6">
              <label for="filtrarpor">Filtrar por...</label>
              <q-select
                v-model="columnaFiltro"
                :options="opcionesColumnas"
                id="filtrarpor"
                dense
                outlined
                map-options
                clearable
              />
            </div>
            <div class="col-6">
              <label for="buscar">Buscar...</label>
              <q-input
                v-model="textoBusqueda"
                id="buscar"
                dense
                outlined
                clearable
                @update:model-value="filtrarTabla"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla principal -->
      <q-table
        title="Cuentas por Cobrar"
        :rows="datosFiltrados"
        :columns="columnas"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 8 }"
        :loading="cargando"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <div class="q-gutter-sm">
              <q-btn
                v-if="Number(privilegios[1]) !== 0 && [1, 3].includes(Number(props.row.estado))"
                icon="add_circle"
                color="primary"
                round
                @click="cargarFormulario(props.row)"
                title="Registrar cobro"
              />
              <!-- <span class="text-caption q-ml-sm">
                Condition:
                {{ privilegios[1] !== 0 && [1, 3].includes(props.row.estado) }} (Privilege[1]:
                {{ privilegios[1] }}, Estado: {{ props.row.estado }})
              </span> -->
              <q-btn
                icon="list_alt"
                color="info"
                round
                @click="mostrarDetalles(props.row)"
                title="Ver listado de cobros"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Formulario de registro -->
    <q-dialog v-model="mostrarForm" persistent>
      <q-card style="min-width: 1500px">
        <q-card-section>
          <div class="text-h6">Registrar Cobro</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="registrarCobro">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model="formulario.cliente" label="Cliente" readonly />

                <q-input v-model="formulario.sucursal" label="Sucursal" readonly />

                <q-input v-model="formulario.deudaTotal" label="Total venta" readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>

                <q-input v-model="formulario.saldoPendiente" label="Saldo" readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>

                <q-input v-model="formulario.cuotasPendientes" label="Cuotas pendientes" readonly />

                <q-input v-model="formulario.valorCuota" label="Cuota individual" readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>

              <div class="col-6">
                <q-input
                  v-model="formulario.fecha"
                  label="Fecha"
                  type="date"
                  :rules="[(val) => !!val || 'Campo requerido']"
                />

                <q-input
                  v-model="formulario.numeroCobros"
                  label="N° Cobros"
                  :rules="[
                    (val) => !!val || 'Campo requerido',
                    (val) =>
                      val <= formulario.cuotasPendientes ||
                      'No puede ser mayor a cuotas pendientes',
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  @update:model-value="calcularTotales"
                />

                <q-input
                  v-model="formulario.totalCobro"
                  label="Total a Cobrar"
                  :rules="[
                    (val) => !!val || 'Campo requerido',
                    (val) =>
                      val <= parseFloat(formulario.saldoPendiente) || 'No puede ser mayor al saldo',
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  @update:model-value="calcularNumeroCobros"
                >
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>

                <q-input v-model="formulario.saldoPorCobrar" label="Saldo por Cobrar" readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>

                <q-file
                  v-model="formulario.comprobante"
                  label="Comprobante (JPG, JPEG, PNG)"
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="convertirImagen"
                />
              </div>
            </div>

            <div class="q-mt-md text-center">
              <q-btn label="Registrar" type="submit" color="primary" />
              <q-btn
                label="Cancelar"
                color="negative"
                flat
                @click="cerrarFormulario"
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Vista de detalles -->
    <div v-if="vistaActiva === 'detalles'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <q-btn
            label="Volver"
            icon="arrow_back"
            color="primary"
            @click="vistaActiva = 'principal'"
          />
        </div>
        <div class="col text-center">
          <div class="text-h6">Detalle de Cobros Realizados</div>
        </div>
        <div class="col"></div>
      </div>

      <q-table
        :rows="detallesCobros"
        :columns="columnasDetalles"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template v-slot:body-cell-comprobante="props">
          <q-td :props="props">
            <q-img
              :src="props.value"
              style="width: 50px; height: 50px; cursor: pointer"
              @click="mostrarImagen(props.value)"
            />
          </q-td>
        </template>
      </q-table>

      <div class="row q-mt-md">
        <div class="col-8"></div>
        <div class="col-4">
          <q-markup-table flat bordered>
            <tbody>
              <tr>
                <td class="text-right">Total Venta</td>
                <td>{{ formatoMoneda(detalleSeleccionado.totalVenta) }}</td>
              </tr>
              <tr>
                <td class="text-right">Total Cobrado</td>
                <td>{{ formatoMoneda(totalCobrado) }}</td>
              </tr>
              <tr>
                <td class="text-right">Saldo</td>
                <td>{{ formatoMoneda(detalleSeleccionado.saldo) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>

    <!-- Diálogo para mostrar imagen -->
    <q-dialog v-model="mostrarDialogoImagen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Comprobante de Cobro</div>
        </q-card-section>
        <q-card-section class="text-center">
          <q-img :src="imagenSeleccionada" style="max-width: 600px; max-height: 600px" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch'
import { URL_APICM } from 'src/composables/services'
import { obtenerFechaActualDato, validarUsuario } from 'src/composables/FuncionesG'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { redondear } from 'src/composables/FuncionesG'
import { decimas } from 'src/composables/FuncionesG'
import { obtenerFechaActual } from 'src/composables/FuncionesG'
import { convertirImagenUtil } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'

export default {
  props: {
    codigo: {
      type: String,
      required: true,
    },
    permisos: {
      type: String,
      required: true,
    },
    menuprimario: {
      type: String,
      required: true,
    },
    menusegundario: {
      type: String,
      required: true,
    },
    refrescar: {
      type: String,
      required: true,
    },
  },

  setup() {
    const $q = useQuasar()
    const privilegios = ['1', '1', '1', '1']
    const vistaActiva = ref('principal')
    const mostrarForm = ref(false)
    const cargando = ref(false)
    const mostrarDialogoImagen = ref(false)
    const imagenSeleccionada = ref('')
    const divisa = ref('$') // Se actualizará con cargarDivisas

    // Filtros
    const filtroAlmacen = ref({ value: 0, label: 'Todos los almacenes' })
    const filtroEstado = ref({ value: 0, label: 'Todos' })
    const columnaFiltro = ref({ value: 0, label: 'Todo' })
    const textoBusqueda = ref('')

    // Datos
    const datosOriginales = ref([])
    const detallesCobros = ref([])
    const opcionesAlmacenes = ref([])
    const detalleSeleccionado = ref({
      id: null,
      totalVenta: 0,
      saldo: 0,
    })

    // Formulario
    const formulario = ref({
      idCredito: null,
      cliente: '',
      sucursal: '',
      deudaTotal: '0.00',
      saldoPendiente: '0.00',
      cuotasPendientes: 0,
      valorCuota: '0.00',
      fecha: obtenerFechaActual(),
      numeroCobros: 0,
      totalCobro: '0.00',
      saldoPorCobrar: '0.00',
      comprobante: null,
      imagenConvertida: null,
    })

    // Columnas de la tabla principal
    const columnas = [
      { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
      { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
      { name: 'factura', label: 'N° Factura', field: 'nfactura', align: 'center' },
      {
        name: 'fecha',
        label: 'Fecha Crédito',
        field: 'fechaventa',
        align: 'center',
        format: (val) => (val ? cambiarFormatoFecha(val) : ''),
      },
      {
        name: 'vencimiento',
        label: 'Vencimiento',
        field: 'fechalimite',
        align: 'center',
        format: (val) => (val ? cambiarFormatoFecha(val) : ''),
      },
      { name: 'cuotas', label: 'N° Cuotas', field: 'ncuotas', align: 'center' },
      {
        name: 'cuotasProcesadas',
        label: 'Cuotas Procesadas',
        field: (row) => row.cuotaspagas || 0,
        align: 'center',
      },
      {
        name: 'totalVenta',
        label: 'Total Venta',
        field: 'ventatotal',
        align: 'right',
        format: (val) => decimas(redondear(parseFloat(val))),
      },
      {
        name: 'totalCobrado',
        label: 'Total Cobrado',
        field: (row) => row.totalcobrado || 0,
        align: 'right',
        format: (val) => decimas(redondear(parseFloat(val))),
      },
      {
        name: 'saldo',
        label: 'Saldo',
        field: 'saldo',
        align: 'right',
        format: (val) => decimas(redondear(parseFloat(val))),
      },
      { name: 'estado', label: 'Estado', field: (row) => estados[row.estado], align: 'center' },
      { name: 'opciones', label: 'Opciones', field: '', align: 'center' },
    ]

    // Columnas de la tabla de detalles
    const columnasDetalles = [
      { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
      { name: 'fecha', label: 'Fecha de cobro', field: 'fecha', align: 'center' },
      {
        name: 'cuotas',
        label: 'N° cobros',
        field: 'ncuotas',
        align: 'center',
        format: (val) => decimas(val),
      },
      { name: 'comprobante', label: 'Comprobante', field: 'imagen', align: 'center' },
      {
        name: 'monto',
        label: 'Total cobro',
        field: 'monto',
        align: 'right',
        format: (val) => decimas(redondear(parseFloat(val))),
      },
    ]

    // Opciones para filtros
    const opcionesEstados = [
      { value: 0, label: 'Todos' },
      { value: 1, label: 'Activos' },
      { value: 2, label: 'Finalizados' },
      { value: 3, label: 'Atrasados' },
      { value: 4, label: 'Anulados' },
    ]

    const opcionesColumnas = [
      { value: 0, label: 'Todo' },
      { value: 1, label: 'Cliente' },
      { value: 2, label: 'N° factura' },
      { value: 3, label: 'Fecha crédito' },
      { value: 4, label: 'Vencimiento' },
      { value: 5, label: 'N° cuotas' },
      { value: 6, label: 'N° cuotas Procesadas' },
      { value: 7, label: 'Total venta' },
      { value: 8, label: 'Total cobrado' },
      { value: 9, label: 'Saldo' },
      { value: 10, label: 'Estado' },
    ]

    const estados = {
      1: 'Activo',
      2: 'Finalizado',
      3: 'Atrasado',
      4: 'Anulado',
    }

    // Computed
    // const datosFiltrados = computed(() => {
    //   let datos = [...datosOriginales.value]
    //   console.datos
    //   console.log(filtroAlmacen.value?.value)

    //   // Aplicar filtros
    //   if (Number(filtroAlmacen.value?.value) !== 0) {
    //     datos = datos.filter(
    //       (item) => Number(item.idalmacen) === Number(filtroAlmacen.value?.value),
    //     )
    //   }

    //   console.log(filtroEstado.value?.value)
    //   if (Number(filtroEstado.value?.value) !== 0) {
    //     datos = datos.filter((item) => Number(item.estado) === Number(filtroEstado.value?.value))
    //   }

    //   // Aplicar búsqueda
    //   console.log(textoBusqueda.value)
    //   // ... (previous code)

    //   if (textoBusqueda.value && textoBusqueda.value.trim() !== '') {
    //     const texto = textoBusqueda.value.toLowerCase()
    //     const columna = columnaFiltro.value
    //     console.log('Texto de búsqueda:', texto)
    //     console.log('Columna seleccionada:', columna)
    //     console.log('Array de columnas:', columnas) // Add this line to inspect 'columnas'

    //     datos = datos.filter((item) => {
    //       if (columna === 0) {
    //         // Buscar en todas las columnas
    //         return Object.values(item).some((val) => String(val).toLowerCase().includes(texto))
    //       } else {
    //         // Crucial check: Ensure columnas exists and the index is valid
    //         if (!columnas || !columnas[columna]) {
    //           console.error(
    //             `Error: La columna con índice ${columna} no existe en el array de columnas.`,
    //           )
    //           // You might want to return false here or handle this gracefully
    //           return false // Or handle this case based on your application's logic
    //         }

    //         // Buscar en la columna específica
    //         const campo = columnas[columna].field
    //         const value = typeof campo === 'function' ? campo(item) : item[campo]
    //         return String(value).toLowerCase().includes(texto)
    //       }
    //     })
    //   }

    //   // ... (rest of the code)
    //   // Agregar número de fila
    //   return datos.map((item, index) => ({
    //     ...item,
    //     numero: index + 1,
    //   }))
    // })
    const datosFiltrados = computed(() => {
      let datos = [...datosOriginales.value]
      // console.datos // This line seems like a typo, should probably be console.log(datos)
      console.log(filtroAlmacen.value?.value)

      // Aplicar filtros
      if (Number(filtroAlmacen.value?.value) !== 0) {
        datos = datos.filter(
          (item) => Number(item.idalmacen) === Number(filtroAlmacen.value?.value),
        )
      }

      console.log(filtroEstado.value?.value)
      if (Number(filtroEstado.value?.value) !== 0) {
        datos = datos.filter((item) => Number(item.estado) === Number(filtroEstado.value?.value))
      }

      // Aplicar búsqueda
      console.log(textoBusqueda.value)
      if (textoBusqueda.value && textoBusqueda.value.trim() !== '') {
        const texto = textoBusqueda.value.toLowerCase()
        // FIX IS HERE: Access the 'value' property
        const columna = columnaFiltro.value?.value
        console.log('Texto de búsqueda:', texto)
        console.log('Columna seleccionada (index):', columna) // Log the actual index now
        console.log('Array de columnas:', columnas) // Keep this for debugging 'columnas' array itself

        datos = datos.filter((item) => {
          if (columna === 0) {
            // Buscar en todas las columnas
            return Object.values(item).some((val) => String(val).toLowerCase().includes(texto))
          } else {
            // Add safety checks for `columnas` and `columna` just in case, though the primary issue is resolved
            if (!columnas || !columnas[columna]) {
              console.error(
                `Error: La columna con índice ${columna} no existe en el array de columnas.`,
              )
              return false // Prevent further errors and exclude this item
            }

            // Buscar en la columna específica
            const campo = columnas[columna].field
            const value = typeof campo === 'function' ? campo(item) : item[campo]
            return String(value).toLowerCase().includes(texto)
          }
        })
      }
      return processDataWithTotals(datos)

      // Agregar número de fila
    })

    const processDataWithTotals = (data) => {
      if (data.length === 0) return []

      const numberedData = data.map((row, index) => ({
        ...row,
        numero: index + 1,
      }))

      const totales = {
        cuotasProcesadas: numberedData.reduce((sum, u) => sum + Number(u.cuotasProcesadas || 0), 0),
        totalVenta: numberedData.reduce((sum, u) => sum + Number(u.totalVenta || 0), 0),
        totalCobrado: numberedData.reduce((sum, u) => sum + Number(u.totalCobrado || 0), 0),
      }

      return [...numberedData, totales]
    }
    const totalCobrado = computed(() => {
      return detallesCobros.value.reduce((total, item) => {
        return total + parseFloat(item.monto || 0)
      }, 0)
    })

    // Métodos
    const cargarDatos = async () => {
      cargando.value = true
      try {
        const contenidousuario = validarUsuario()
        const idempresa = contenidousuario[0]?.empresa?.idempresa

        // const response = await api.get(`listacuentasxcobrar/${idempresa}`)
        // console.log(response)
        // const res = response.data
        // console.log(res)
        // const data = await response.json()

        // const response = await fetch(`${URL_APICM}api/listacuentasxcobrar/${idempresa}`)
        // if (!response.ok) throw new Error('Error al cargar datos')

        //const data = await response.json()
        const response = await api.get(`listacuentasxcobrar/${idempresa}`)
        console.log(response)
        const data = response.data
        console.log(data)
        if (data.estado === 'error') throw new Error(data.error)

        await actualizarEstados(data)
        datosOriginales.value = data
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `Error al cargar datos: ${error.message}`,
        })
      } finally {
        cargando.value = false
      }
    }

    const actualizarEstados = async (data) => {
      const use = data.filter((u) => u.estado == 1 && u.saldo != 0 && u.estadoventa == 1)

      const promises = use.map(async (key) => {
        let fecha1 = new Date()
        let fecha2 = new Date(key.fechalimite)
        fecha1 = Math.floor(fecha1.getTime() / (1000 * 3600 * 24))
        fecha2 = Math.floor(fecha2.getTime() / (1000 * 3600 * 24))

        if (fecha1 > fecha2 && key.saldo > 0 && key.estado != 3 && key.estadoventa == 1) {
          await cambiarEstado(key.id, 3)
        }
      })

      await Promise.all(promises)
    }

    const cambiarEstado = async (id, code) => {
      try {
        const resp = await fetch(`${URL_APICM}api/cambiarcreditomoroso/${id}/${code}`)
        const data = await resp.json()
        console.log(data)
      } catch (error) {
        console.error('Error al cambiar estado:', error)
      }
    }

    const cargarAlmacenes = async () => {
      try {
        const contenidousuario = validarUsuario()
        const idempresa = contenidousuario[0]?.empresa?.idempresa
        const idusuario = contenidousuario[0]?.idusuario

        const resultado = await peticionGET(`${URL_APICM}api/listaResponsableAlmacen/${idempresa}`)

        if (resultado[0] == 'error') {
          throw new Error(resultado.error)
        }

        opcionesAlmacenes.value = [
          { value: 0, label: 'Todos los almacenes' },
          ...resultado
            .filter((u) => u.idusuario == idusuario)
            .map((key) => ({
              value: key.idalmacen,
              label: key.almacen,
            })),
        ]
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `Error al cargar almacenes: ${error.message}`,
        })
      }
    }

    const mostrarFormulario = () => {
      formulario.value = {
        idCredito: null,
        cliente: '',
        sucursal: '',
        deudaTotal: '0.00',
        saldoPendiente: '0.00',
        cuotasPendientes: 0,
        valorCuota: '0.00',
        fecha: obtenerFechaActual(),
        numeroCobros: 0,
        totalCobro: '0.00',
        saldoPorCobrar: '0.00',
        comprobante: null,
        imagenConvertida: null,
      }
      mostrarForm.value = true
    }

    const cargarFormulario = (dato) => {
      formulario.value = {
        idCredito: dato.id,
        cliente: dato.cliente,
        sucursal: dato.sucursal,
        deudaTotal: decimas(dato.ventatotal),
        saldoPendiente: decimas(dato.saldo),
        cuotasPendientes: parseFloat(dato.ncuotas) - parseFloat(dato.cuotaspagas || 0),
        valorCuota: decimas(dato.valorcuota),
        fecha: obtenerFechaActualDato(),
        numeroCobros: 0,
        totalCobro: '0.00',
        saldoPorCobrar: '0.00',
        comprobante: null,
        imagenConvertida: null,
      }

      // Si solo queda 1 cuota pendiente
      if (formulario.value.cuotasPendientes === 1) {
        formulario.value.numeroCobros = 1
        formulario.value.totalCobro = decimas(
          redondear(parseFloat(formulario.value.saldoPendiente)),
        )
        formulario.value.saldoPorCobrar = 0
      }

      mostrarForm.value = true
    }

    const calcularTotales = () => {
      const numCobros = parseFloat(formulario.value.numeroCobros || 0)
      const valorCuota = parseFloat(formulario.value.valorCuota || 0)
      const saldoPendiente = parseFloat(formulario.value.saldoPendiente || 0)

      if (numCobros <= formulario.value.cuotasPendientes) {
        if (numCobros === formulario.value.cuotasPendientes) {
          formulario.value.totalCobro = decimas(redondear(saldoPendiente))
          formulario.value.saldoPorCobrar = 0
        } else {
          formulario.value.totalCobro = decimas(redondear(numCobros * valorCuota))
          formulario.value.saldoPorCobrar = decimas(
            redondear(saldoPendiente - numCobros * valorCuota),
          )
        }
      } else {
        $q.notify({
          type: 'warning',
          message: 'El N°Cobros no puede ser mayor a los cobros pendientes',
        })
        formulario.value.numeroCobros = 0
        formulario.value.totalCobro = '0.00'
      }
    }

    const calcularNumeroCobros = () => {
      const totalCobro = parseFloat(formulario.value.totalCobro || 0)
      const saldoPendiente = parseFloat(formulario.value.saldoPendiente || 0)
      const valorCuota = parseFloat(formulario.value.valorCuota || 0)

      if (totalCobro > saldoPendiente) {
        formulario.value.totalCobro = '0.00'
        formulario.value.numeroCobros = 0
        formulario.value.saldoPorCobrar = 0

        $q.notify({
          type: 'warning',
          message: 'El monto ingresado no puede ser mayor al saldo pendiente',
        })

        if (formulario.value.cuotasPendientes === 1) {
          formulario.value.totalCobro = formulario.value.saldoPendiente
          formulario.value.numeroCobros = formulario.value.cuotasPendientes
          formulario.value.saldoPorCobrar = 0
        }
      } else {
        if (totalCobro === saldoPendiente) {
          formulario.value.totalCobro = formulario.value.saldoPendiente
          formulario.value.saldoPorCobrar = decimas(0)
          formulario.value.numeroCobros = formulario.value.cuotasPendientes
        } else {
          if (totalCobro <= valorCuota) {
            formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - totalCobro))
            formulario.value.numeroCobros = 1
          } else {
            const nrocuotas = Math.floor(totalCobro / valorCuota)
            formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - totalCobro))
            formulario.value.numeroCobros = nrocuotas
          }
        }
      }
    }

    const convertirImagen = async (file) => {
      if (!file) {
        formulario.value.imagenConvertida = null
        return
      }

      try {
        const imagen = await convertirImagenUtil(file)
        formulario.value.imagenConvertida = imagen
      } catch (error) {
        console.log('error al convertir en imagen', error)
        $q.notify({
          type: 'negative',
          message: 'Error al procesar la imagen',
        })
      }
    }

    const registrarCobro = async () => {
      if (parseFloat(formulario.value.saldoPorCobrar) < 0) {
        $q.notify({
          type: 'negative',
          message: 'No se calculó el saldo por cobrar, inténtelo nuevamente',
        })
        return
      }

      try {
        const datos = new FormData()
        datos.append('ver', 'registroPagoCuentaxCobrar')
        datos.append('idestadocobro', formulario.value.idCredito)
        datos.append('ncuotas', formulario.value.numeroCobros)
        datos.append('total', formulario.value.totalCobro)
        datos.append('saldo', formulario.value.saldoPorCobrar)
        datos.append('fecha', formulario.value.fecha)

        if (formulario.value.imagenConvertida) {
          datos.append('imagen', formulario.value.imagenConvertida)
        } else {
          datos.append('imagen', '')
        }

        // const response = await fetch(`${URL_APICM}api/`, {
        //   method: 'POST',
        //   body: datos,
        // })
        const response = await api.post(``, datos) // Replace with your actual API endpoint
        console.log(response)

        const data = response.data

        if (data.estado === 'exito') {
          $q.notify({
            type: 'positive',
            message: 'Cobro registrado correctamente',
          })
          cargarDatos()
          cerrarFormulario()
        } else {
          throw new Error(data.mensaje || 'Error al registrar el cobro')
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `Error al registrar el cobro: ${error.message}`,
        })
      }
    }

    const cerrarFormulario = () => {
      mostrarForm.value = false
    }

    const mostrarDetalles = async (dato) => {
      detalleSeleccionado.value = {
        id: dato.id,
        totalVenta: dato.ventatotal,
        saldo: dato.saldo,
      }

      try {
        const response = await fetch(`${URL_APICM}api/listadetallecobros/${dato.id}`)
        if (!response.ok) throw new Error('Error al cargar detalles')

        const data = await response.json()
        if (data.estado === 'error') throw new Error(data.error)

        detallesCobros.value = data.map((item, index) => ({
          ...item,
          numero: index + 1,
          imagen: `${URL_APICM}api/${item.imagen}`,
        }))

        vistaActiva.value = 'detalles'
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: `Error al cargar detalles: ${error.message}`,
        })
      }
    }

    const mostrarImagen = (imagen) => {
      imagenSeleccionada.value = imagen
      mostrarDialogoImagen.value = true
    }

    const filtrarDatos = () => {
      console.log(filtroAlmacen.value)
      console.log(filtroEstado.value)
      console.log(columnaFiltro.value)
    }

    const filtrarTabla = () => {
      // Los computed properties ya manejan la búsqueda
    }

    const formatoMoneda = (valor) => {
      return decimas(redondear(parseFloat(valor || 0)))
    }

    // Inicialización
    onMounted(() => {
      cargarDatos()
      cargarAlmacenes()
      // Aquí deberías cargar la divisa con cargarDivisas()
    })

    return {
      privilegios,
      vistaActiva,
      mostrarForm,
      cargando,
      mostrarDialogoImagen,
      imagenSeleccionada,
      divisa,
      filtroAlmacen,
      filtroEstado,
      columnaFiltro,
      textoBusqueda,
      datosFiltrados,
      detallesCobros,
      opcionesAlmacenes,
      detalleSeleccionado,
      formulario,
      columnas,
      columnasDetalles,
      opcionesEstados,
      opcionesColumnas,
      totalCobrado,
      mostrarFormulario,
      cargarFormulario,
      calcularTotales,
      calcularNumeroCobros,
      convertirImagen,
      registrarCobro,
      cerrarFormulario,
      mostrarDetalles,
      mostrarImagen,
      filtrarDatos,
      filtrarTabla,
      formatoMoneda,
    }
  },
}
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>
