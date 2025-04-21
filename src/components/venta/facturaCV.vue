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
      <!-- Hidden inputs -->
      <input type="hidden" name="ver" value="registroVenta" />
      <input type="hidden" name="tipoventa" value="1" />
      <input type="hidden" name="idusuario" :value="idusuario" />
      <input type="hidden" name="idempresa" :value="idempresa" />

      <div class="row q-col-gutter-md q-mb-md">
        <!-- Cliente -->
        <div class="col-md-4">
          <q-input v-model="clienteVFC" label="Cliente*" outlined required @input="filterClientes">
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
          <input type="hidden" id="idclienteVFC" name="idcliente" v-model="selectedClienteId" />
        </div>

        <!-- Sucursal -->
        <div class="col-md-4">
          <q-input
            v-model="sucursalVFC"
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
          <input type="hidden" id="idsucursalVFC" name="sucursal" v-model="selectedSucursalId" />
        </div>

        <!-- Tipo documento tributario -->
        <div class="col-md-4">
          <q-select
            id="tipodocVFC"
            name="tipodoc"
            label="Tipo de documento tributario*"
            outlined
            readonly
            v-model="selectedTipoDoc"
            :options="tiposDocumento"
            emit-value
            map-options
          />
        </div>

        <!-- Nro. documento tributario -->
        <div class="col-md-4">
          <q-input
            id="nrodocVFC"
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
                data-value="1"
              />
            </template>
          </q-input>
        </div>

        <!-- Fecha -->
        <div class="col-md-4">
          <q-input
            id="fechaVFC"
            name="fecha"
            label="Fecha*"
            outlined
            readonly
            type="date"
            v-model="fechaActual"
          />
        </div>

        <!-- Punto de venta -->
        <div class="col-md-4">
          <q-select
            id="puntoventaVFC"
            name="puntoventa"
            label="Punto de venta*"
            outlined
            required
            v-model="selectedPuntoVenta"
            :options="puntosVenta"
            emit-value
            map-options
          />
        </div>

        <!-- Canal de venta -->
        <div class="col-md-4">
          <q-select
            id="canalVFC"
            name="canal"
            label="Canal de venta*"
            outlined
            required
            v-model="selectedCanal"
            :options="canalesVenta"
            emit-value
            map-options
          />
        </div>

        <!-- Método de pago -->
        <div class="col-md-4">
          <q-select
            id="metodopagoVFC"
            name="metodopago"
            label="Método de pago*"
            outlined
            required
            v-model="selectedMetodoPago"
            :options="metodosPago"
            emit-value
            map-options
          />
        </div>

        <!-- Crédito -->
        <div class="col-md-3">
          <q-toggle
            id="mostrarMenuCreditoVFC"
            name="tipopago"
            label="A crédito*"
            v-model="esCredito"
            left-label
            @update:model-value="toggleCredito"
          />
          <input type="hidden" name="tipopago" :value="esCredito ? 'credito' : 'contado'" />
        </div>

        <!-- Detalles de crédito -->
        <div class="col-md-12" v-if="esCredito">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-md-4">
              <q-input
                id="cantpagosVFC"
                name="cantVFC"
                label="Cantidad de pagos*"
                outlined
                required
                v-model.number="cantidadPagos"
                type="number"
                @update:model-value="calcularPagos"
                :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
              />
            </div>
            <div class="col-md-4">
              <q-input
                id="montopagosVFC"
                name="montoVFC"
                label="Monto de pagos*"
                outlined
                readonly
                v-model="montoPagos"
              >
                <template v-slot:append>
                  <span class="divisaVE">{{ divisa }}</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-4">
              <q-select
                id="periodoVFC"
                name="periodoVFC"
                label="Período establecido*"
                outlined
                required
                v-model="periodoPago"
                :options="opcionesPeriodo"
                @update:model-value="calcularDias"
                emit-value
                map-options
              />
            </div>

            <div class="col-md-4" v-if="periodoPago === '0'">
              <q-input
                id="periodopersonalizadoVFC"
                name="periodopersonalizado"
                label="Plazo total(días)*"
                outlined
                required
                v-model.number="periodoPersonalizado"
                type="number"
                @update:model-value="calcularDiasPers"
                :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
              />
            </div>

            <div class="col-md-4">
              <q-input
                id="fechalimiteVFC"
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
          <q-btn label="Registrar" type="submit" color="primary" class="enviar-form" />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { date } from 'quasar'

// Reactive state
const clienteVFC = ref('')
const sucursalVFC = ref('')
const selectedTipoDoc = ref(null)
const nroDocumento = ref('')
const fechaActual = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
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

// Options data
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
  if (clienteVFC.value.length > 0) {
    filteredClientes.value = clientes.value.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(clienteVFC.value.toLowerCase()),
    )
    showClientesMenu.value = true
  } else {
    showClientesMenu.value = false
  }
}

const selectCliente = (cliente) => {
  clienteVFC.value = cliente.nombre
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
  if (sucursalVFC.value.length > 0) {
    filteredSucursales.value = sucursales.value.filter((sucursal) =>
      sucursal.nombre.toLowerCase().includes(sucursalVFC.value.toLowerCase()),
    )
    showSucursalesMenu.value = true
  } else {
    showSucursalesMenu.value = false
  }
}

const selectSucursal = (sucursal) => {
  sucursalVFC.value = sucursal.nombre
  selectedSucursalId.value = sucursal.id
  showSucursalesMenu.value = false
}

const toggleCredito = (value) => {
  esCredito.value = value
}

const calcularPagos = () => {
  montoPagos.value = (cantidadPagos.value * 100).toFixed(2)
}

const calcularDias = () => {
  if (periodoPago.value && periodoPago.value !== '0') {
    const days = parseInt(periodoPago.value)
    const newDate = date.addToDate(new Date(), { days })
    fechaLimite.value = date.formatDate(newDate, 'YYYY-MM-DD')
  }
}

const calcularDiasPers = () => {
  if (periodoPersonalizado.value > 0) {
    const newDate = date.addToDate(new Date(), { days: parseInt(periodoPersonalizado.value) })
    fechaLimite.value = date.formatDate(newDate, 'YYYY-MM-DD')
  }
}

const verificarNIT = () => {
  console.log('Verificando NIT...')
}

const onSubmit = async () => {
  try {
    console.log('Formulario enviado')
    // await api.submitForm({
    //   cliente: selectedClienteId.value,
    //   sucursal: selectedSucursalId.value,
    //   // ...otros campos
    // })
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  selectedTipoDoc.value = tiposDocumento[0]?.value || null

  // Initial data loading
  // loadInitialData()
})
</script>

<style scoped>
.divisaVE {
  padding: 0 8px;
  display: flex;
  align-items: center;
}
</style>
