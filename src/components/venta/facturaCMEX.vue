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
      <input type="hidden" id="tipoventa" name="tipoventa" value="3" />
      <input type="hidden" name="idusuario" :value="idusuario" />
      <input type="hidden" name="idempresa" :value="idempresa" />

      <div class="row q-col-gutter-md q-mb-md">
        <!-- Cliente -->
        <div class="col-md-6">
          <q-input v-model="clienteVFE" label="Cliente*" outlined required @input="filterClientes">
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
          <input type="hidden" id="idclienteVFE" name="idcliente" v-model="selectedClienteId" />
        </div>

        <!-- Sucursal -->
        <div class="col-md-3">
          <q-input
            v-model="sucursalVFE"
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
          <input type="hidden" id="idsucursalVFE" name="sucursal" v-model="selectedSucursalId" />
        </div>

        <!-- Tipo documento tributario -->
        <div class="col-md-3">
          <q-select
            id="tipodocVFE"
            name="tipodoc"
            label="Tipo documento tributario*"
            outlined
            readonly
            v-model="selectedTipoDoc"
            :options="tiposDocumento"
          />
        </div>

        <!-- Nro. documento tributario -->
        <div class="col-md-3">
          <q-input
            id="nrodocVFE"
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
            id="fechaVFE"
            name="fecha"
            label="Fecha*"
            outlined
            readonly
            type="date"
            v-model="fechaActual"
          />
        </div>

        <!-- Canal de venta -->
        <div class="col-md-3">
          <q-select
            id="canalVFE"
            name="canal"
            label="Canal de venta*"
            outlined
            v-model="selectedCanal"
            :options="canalesVenta"
          />
        </div>

        <!-- Dirección comprador -->
        <div class="col-md-3">
          <q-input
            id="direccionVFE"
            name="direccion"
            label="Dirección comprador*"
            outlined
            required
            v-model="direccion"
          />
        </div>

        <!-- Puerto destino -->
        <div class="col-md-3">
          <q-input
            id="puertodestinoVFE"
            name="puertodestino"
            label="Puerto destino*"
            outlined
            required
            v-model="puertoDestino"
          />
        </div>

        <!-- Lugar destino -->
        <div class="col-md-3">
          <q-input
            id="lugardestinoVFE"
            name="lugardestino"
            label="Lugar destino*"
            outlined
            required
            v-model="lugarDestino"
          />
        </div>

        <!-- Incoterm -->
        <div class="col-md-3">
          <q-input
            id="incotermVFE"
            name="incoterm"
            label="Incoterm*"
            outlined
            required
            v-model="incoterm"
          />
        </div>

        <!-- Detalle incoterm -->
        <div class="col-md-3">
          <q-input
            id="detalleincotermVFE"
            name="detalleincoterm"
            label="Detalle incoterm*"
            outlined
            required
            v-model="detalleIncoterm"
          />
        </div>

        <!-- Descripción paquetes -->
        <div class="col-md-3">
          <q-input
            id="descripcionPBVFE"
            name="descripcionPB"
            label="Nro. y descripción paquetes (Bultos)"
            outlined
            required
            v-model="descripcionPaquetes"
          />
        </div>

        <!-- Información adicional -->
        <div class="col-md-3">
          <q-input
            id="infoadicionalVFE"
            name="infoadicional"
            label="Información adicional"
            outlined
            required
            v-model="infoAdicional"
          />
        </div>

        <!-- Punto de venta -->
        <div class="col-md-3">
          <q-select
            id="puntoventaVFE"
            name="puntoventa"
            label="Punto de venta*"
            outlined
            v-model="selectedPuntoVenta"
            :options="puntosVenta"
          />
        </div>

        <!-- Método de pago -->
        <div class="col-md-3">
          <q-select
            id="metodopagoVFE"
            name="metodopago"
            label="Método de pago*"
            outlined
            v-model="selectedMetodoPago"
            :options="metodosPago"
          />
        </div>

        <!-- Gastos nacionales -->
        <div class="col-md-6">
          <div class="row q-col-gutter-md q-mb-md">
            <label class="text-subtitle1">Gastos nacionales</label>
            <div class="col-md-4">
              <q-input
                id="montonacVFE"
                name="montonac"
                label="Monto"
                outlined
                v-model="montoNacional"
                type="number"
                step="0.01"
              >
                <template v-slot:append>
                  <span class="divisaVE">{{ divisa }}</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-5">
              <q-input
                id="descnacVFE"
                name="descnac"
                label="Descripción"
                outlined
                v-model="descNacional"
              />
            </div>
            <div class="col-md-2 q-mb-sm">
              <q-btn label="Añadir" color="primary" @click="agregarGastoNacional" />
            </div>
            <div class="col-12">
              <q-table :rows="gastosNacionales" :columns="columnsGastos" row-key="id" flat bordered>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      icon="delete"
                      color="negative"
                      flat
                      @click="eliminarGastoNacional(props.row)"
                    />
                  </q-td>
                </template>
                <template v-slot:bottom-row>
                  <q-tr>
                    <q-td colspan="2" class="text-right text-weight-bold">Total gastos</q-td>
                    <q-td>{{ totalGastosNacionales }}</q-td>
                    <q-td></q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </div>

        <!-- Gastos internacionales -->
        <div class="col-md-6">
          <div class="row q-col-gutter-md q-mb-md">
            <label class="text-subtitle1">Gastos internacionales</label>
            <div class="col-md-4">
              <q-input
                id="montointerVFE"
                name="montointer"
                label="Monto"
                outlined
                v-model="montoInternacional"
                type="number"
                step="0.01"
              >
                <template v-slot:append>
                  <span class="divisaVE">{{ divisa }}</span>
                </template>
              </q-input>
            </div>
            <div class="col-md-5">
              <q-input
                id="descinterVFE"
                name="descinter"
                label="Descripción"
                outlined
                v-model="descInternacional"
              />
            </div>
            <div class="col-md-2 q-mb-sm">
              <q-btn label="Añadir" color="primary" @click="agregarGastoInternacional" />
            </div>
            <div class="col-12">
              <q-table
                :rows="gastosInternacionales"
                :columns="columnsGastos"
                row-key="id"
                flat
                bordered
              >
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      icon="delete"
                      color="negative"
                      flat
                      @click="eliminarGastoInternacional(props.row)"
                    />
                  </q-td>
                </template>
                <template v-slot:bottom-row>
                  <q-tr>
                    <q-td colspan="2" class="text-right text-weight-bold">Total gastos</q-td>
                    <q-td>{{ totalGastosInternacionales }}</q-td>
                    <q-td></q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </div>

        <!-- Crédito -->
        <div class="col-md-3">
          <q-toggle
            id="mostrarMenuCreditoVFE"
            name="tipopago"
            label="¿A crédito?*"
            v-model="esCredito"
            left-label
          />
        </div>

        <!-- Detalles de crédito -->
        <div class="col-md-12" v-if="esCredito">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-md-4">
              <q-input
                id="cantpagosVFE"
                name="cantVFE"
                label="Cantidad de pagos*"
                outlined
                required
                v-model="cantidadPagos"
                type="number"
                @update:model-value="calcularPagos"
              />
            </div>
            <div class="col-md-4">
              <q-input
                id="montopagosVFE"
                name="montoVFE"
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
                id="periodoVFE"
                name="periodoVFE"
                label="Período establecido*"
                outlined
                v-model="periodoPago"
                :options="opcionesPeriodo"
                @update:model-value="calcularDias"
              />
            </div>

            <div class="col-md-4" v-if="periodoPago === '0'">
              <q-input
                id="periodopersonalizadoVFE"
                label="Plazo total(días)*"
                outlined
                required
                v-model="periodoPersonalizado"
                type="number"
                @update:model-value="calcularDiasPers"
              />
            </div>

            <div class="col-md-4">
              <q-input
                id="fechalimiteVFE"
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
import { ref, computed, onMounted } from 'vue'
import { date } from 'quasar'

