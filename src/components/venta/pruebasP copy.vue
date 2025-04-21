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

const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()

// Datos reactivos
const formData = ref({
  cliente: null,
  sucursal: null,
  fecha: new Date().toISOString().substr(0, 10),
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

const CONSTANTES = {
  ver: 'registroVenta',
  idusuario: idusuario,
  idempresa: idempresa,
  tipoventa: 3,
}
// Opciones para selects
const periodOptions = [
  { label: 'Personalizado', value: 0 },
  { label: '15 días', value: 15 },
  { label: '30 días', value: 30 },
  { label: '60 días', value: 60 },
  { label: '90 días', value: 90 },
]

const cargarCanales = async () => {
  try {
    const respuesta = await validarUsuario()

    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaCanalVenta/${idempresa}`) // cambia por tu endpoint real
    salesChannels.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}
// Computed properties
const filteredClients = computed(() => {
  if (!clientFilter.value) return clients.value
  return clients.value.filter((client) =>
    client.label.toLowerCase().includes(clientFilter.value.toLowerCase()),
  )
})

const branchOptions = computed(() => {
  if (!formData.value.cliente) return []
  return branches.value.filter((branch) => branch.clientId === formData.value.cliente.value)
})
function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
    window.location.assign('../../app/')
  }
}
// Métodos
const listaCLientes = async () => {
  try {
    const response = await validarUsuario()
    console.log(response)

    const idempresa = response[0]?.empresa?.idempresa
    console.log(idempresa)

    if (idempresa) {
      const endpoint = `listaCliente/${idempresa}`
      const resultado = await api.get(endpoint)
      console.log(resultado)
      if (resultado.data[0] == 'error') {
        console.error(resultado.data.error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar clientes',
        })
      } else {
        clients.value = resultado.data.map((cliente) => ({
          label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.ciudad} - ${cliente.nit}`,
          value: cliente.id,
          originalData: cliente, // Guardamos todos los datos originales
        }))
      }
    } else {
      $q.notify({
        type: 'warning',
        message: 'Hubo un error, inténtelo nuevamente',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar clientes',
    })
  }
}

const actualizarSucursales = async (cliente) => {
  if (!cliente) return

  try {
    const endpoint = `listaSucursal/${cliente.value}`
    const response = await api.get(endpoint)

    branches.value = response.data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: cliente.value,
    }))

    if (branches.value.length > 0) {
      formData.value.sucursal = branches.value[0]
    } else {
      $q.notify({
        type: 'info',
        message: 'No hay sucursales para este cliente',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar sucursales',
    })
  }
}

// const elegirUnCliente = (cliente) => {
//   const clienteData = cliente.originalData

//   // Actualizar formData con los datos del cliente
//   formData.value.tipoDocumento = clienteData.tipodocumento
//   formData.value.numeroDocumento = clienteData.nit
//   formData.value.canal = clienteData.idcanal

//   // Si es NIT, validarlo
//   if (clienteData.tipodocumento == 5) {
//     validarNIT(clienteData.nit)
//   }

//   // Guardar en localStorage si es necesario
//   const cartData = JSON.parse(localStorage.getItem('carrito') || { listaFactura: {} })
//   cartData.listaFactura = {
//     ...cartData.listaFactura,
//     nombreRazonSocial: clienteData.nombre,
//     codigoCliente: clienteData.codigo,
//     numeroDocumento: clienteData.nit,
//     codigoTipoDocumentoIdentidad: clienteData.tipodocumento,
//     telefonoCliente: clienteData.telefono,
//     direccionComprador: clienteData.direccion,
//     lugarDestino: clienteData.pais,
//     codigoExcepcion: clienteData.tipodocumento == 5 ? '' : null,
//   }

