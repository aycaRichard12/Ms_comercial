<template>
  <div class="q-pa-md">
    <q-btn
      color="primary"
      size="sm"
      label="Volver"
      @click="$emit('volver')"
      icon="arrow_back"
      class="q-mb-md"
    />
  </div>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <input type="hidden" name="ver" value="registroVenta" />
      <input type="hidden" id="tipoventa" name="tipoventa" value="2" />
      <input type="hidden" name="idusuario" :value="idusuario" />
      <input type="hidden" name="idempresa" :value="idempresa" />

      <div class="row q-col-gutter-md q-mb-md">
        <!-- Cliente -->
        <div class="col-md-6">
          <q-input v-model="clienteVFA" label="Cliente*" outlined required @input="filterClientes">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-menu v-model="showClientesMenu" auto-close>
            <q-list>
              <q-item
                v-for="cliente in filteredClientes"
                :key="cliente.id"
                clickable
                @click="selectCliente(cliente)"
              >
                {{ cliente.nombre }}
              </q-item>
            </q-list>
          </q-menu>
          <input type="hidden" id="idclienteVFA" name="idcliente" v-model="selectedClienteId" />
        </div>

        <!-- Sucursal -->
        <div class="col-md-4">
          <q-input
            v-model="sucursalVFA"
            label="Sucursal*"
            outlined
            required
            @input="filterSucursales"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-menu v-model="showSucursalesMenu" auto-close>
            <q-list>
              <q-item
                v-for="sucursal in filteredSucursales"
                :key="sucursal.id"
                clickable
                @click="selectSucursal(sucursal)"
              >
                {{ sucursal.nombre }}
              </q-item>
            </q-list>
          </q-menu>
          <input type="hidden" id="idsucursalVFA" name="sucursal" v-model="selectedSucursalId" />
        </div>

        <!-- Tipo documento tributario -->
        <div class="col-md-3">
          <q-select
            id="tipodocVFA"
            name="tipodoc"
            label="Tipo de documento tributario*"
            outlined
            readonly
            v-model="selectedTipoDoc"
            :options="tiposDocumento"
          />
        </div>

        <!-- Nro. documento tributario -->
        <div class="col-md-3">
          <q-input
            id="nrodocVFA"
            name="nrodoc"
            label="Nro. documento tributario*"
            outlined
            readonly
            v-model="nroDocumento"
          >
            <template v-slot:append>
              <q-btn
                class="d-none verificarNIT"
                label="Verif."
                color="primary"
                @click="verificarNIT"
              />
            </template>
          </q-input>
        </div>

        <!-- Fecha -->
        <div class="col-md-3">
          <q-input
            id="fechaVFA"
            name="fecha"
            label="Fecha*"
            outlined
            readonly
            type="date"
            v-model="fechaActual"
          />
        </div>

        <!-- Período fecha -->
        <div class="col-md-3">
          <q-input
            id="periodofac"
            name="Fecha"
            label="Período fecha*"
            outlined
            required
            v-model="periodoFac"
            placeholder="Ejm:01-01-2023 al 01-02-2023"
          />
        </div>

        <!-- Punto de venta -->
        <div class="col-md-3">
          <q-select
            id="puntoventaVFA"
            name="canal"
            label="Punto de venta*"
            outlined
            v-model="selectedPuntoVenta"
            :options="puntosVenta"
          />
        </div>

        <!-- Canal de venta -->
        <div class="col-md-3">
          <q-select
            id="canalVFA"
            name="canal"
            label="Canal de venta*"
            outlined
            v-model="selectedCanal"
            :options="canalesVenta"
          />
        </div>

        <!-- Método de pago -->
        <div class="col-md-3">
          <q-select
            id="metodopagoVFA"
            name="metodopago"
            label="Método de pago*"
            outlined
            v-model="selectedMetodoPago"
            :options="metodosPago"
          />
        </div>

        <!-- Crédito -->
        <div class="col-md-3">
          <q-toggle
            id="mostrarMenuCreditoVFA"
            name="tipopago"
            label="¿A crédito?*"
            v-model="esCredito"
            left-label
            @update:model-value="toggleCredito"
          />
          <input type="hidden" name="tipopago" :value="esCredito ? 'credito' : 'contado'" />
        </div>

        <!-- Detalles de crédito -->
        <div class="col-md-12" v-if="esCredito">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-md-3">
              <q-input
                id="cantpagosVFA"
                name="cantVFC"
                label="Cantidad de Pagos*"
                outlined
                required
                v-model="cantidadPagos"
                type="number"
                @update:model-value="calcularPagos"
              />
            </div>
            <div class="col-md-3">
              <q-input
                id="montopagosVFA"
                name="montoVFC"
                label="Monto de Pagos*"
                outlined
                readonly
                v-model="montoPagos"
              >
                <template v-slot:append>
                  <span class="divisaVE">{{ divisa }}</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-3">
              <q-select
                id="periodoVFA"
                name="periodoVFA"
                label="Período establecido*"
                outlined
                v-model="periodoPago"
                :options="opcionesPeriodo"
                @update:model-value="calcularDias"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-md-3" v-if="periodoPago === '0'">
              <q-input
                id="periodopersonalizadoVFA"
                label="Período personalizado*"
                outlined
                required
                v-model="periodoPersonalizado"
                type="number"
                @update:model-value="calcularDiasPers"
              />
            </div>

            <div class="col-md-3">
              <q-input
                id="fechalimiteVFA"
                label="Fecha Límite*"
                outlined
                readonly
                type="date"
                v-model="fechaLimite"
              />
            </div>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="col-md-12 text-right">
          <q-btn label="Registrar" type="submit" color="primary" />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { date } from 'quasar'