// Form data
const clienteVFE = ref('')
const sucursalVFE = ref('')
const selectedTipoDoc = ref(null)
const nroDocumento = ref('')
const fechaActual = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const selectedCanal = ref(null)
const direccion = ref('')
const puertoDestino = ref('')
const lugarDestino = ref('')
const incoterm = ref('')
const detalleIncoterm = ref('')
const descripcionPaquetes = ref('')
const infoAdicional = ref('')
const selectedPuntoVenta = ref(null)
const selectedMetodoPago = ref(null)
const montoNacional = ref(0)
const descNacional = ref('')
const montoInternacional = ref(0)
const descInternacional = ref('')
const esCredito = ref(false)
const cantidadPagos = ref(0)
const montoPagos = ref(0)
const periodoPago = ref(null)
const periodoPersonalizado = ref(0)
const fechaLimite = ref('')
const selectedClienteId = ref(null)
const selectedSucursalId = ref(null)
const divisa = ref('$')

// Static options (don't need to be reactive)
const tiposDocumento = [
  { value: 1, label: 'Factura' },
  { value: 2, label: 'Boleta' },
]

const canalesVenta = [
  { value: 1, label: 'Tienda física' },
  { value: 2, label: 'Online' },
  { value: 3, label: 'Mayorista' },
]

