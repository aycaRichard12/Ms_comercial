<template>
  <q-page class="q-pa-md">
    <div class="forms">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <q-btn
            label="Volver"
            icon="arrow_back"
            color="primary"
            size="sm"
            @click="$emit('volver')"
            class="q-mr-sm"
          />
          <q-btn label="Inicio" icon="home" color="primary" size="sm" @click="handleContinue" />
        </div>
        <div class="col-12 col-sm-8 text-center">
          <h4>COMPROBANTE DE VENTA</h4>
        </div>
      </div>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <!-- Client Field -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="formData.cliente"
              label="Cliente*"
              :options="filteredClients"
              option-label="label"
              option-value="value"
              use-input
              emit-value
              map-options
              @filter="filterClients"
              @update:model-value="actualizarSucursales"
              :rules="[(val) => !!val || 'Seleccione un cliente']"
              filled
              clearable
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Branch Field -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="formData.sucursal"
              label="Sucursal*"
              :options="branchOptions"
              option-label="label"
              option-value="value"
              :disable="!formData.cliente"
              required
              filled
            />
          </div>

          <!-- Date Field -->
          <div class="col-12 col-md-4">
            <q-input v-model="formData.fecha" label="Fecha*" type="date" required filled />
          </div>

          <!-- Sales Channel -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="formData.canal"
              label="Canal de venta*"
              :options="salesChannels"
              option-label="label"
              option-value="value"
              required
              filled
            />
          </div>

          <!-- Credit Checkbox -->
          <div class="col-12 col-md-3">
            <q-toggle
              v-model="formData.credito"
              label="¿A crédito?"
              left-label
              @update:model-value="toggleCredit"
            />
          </div>

          <!-- Credit Section -->
          <div v-if="formData.credito" class="col-12">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.cantidadPagos"
                  label="Cantidad de pagos*"
                  type="number"
                  min="0"
                  required
                  filled
                  @update:model-value="calculatePayments"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.montoPagos"
                  label="Monto de pagos*"
                  :disable="!formData.credito"
                  filled
                >
                  <template v-slot:append>
                    <q-btn flat label="Bs" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.periodo"
                  label="Período establecido*"
                  :options="periodOptions"
                  option-label="label"
                  option-value="value"
                  required
                  filled
                  @update:model-value="calculateDueDate"
                />
              </div>

              <div v-if="formData.periodo === 0" class="col-12 col-md-4">
                <q-input
                  v-model="formData.plazoPersonalizado"
                  label="Plazo total (días)*"
                  type="number"
                  min="0"
                  required
                  filled
                  @update:model-value="calculateDueDate"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.fechaLimite"
                  label="Fecha límite*"
                  type="date"
                  filled
                  :disable="true"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col-12 text-right">
            <q-btn label="Registrar" type="submit" color="primary" />
          </div>
        </div>
      </q-form>
    </div>
  </q-page>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

// ====================== CONSTANTES Y UTILIDADES ======================
const ERROR_TYPES = {
  QUASAR: 'QUASAR_NOT_AVAILABLE',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

const CONSTANTES = {
  ver: 'registroVenta',
  idusuario: idusuario_md5(),
  idempresa: idempresa_md5(),
  tipoventa: 0,
  tipopago: 'contado',
}
console.log(CONSTANTES)
// ====================== QUASAR ======================
const $q = useQuasar()
if (!$q) {
  console.error('Error: Quasar no está disponible')
  throw new Error('Quasar instance not found')
}

// ====================== ESTADO REACTIVO ======================
const errorLog = ref([])
const formData = ref({
  cliente: null,
  sucursal: null,
  fecha: new Date().toISOString().slice(0, 10),
  canal: null,
  credito: false,
  cantidadPagos: 0,
  montoPagos: 0,
  periodo: null,
  plazoPersonalizado: 0,
  fechaLimite: '',
  tipoDocumento: null,
  numeroDocumento: '',
})

const clients = ref([])
const branches = ref([])
const salesChannels = ref([])
const clientFilter = ref('')

const periodOptions = [
  { label: 'Personalizado', value: 0 },
  { label: '15 días', value: 15 },
  { label: '30 días', value: 30 },
  { label: '60 días', value: 60 },
  { label: '90 días', value: 90 },
]

// ====================== COMPUTED ======================
const filteredClients = computed(() => {
  return clientFilter.value
    ? clients.value.filter((c) => c.label.toLowerCase().includes(clientFilter.value.toLowerCase()))
    : clients.value
})

const branchOptions = computed(() => {
  return formData.value.cliente
    ? branches.value.filter((b) => b.clientId === formData.value.cliente.value)
    : []
})

// ====================== FUNCIONES ======================
const validarUsuario = () => {
  const user = JSON.parse(localStorage.getItem('yofinanciero'))
  return user || (window.location.href = '/login')
}

const cargarCanales = async () => {
  try {
    const respuesta = await validarUsuario()
    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaCanalVenta/${idempresa}`)
    salesChannels.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}

const listaCLientes = async () => {
  try {
    const response = await validarUsuario()
    const idempresa = response[0]?.empresa?.idempresa

    if (idempresa) {
      const { data } = await api.get(`listaCliente/${idempresa}`)
      clients.value = data.map((cliente) => ({
        label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nit}`,
        value: cliente.id,
        originalData: cliente,
      }))
    }
  } catch (error) {
    showError('Error al cargar clientes', error)
  }
}