// Form state
const clienteVFA = ref('')
const sucursalVFA = ref('')
const selectedTipoDoc = ref(null)
const nroDocumento = ref('')
const fechaActual = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const periodoFac = ref('')
const selectedPuntoVenta = ref(null)
const selectedCanal = ref(null)
const selectedMetodoPago = ref(null)
const esCredito = ref(false)
const cantidadPagos = ref(0)
const montoPagos = ref(0)
const periodoPago = ref(null)
const periodoPersonalizado = ref(0)
const fechaLimite = ref('')
const selectedClienteId = ref(null)
const selectedSucursalId = ref(null)
const divisa = ref('$')

// Static options (no need to be reactive)
const tiposDocumento = [
  { value: 1, label: 'Factura' },
  { value: 2, label: 'Boleta' },
]

const puntosVenta = [
  { value: 1, label: 'Principal' },
  { value: 2, label: 'Sucursal A' },
]

const canalesVenta = [
  { value: 1, label: 'Tienda física' },
  { value: 2, label: 'Online' },
  { value: 3, label: 'Mayorista' },
]

const metodosPago = [
  { value: 1, label: 'Efectivo' },
  { value: 2, label: 'Tarjeta' },
  { value: 3, label: 'Transferencia' },
]

const opcionesPeriodo = [
  { value: '7', label: 'Semanal' },
  { value: '15', label: 'Quincenal' },
  { value: '0', label: 'Personalizado' },
]

// UI state
const showClientesMenu = ref(false)
const showSucursalesMenu = ref(false)
const clientes = ref([])
const sucursales = ref([])
const filteredClientes = ref([])
const filteredSucursales = ref([])

// Methods
const filterClientes = () => {
  if (!clienteVFA.value) {
    showClientesMenu.value = false
    return
  }

  filteredClientes.value = clientes.value.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(clienteVFA.value.toLowerCase()),
  )
  showClientesMenu.value = true
}

const selectCliente = (cliente) => {
  clienteVFA.value = cliente.nombre
  selectedClienteId.value = cliente.id
  showClientesMenu.value = false
  loadSucursales(cliente.id)
}

const loadSucursales = async () => {
  try {
    // sucursales.value = await api.getSucursalesByCliente(clienteId)
  } catch (error) {
    console.error('Error loading branches:', error)
  }
}

const filterSucursales = () => {
  if (!sucursalVFA.value) {
    showSucursalesMenu.value = false
    return
  }

  filteredSucursales.value = sucursales.value.filter((sucursal) =>
    sucursal.nombre.toLowerCase().includes(sucursalVFA.value.toLowerCase()),
  )
  showSucursalesMenu.value = true
}

const selectSucursal = (sucursal) => {
  sucursalVFA.value = sucursal.nombre
  selectedSucursalId.value = sucursal.id
  showSucursalesMenu.value = false
}

const toggleCredito = (value) => {
  esCredito.value = value
}

const calcularPagos = () => {
  // Implement your actual payment calculation logic here
  montoPagos.value = (cantidadPagos.value * 100).toFixed(2)
}

const calcularDias = () => {
  if (!periodoPago.value || periodoPago.value === '0') return

  const days = parseInt(periodoPago.value)
  fechaLimite.value = date.formatDate(date.addToDate(new Date(), { days }), 'YYYY-MM-DD')
}

const calcularDiasPers = () => {
  if (periodoPersonalizado.value <= 0) return

  fechaLimite.value = date.formatDate(
    date.addToDate(new Date(), { days: parseInt(periodoPersonalizado.value) }),
    'YYYY-MM-DD',
  )
}

const verificarNIT = () => {
  console.log('NIT verification logic here')
}

const onSubmit = async () => {
  try {
    console.log('Form submission logic here')
    // await api.submitForm({ ... })
  } catch (error) {
    console.error('Form submission error:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  selectedTipoDoc.value = tiposDocumento[0]?.value
  // Load initial data
  // loadInitialData()
})
</script>

<style>
/* Puedes agregar estilos personalizados aquí si es necesario */
.divisaVE {
  padding: 0 8px;
  display: flex;
  align-items: center;
}
</style>