const puntosVenta = [
  { value: 1, label: 'Principal' },
  { value: 2, label: 'Sucursal A' },
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

// Expenses
const gastosNacionales = ref([])
const gastosInternacionales = ref([])

const columnsGastos = [
  { name: 'id', label: 'N°', field: 'id', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'center' },
  { name: 'actions', label: 'Opciones', align: 'center' },
]

// Client/sucursal filtering
const showClientesMenu = ref(false)
const showSucursalesMenu = ref(false)
const clientes = ref([])
const sucursales = ref([])
const filteredClientes = ref([])
const filteredSucursales = ref([])

// Computed properties
const totalGastosNacionales = computed(() =>
  gastosNacionales.value.reduce((total, gasto) => total + parseFloat(gasto.monto), 0).toFixed(2),
)

const totalGastosInternacionales = computed(() =>
  gastosInternacionales.value
    .reduce((total, gasto) => total + parseFloat(gasto.monto), 0)
    .toFixed(2),
)

// Methods
const filterClientes = () => {
  if (!clienteVFE.value) {
    showClientesMenu.value = false
    return
  }

  filteredClientes.value = clientes.value.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(clienteVFE.value.toLowerCase()),
  )
  showClientesMenu.value = true
}

const selectCliente = (cliente) => {
  clienteVFE.value = cliente.nombre
  selectedClienteId.value = cliente.id
  showClientesMenu.value = false
  loadSucursales(cliente.id)
}

const loadSucursales = async () => {
  try {
    // sucursales.value = await api.getSucursalesByCliente(clienteId)
  } catch (error) {
    console.error('Error loading sucursales:', error)
  }
}

const filterSucursales = () => {
  if (!sucursalVFE.value) {
    showSucursalesMenu.value = false
    return
  }

  filteredSucursales.value = sucursales.value.filter((sucursal) =>
    sucursal.nombre.toLowerCase().includes(sucursalVFE.value.toLowerCase()),
  )
  showSucursalesMenu.value = true
}

const selectSucursal = (sucursal) => {
  sucursalVFE.value = sucursal.nombre
  selectedSucursalId.value = sucursal.id
  showSucursalesMenu.value = false
}

// Expense management
const agregarGastoNacional = () => {
  if (!descNacional.value || montoNacional.value <= 0) return

  gastosNacionales.value.push({
    id: Date.now(), // Better unique ID
    descripcion: descNacional.value,
    monto: parseFloat(montoNacional.value).toFixed(2),
  })

  // Reset form
  descNacional.value = ''
  montoNacional.value = 0
}

const eliminarGastoNacional = (id) => {
  gastosNacionales.value = gastosNacionales.value.filter((g) => g.id !== id)
}

const agregarGastoInternacional = () => {
  if (!descInternacional.value || montoInternacional.value <= 0) return

  gastosInternacionales.value.push({
    id: Date.now(),
    descripcion: descInternacional.value,
    monto: parseFloat(montoInternacional.value).toFixed(2),
  })

  descInternacional.value = ''
  montoInternacional.value = 0
}

const eliminarGastoInternacional = (id) => {
  gastosInternacionales.value = gastosInternacionales.value.filter((g) => g.id !== id)
}

// Payment calculations
const calcularPagos = () => {
  montoPagos.value = (cantidadPagos.value * 100).toFixed(2) // Replace with actual logic
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
    console.log('Submitting form...')
    // await api.submitForm({ ... })
  } catch (error) {
    console.error('Form submission error:', error)
  }
}

// Lifecycle
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