const actualizarSucursales = async (cliente) => {
  if (!cliente) return

  try {
    const { data } = await api.get(`listaSucursal/${cliente.value}`)
    branches.value = data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: cliente.value,
    }))

    formData.value.sucursal = branches.value[0] || null
  } catch (error) {
    showError('Error al cargar sucursales', error)
  }
}

const toggleCredit = (value) => {
  if (!value) {
    formData.value.cantidadPagos = 0
    formData.value.montoPagos = 0
    formData.value.periodo = null
    formData.value.plazoPersonalizado = 0
    formData.value.fechaLimite = ''
  }
}

const calculatePayments = () => {
  const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
  if (cartData.ventatotal && formData.value.cantidadPagos > 0) {
    formData.value.montoPagos = (cartData.ventatotal / formData.value.cantidadPagos).toFixed(2)
  }
}

const calculateDueDate = () => {
  if (!formData.value.credito) return

  const fecha = new Date(formData.value.fecha)
  const daysToAdd =
    formData.value.periodo === 0 ? formData.value.plazoPersonalizado : formData.value.periodo

  fecha.setDate(fecha.getDate() + daysToAdd)
  formData.value.fechaLimite = fecha.toISOString().slice(0, 10)
}
const onSubmit = async () => {
  let loadingShown = false
  try {
    const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')

    if (!formData.value.cliente) throw { message: 'Debe seleccionar un cliente' }
    if (!cartData.listaProductos?.length) throw { message: 'El carrito está vacío' }
    console.log(cartData)

    $q.loading.show({ message: 'Procesando venta...', timeout: 30000 })
    loadingShown = true

    const form = new FormData()
    form.append('ver', CONSTANTES.ver) // 3
    form.append('tipoventa', CONSTANTES.tipoventa) // 3
    form.append('idusuario', CONSTANTES.idusuario)
    form.append('idempresa', CONSTANTES.idempresa)
    form.append('idcliente', formData.value.cliente)
    form.append('sucursal', formData.value.sucursal.value)
    form.append('fecha', formData.value.fecha)
    form.append('canal', formData.value.canal.value)

    form.append('tipopago', CONSTANTES.tipopago) // 1 = contado, 2 = crédito (por ejemplo) procesar El formulariono existe

    form.append('jsonDetalles', JSON.stringify(cartData))

    // form.append('ver', 'registroVenta')
    // form.append('tipoventa', '0')
    // form.append('idusuario', '03afdbd66e7929b125f8597834fa83a4')
    // form.append('idempresa', 'c0c7c76d30bd3dcaefc96f40275bdc0a')
    // form.append('idcliente', '1012')
    // form.append('sucursal', '854')
    // form.append('fecha', '2025-04-11')
    // form.append('canal', '1')
    // form.append('tipopago', 'contado')

    // form.append(
    //   'jsonDetalles',
    //   '{"idalmacen":"72","codigosinsucursal":"0","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJjYjE2NDUzNTc4ZGRhYTgwNmFhMWEyNDcxMGYxZTI3OWQyODU1MGM5ZGE4MTAwNmVmNmIyYjU1YTI3MDc4ZDRjYzNjODkwZTU2NGIxZDVjNyIsImlhdCI6MTc0MjQ3NTY2NCwibmJmIjoxNzQyNDc1NjY0LCJleHAiOjE3NzQwMTE2NjQsInN1YiI6IiIsInNjb3BlcyI6W119.KFugkzjz4rXPCRsMl23sAIrDkYRuOwAJi9W0WUGg1XthO4ZvGJTsU-8ifEQYdudyIZ_b-zy49NL7fhbKoxtNVoBZbtuoYDTzCZN3Jb0Jsc3enVL_YezYr_5vA8qBBRvYdyihqTjvRQt9dYVP--QtrLp0qtQ8wP_vUyNTQh9POJUZhMd6EXjjxG_6tfgAzVOYbVty_WFU0xXDkReYLfphjqFRLPo-3vWlo5god5ixYMM55PWXLnz01bYlJREhJ-U-z46_klvgfAbdGs_EdIeBSUlYfXOn0NOWHP5Q6QlVt85ajFLByd1uv5jVW3IsDzrMkfvf1u-4YCeOkPFqU3WMvAia46nVjLnpfBNERqYEnlwmiMnNoZ2HDDiHDJyy7i8ADDGy_pS-i6SItZ6yE9Qk3MfX6xYO5bxBZXFpozSxLlVytk3qeq3tuBr9H_QXbW3G-yQzk2mHTK7iMRX8Lzm6uZuJed60MpnzekEiKQBNIWdYgp9v5BmvYHHRyvjoMn5cI2LV9RNJVKB11Z2tQHSeeY61bo9u3aGJ094v3BRpnRiIffJEP-7jo7zpvAxz3AS5bS_lFaOdfU2LboJSTAWVefTHw9JFnHnTRQZSBJ_EDqnOJrQhS6vjYa1zGtHti4Qs8U1U4cqcTn-pyzL0lqltfsdGbaBU5UE4RcsiB2eKzhs","tipo":"1","iddivisa":"8","idcampana":0,"ventatotal":"45.00","subtotal":"45.00","descuento":0,"nropagos":0,"valorpagos":0,"dias":0,"fechalimite":0,"listaProductos":[{"idproductoalmacen":"3334","cantidad":"9","precio":"5","idstock":"4984","idporcentaje":"138","candiponible":"39989","descripcion":"yogurt natural conservado","codigo":"Yo-0002"}],"listaProductosFactura":[{"codigoProducto":"Yo-0002","codigoActividadSin":"620100","codigoProductoSin":"991009","descripcion":"yogurt natural conservado","unidadMedida":"28","precioUnitario":"5","subTotal":"45.00","cantidad":"9","numeroSerie":"","montoDescuento":0,"numeroImei":"","codigoNandina":"85712757"}],"listaFactura":{"codigoPuntoVenta":"102","fechaEmision":"2025-04-11T16:36:28.334Z"}}',
    // )
    form.forEach((valor, clave) => {
      console.log(`${clave}: ${valor}`)
    })
    const response = await api.post('', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(response)
    if (!response.data || response.data.estado !== 'exito') {
      throw { message: response || 'Error al procesar la venta' }
    }
    $q.notify({ type: 'positive', message: 'Venta registrada con éxito' })
    handleContinue()
  } catch (error) {
    const errorType = error.type || ERROR_TYPES.API
    const loggedError = logError(errorType, error, {
      formData: JSON.parse(JSON.stringify(formData.value)),
      action: 'onSubmit',
      timestamp: new Date().toISOString(),
    })

    $q.notify({
      type: 'negative',
      message: getEnhancedErrorMessage(loggedError),
      timeout: 10000,
      actions: [
        {
          label: 'Detalles',
          handler: () => showDetailedErrorDialog(loggedError),
        },
      ],
    })
  } finally {
    if (loadingShown) $q.loading.hide()
  }
}

// const onSubmit = async () => {
//   let loadingShown = false

//   try {
//     if (!formData.value.cliente) {
//       throw {
//         type: ERROR_TYPES.VALIDATION,
//         message: 'Debe seleccionar un cliente',
//         fields: ['cliente'],
//       }
//     }

//     const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
//     if (!cartData.listaProductos || cartData.listaProductos.length === 0) {
//       throw {
//         type: ERROR_TYPES.VALIDATION,
//         message: 'El carrito está vacío. Agregue productos antes de registrar',
//       }
//     }

//     const ventaData = {
//       ...CONSTANTES,
//       clienteId: formData.value.cliente?.value || formData.value.cliente,
//       sucursalId: formData.value.sucursal?.value || formData.value.sucursal,
//       canalVenta: formData.value.canal?.value || formData.value.canal,
//       fecha: formData.value.fecha,
//       credito: formData.value.credito ? 1 : 0,
//       cantidadPagos: formData.value.cantidadPagos,
//       montoPagos: formData.value.montoPagos,
//       periodo: formData.value.periodo,
//       plazoPersonalizado: formData.value.plazoPersonalizado,
//       fechaLimite: formData.value.fechaLimite,
//       ...cartData,
//     }
//     console.log(ventaData)
//     $q.loading.show({ message: 'Procesando venta...', timeout: 30000 })
//     loadingShown = true

//     const response = await api.post('registrarVenta', ventaData).catch((error) => {
//       const apiError = error.response?.data || error
//       throw {
//         type: ERROR_TYPES.API,
//         message: apiError.message || 'Error en la conexión con el servidor',
//         code: apiError.code || error.response?.status,
//         details: apiError.errores || apiError.errors,
//         original: error,
//       }
//     })

//     if (!response.data || response.data.estado !== 'exito') {
//       throw {
//         type: ERROR_TYPES.API,
//         message: response.data?.mensaje || 'Error al procesar la venta',
//         errors: response.data?.errores || response.data?.errors,
//       }
//     }
//   } catch (error) {

//   } finally {
//     if (loadingShown) $q.loading.hide()
//   }
// }

// ====================== MANEJO DE ERRORES ======================
const getEnhancedErrorMessage = (error) => {
  return error.details
    ? `${error.message}: ${JSON.stringify(error.details)}`
    : error.message || 'Ocurrió un error al procesar la venta'
}

const showDetailedErrorDialog = (error) => {
  if (!$q.dialog) {
    console.warn('Dialog plugin no está disponible')
    console.log(error)
    return
  }

  $q.dialog({
    title: 'Detalles del error',
    message: `
      <div>
        <p><strong>Tipo:</strong> ${error.type}</p>
        <p><strong>Mensaje:</strong> ${error.message}</p>
        ${error.details ? `<p><strong>Detalles:</strong> ${JSON.stringify(error.details)}</p>` : ''}
        ${error.code ? `<p><strong>Código:</strong> ${error.code}</p>` : ''}
      </div>
    `,
    html: true,
    persistent: true,
  })
}

const showError = (message, error) => {
  console.error(message, error)
  $q.notify({
    type: 'negative',
    message: `${message}: ${error.message || 'Error desconocido'}`,
  })
}

const logError = (type, error, context = {}) => {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    type,
    message: error.message || 'Error desconocido',
    stack: error.stack,
    context,
    code: error.code || error.response?.status,
  }

  errorLog.value.push(errorEntry)
  console.error(`[${type}]`, errorEntry)
  return errorEntry
}

// ====================== UTILIDADES ======================
const resetForm = () => {
  formData.value = {
    cliente: null,
    sucursal: null,
    fecha: new Date().toISOString().slice(0, 10),
    canal: null,
    credito: false,
    cantidadPagos: 0,
    montoPagos: 0,
    periodo: null,
    plazoPersonalizado: 0,
    fechaLimite: '',
    tipoDocumento: null,
    numeroDocumento: '',
  }
  localStorage.removeItem('carrito')
}

const handleContinue = () => {
  resetForm()
}

// ====================== HOOKS ======================
onMounted(() => {
  listaCLientes()
  cargarCanales()
})
</script>

<style scoped>
/* Estilo para el fallback de loading */
.quasar-loading-fallback {
  position: relative;
  pointer-events: none;
}

.quasar-loading-fallback::after {
  content: 'Procesando...';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  z-index: 9999;
}
</style>