//   localStorage.setItem('carrito', JSON.stringify(cartData))
// }

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
  const cartData = JSON.parse(localStorage.getItem('carrito'))
  if (cartData && cartData.ventatotal && formData.value.cantidadPagos > 0) {
    formData.value.montoPagos = (cartData.ventatotal / formData.value.cantidadPagos).toFixed(2)

    // Actualizar localStorage
    cartData.nropagos = formData.value.cantidadPagos
    cartData.valorpagos = formData.value.montoPagos
    localStorage.setItem('carrito', JSON.stringify(cartData))
  }
}

const calculateDueDate = () => {
  if (!formData.value.credito) return

  const fecha = new Date(formData.value.fecha)
  let daysToAdd =
    formData.value.periodo === 0 ? formData.value.plazoPersonalizado : formData.value.periodo

  fecha.setDate(fecha.getDate() + daysToAdd)
  formData.value.fechaLimite = fecha.toISOString().substr(0, 10)

  // Actualizar localStorage
  const cartData = JSON.parse(localStorage.getItem('carrito')) || {}
  cartData.dias =
    formData.value.periodo === 0 ? formData.value.plazoPersonalizado : formData.value.periodo
  cartData.fechalimite = formData.value.fechaLimite
  localStorage.setItem('carrito', JSON.stringify(cartData))
}

// const validarNIT = async (nit) => {
//   try {
//     const response = await api.get(`api/validarNIT/${nit}`)
//     if (response.data.valid) {
//       $q.notify({
//         type: 'positive',
//         message: 'NIT válido',
//       })
//     } else {
//       $q.notify({
//         type: 'warning',
//         message: 'NIT no válido',
//       })
//     }
//   } catch (error) {
//     console.error('Error al validar NIT:', error)
//     $q.notify({
//       type: 'negative',
//       message: 'Error al validar NIT',
//     })
//   }
// }

// const normalizeText = (text) => {
//   return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
// }

const onSubmit = async () => {
  try {
    if (!$q) throw new Error('Quasar instance not available')

    $q.loading.show({ message: 'Procesando venta...' })

    const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
    const ventaData = {
      ...CONSTANTES,
      ...formData.value,
      clienteId: formData.value.cliente?.value,
      sucursalId: formData.value.sucursal?.value,
      ...cartData,
    }
    console.log(ventaData)

    const response = await api.post('registrarVenta', ventaData)
    console.log(response)

    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: 'Venta registrada con éxito',
      })

      if (response.data.datosFactura?.urlEmizor) {
        window.open(response.data.datosFactura.urlEmizor, '_blank')
      }

      // Reset del formulario
      localStorage.removeItem('carrito')
      Object.assign(formData.value, {
        cliente: null,
        sucursal: null,
        fecha: new Date().toISOString().substr(0, 10),
        canal: null,
        credito: false,
        // ... otros resets
      })
    } else {
      // Manejo de errores del servidor
      const errores = Object.values(response.data.errores || {}).flat()
      $q.notify({
        type: 'negative',
        message: `Error al registrar: ${errores.join(', ')}`,
      })
    }
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al procesar la venta',
    })
  } finally {
    $q.loading.hide() // <-- Asegurar que siempre se oculte
  }
}

// Carga inicial
onMounted(() => {
  listaCLientes()
  // Cargar otros datos iniciales como canales de venta, etc.
  cargarCanales()
})
</script>

