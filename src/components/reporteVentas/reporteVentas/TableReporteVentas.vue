<template>
  <q-page class="q-ma-md">
    <div>
      <!-- Formulario principal -->
      <q-form @submit.prevent="onSubmit">
        <div class="row justify-center q-col-gutter-md">
          <q-input type="date" v-model="fechai" label="Fecha Inicial*" class="col-12 col-md-4" />
          <q-input type="date" v-model="fechaf" label="Fecha Final*" class="col-12 col-md-4" />
        </div>

        <div class="row justify-center q-mt-md">
          <div class="col-auto">
            <q-btn label="Generar reporte" color="primary" type="submit" class="q-mr-sm" />
            <q-btn label="Vista previa del Reporte" color="primary" outline @click="vistaPrevia" />
          </div>
        </div>
      </q-form>
      <div class="row justify-center q-col-gutter-md q-py-md">
        <q-select
          label="Filtrar por Almacén"
          v-model="almacen"
          :options="almacenes"
          class="col-12 col-md-2"
        />

        <q-select
          v-model="clienteseleccionado"
          :options="clientesFiltrados"
          use-input
          input-debounce="300"
          @filter="filtrarClientes"
          label="Filtrar por razón social"
          outlined
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          :loading="cargandoClientes"
          class="col-12 col-md-3"
          @update:model-value="handleClienteSelect"
          style="min-height: 56px"
        />

        <q-input
          v-model="sucursal"
          label="Filtrar por sucursal del cliente"
          class="col-12 col-md-3"
          @input="buscarSucursales"
        >
          <template #append>
            <q-menu v-if="sucursales.length">
              <q-list>
                <q-item
                  v-for="suc in sucursales"
                  :key="suc.id"
                  clickable
                  @click="seleccionarSucursal(suc)"
                >
                  <q-item-section>{{ suc.nombre }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </template>
        </q-input>

        <q-select
          label="Filtrar por canal de venta"
          v-model="canal"
          :options="canales"
          class="col-12 col-md-2"
          disable
        />

        <q-select
          label="Filtrar por tipo de pago"
          v-model="tipopago"
          :options="[
            { label: 'todo', value: '0' },
            { label: 'A crédito', value: 'credito' },
            { label: 'Al contado', value: 'contado' },
          ]"
          class="col-12 col-md-2"
        />
      </div>
      <!-- Tabla de datos -->
      <q-table
        :rows="datos"
        :columns="columnas"
        row-key="id"
        flat
        class="q-mt-md"
        :style="{ maxHeight: 'calc(100vh - 325px)', overflowY: 'auto' }"
      >
        <template #body-cell-acciones="props">
          <q-td align="center">
            <q-btn size="sm" icon="visibility" flat @click="verDetalle(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
const $q = useQuasar()

// Obtener la fecha actual en formato YYYY-MM-DD
const today = new Date().toISOString().slice(0, 10)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

// Fechas
const fechai = ref(today)
const fechaf = ref(today)

// Filtros
const almacen = ref(null)
const clienteseleccionado = ref(null) // Añadido esto que faltaba
const sucursal = ref('')
const canal = ref(null)
const tipopago = ref('0')

// Opciones select
const almacenes = ref([])
const canales = ref([])

// Autocompletado
const clientes = ref([])
const clientesFiltrados = ref([])
const cargandoClientes = ref(false)
const sucursales = ref([])

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}

async function getClientes() {
  try {
    cargandoClientes.value = true
    const response = await api.get(`listaCliente/${idempresa}`)
    clientes.value = response.data.map((cli) => ({
      value: cli.id,
      label: `${cli.codigo} - ${cli.nombre} - ${cli.nombrecomercial} - ${cli.ciudad} - ${cli.nit}`,
    }))
    clientesFiltrados.value = clientes.value
  } catch (error) {
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
  } finally {
    cargandoClientes.value = false
  }
}

function filtrarClientes(val, update, abort) {
  if (val.length < 0) {
    abort()
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    clientesFiltrados.value = clientes.value.filter((v) => v.label.toLowerCase().includes(needle))
  })
}

const buscarSucursales = () => {
  // Implementar lógica real de búsqueda de sucursales
  sucursales.value = [
    { id: 1, nombre: 'Sucursal X' },
    { id: 2, nombre: 'Sucursal Y' },
  ]
}

const seleccionarSucursal = (suc) => {
  sucursal.value = suc.nombre
  sucursales.value = []
}

// Datos de la tabla
const columnas = [
  { name: 'nro', label: 'N°', field: 'nro', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha' },
  { name: 'cliente', label: 'Cliente', field: 'cliente' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal' },
  { name: 'tipo_venta', label: 'Tipo-Venta', field: 'tipo_venta' },
  { name: 'tipo_pago', label: 'Tipo-Pago', field: 'tipo_pago' },
  { name: 'factura', label: 'Nro.Factura', field: 'factura' },
  { name: 'canal', label: 'Canal', field: 'canal' },
  { name: 'total', label: 'Total', field: 'total' },
  { name: 'dscto', label: 'Dscto.', field: 'dscto' },
  { name: 'monto', label: 'Monto', field: 'monto' },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

const datos = ref([])

// Acciones
const verDetalle = (row) => {
  console.log('Ver detalle de venta:', row)
}

const vistaPrevia = () => {
  console.log('Vista previa del reporte:', fechai.value, fechaf.value)
}

const onSubmit = () => {
  console.log('Generar reporte con filtros:', {
    fechai: fechai.value,
    fechaf: fechaf.value,
    cliente: clienteseleccionado.value,
    sucursal: sucursal.value,
    canal: canal.value,
    almacen: almacen.value,
    tipopago: tipopago.value,
  })
}

onMounted(() => {
  cargarAlmacenes()
  getClientes()
})
</script>
