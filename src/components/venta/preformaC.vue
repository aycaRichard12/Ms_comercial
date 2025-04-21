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
      <input type="hidden" name="tipoventa" value="0" />
      <input type="hidden" name="idusuario" :value="idusuario" />
      <input type="hidden" name="idempresa" :value="idempresa" />

      <div class="row q-col-gutter-md q-mb-md">
        <!-- Cliente -->
        <div class="col-md-4">
          <q-input v-model="clienteVSF" label="Cliente*" outlined required @input="filterClientes">
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
          <input type="hidden" id="idclienteVSF" name="idcliente" v-model="selectedClienteId" />
        </div>

        <!-- Sucursal -->
        <div class="col-md-4">
          <q-input
            v-model="sucursalVSF"
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
          <input type="hidden" id="idsucursalVSF" name="sucursal" v-model="selectedSucursalId" />
        </div>

        <!-- Fecha -->
        <div class="col-md-4">
          <q-input
            id="fechaVSF"
            name="fecha"
            label="Fecha*"
            outlined
            required
            type="date"
            v-model="fechaActual"
          />
        </div>

        <!-- Canal de venta -->
        <div class="col-md-4">
          <q-select
            id="canalVSF"
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

        <!-- Crédito -->
        <div class="col-md-3">
          <q-toggle
            id="mostrarMenuCredito"
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
            <div class="col-md-4">
              <q-input
                id="cantpagosVSF"
                name="cantVSF"
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
                id="montopagosVSF"
                name="montoVSF"
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
                id="periodoVSF"
                name="periodoVSF"
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
                id="periodopersonalizadoVSF"
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
                id="fechalimiteVSF"
                label="Fecha límite*"
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

// Datos del formulario
const clienteVSF = ref('')
const sucursalVSF = ref('')
const fechaActual = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const selectedCanal = ref(null)
const esCredito = ref(false)
const cantidadPagos = ref(0)
const montoPagos = ref(0)
const periodoPago = ref('7') // Valor por defecto: Semanal
const periodoPersonalizado = ref(0)
const fechaLimite = ref('')
const selectedClienteId = ref(null)
const selectedSucursalId = ref(null)
const divisa = ref('$')

// Listas de opciones
const canalesVenta = ref([
  { value: 1, label: 'Tienda física' },
  { value: 2, label: 'Online' },
  { value: 3, label: 'Mayorista' },
])

const opcionesPeriodo = ref([
  { value: '7', label: 'Semanal' },
  { value: '15', label: 'Quincenal' },
  { value: '0', label: 'Personalizado' },
])

// Filtros para clientes y sucursales
const showClientesMenu = ref(false)
const showSucursalesMenu = ref(false)
const clientes = ref([])
const sucursales = ref([])
const filteredClientes = ref([])
const filteredSucursales = ref([])

// Métodos
const filterClientes = () => {
  if (clienteVSF.value.length > 0) {
    filteredClientes.value = clientes.value.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(clienteVSF.value.toLowerCase()),
    )
    showClientesMenu.value = true
  } else {
    showClientesMenu.value = false
  }
}

const selectCliente = (cliente) => {
  clienteVSF.value = cliente.nombre
  selectedClienteId.value = cliente.id
  showClientesMenu.value = false
  loadSucursales(cliente.id)
}

const loadSucursales = () => {
  // Implementar carga de sucursales desde API
}

const filterSucursales = () => {
  if (sucursalVSF.value.length > 0) {
    filteredSucursales.value = sucursales.value.filter((sucursal) =>
      sucursal.nombre.toLowerCase().includes(sucursalVSF.value.toLowerCase()),
    )
    showSucursalesMenu.value = true
  } else {
    showSucursalesMenu.value = false
  }
}

const selectSucursal = (sucursal) => {
  sucursalVSF.value = sucursal.nombre
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

const onSubmit = () => {
  console.log('Formulario enviado')
}

onMounted(() => {
  // Cargar datos iniciales desde API
})
</script>

<style scoped>
.divisaVE {
  padding: 0 8px;
  display: flex;
  align-items: center;
}
</style>