<style scoped>
/* Add any custom styles here */
.forms {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
<!-- <script setup>
import { ref   } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

// ========== CONSTANTES Y ESTADO ==========
const ERROR_TYPES = {
  QUASAR: 'QUASAR_NOT_AVAILABLE',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

const errorLog = ref([]) // Para registrar todos los errores

// ========== FUNCIÓN PARA REGISTRAR ERRORES ==========
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

// ========== MANEJO SEGURO DE QUASAR ==========
const getQuasarInstance = () => {
  try {
    const instance = useQuasar?.() || window.$q
    if (!instance?.loading) {
      throw new Error('Servicio Loading no disponible')
    }
    return instance
  } catch (error) {
    logError(ERROR_TYPES.QUASAR, error)
    return {
      loading: {
        show: () => console.warn('Loading.show no disponible'),
        hide: () => console.warn('Loading.hide no disponible'),
      },
      notify: (m) => console.log('Notificación simulada:', m),
    }
  }
}

// ========== ONSUBMIT CON MANEJO COMPLETO ==========
const onSubmit = async () => {
  const $q = getQuasarInstance()
  let loadingShown = false

  try {
    // 1. Validación inicial
    if (!formData.value.cliente) {
      throw {
        type: ERROR_TYPES.VALIDATION,
        message: 'Debe seleccionar un cliente',
        fields: ['cliente'],
      }
    }

    // 2. Mostrar loading
    $q.loading.show({
      message: 'Procesando venta...',
      timeout: 30000,
    })
    loadingShown = true

    // 3. Preparar datos
    const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
    const ventaData = {
      ...CONSTANTES,
      ...formData.value,
      clienteId: formData.value.cliente?.value,
      sucursalId: formData.value.sucursal?.value,
      ...cartData,
    }

    // 4. Validar datos antes de enviar
    if (!ventaData.clienteId || !ventaData.sucursalId) {
      throw {
        type: ERROR_TYPES.VALIDATION,
        message: 'Datos incompletos para registrar la venta',
        fields: ['cliente', 'sucursal'],
      }
    }

    // 5. Enviar a la API
    const response = await api.post('registrarVenta', ventaData).catch((error) => {
      throw {
        type: ERROR_TYPES.API,
        message: error.response?.data?.message || 'Error en la conexión con el servidor',
        code: error.response?.status,
        original: error,
      }
    })

    // 6. Procesar respuesta
    if (response.data.estado !== 'exito') {
      throw {
        type: ERROR_TYPES.API,
        message: response.data.mensaje || 'Error al procesar la venta',
        errors: response.data.errores,
      }
    }

    // 7. Éxito
    $q.notify({
      type: 'positive',
      message: 'Venta registrada con éxito',
      timeout: 5000,
    })

    if (response.data.datosFactura?.urlEmizor) {
      window.open(response.data.datosFactura.urlEmizor, '_blank')
    }

    // 8. Reset seguro
    resetForm()
  } catch (error) {
    const errorType = error.type || ERROR_TYPES.UNKNOWN
    const loggedError = logError(errorType, error, {
      formData: formData.value,
      action: 'onSubmit',
    })

    // Notificación al usuario
    $q.notify({
      type: 'negative',
      message: getFriendlyErrorMessage(loggedError),
      timeout: 7000,
      actions: [{ label: 'Detalles', handler: () => showErrorDetails(loggedError) }],
    })
  } finally {
    if (loadingShown) {
      setTimeout(() => $q.loading.hide(), 300)
    }
  }
}

// ========== FUNCIONES AUXILIARES ==========
const getFriendlyErrorMessage = (error) => {
  const messages = {
    [ERROR_TYPES.QUASAR]: 'Error interno del sistema',
    [ERROR_TYPES.API]: 'Error al comunicarse con el servidor',
    [ERROR_TYPES.VALIDATION]: 'Datos incompletos o inválidos',
    [ERROR_TYPES.AUTH]: 'Problema de autenticación',
    [ERROR_TYPES.UNKNOWN]: 'Ocurrió un error inesperado',
  }

  return error.message || messages[error.type] || messages[ERROR_TYPES.UNKNOWN]
}

const showErrorDetails = (error) => {
  console.groupCollapsed('Detalles del error')
  console.log('Tipo:', error.type)
  console.log('Mensaje:', error.message)
  console.log('Contexto:', error.context)
  console.log('Stack:', error.stack)
  console.groupEnd()

  alert(`Error técnico:\n\n${error.message}\n\nCódigo: ${error.code || 'N/A'}`)
}

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

// ... (resto del código se mantiene igual)
</script> -->
