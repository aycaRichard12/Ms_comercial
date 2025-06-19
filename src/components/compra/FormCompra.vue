<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <h5 class="text-left q-mt-none q-mb-md">Nueva compra</h5>
      <q-form @submit.prevent="onSubmit">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-select
              v-model="localData.tipoRegistro"
              :options="tiposRegistro"
              label="Tipo de registro*"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <!-- Mostrar selezct de pedido solo si tipoRegistro es '1' -->
          <div class="col-md-3" v-if="localData.tipoRegistro === '1'">
            <q-select
              v-model="localData.pedido"
              :options="pedidos"
              label="Pedido*"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <!-- Mostrar almacén solo si tipoRegistro es '2' -->
          <div class="col-md-3" v-if="localData.tipoRegistro === '2'">
            <q-select
              v-model="localData.almacen"
              :options="props.almacenes"
              label="Almacén*"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-input
              v-model="localData.nombre"
              label="Nombre*"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-input
              v-model="localData.codigo"
              label="Código*"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-select
              v-model="localData.proveedor"
              :options="props.proveedores"
              label="Proveedor*"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-input v-model="localData.factura" label="Nro Factura" />
          </div>

          <div class="col-md-3">
            <q-select
              v-model="localData.tipocompra"
              :options="tiposCompra"
              label="Tipo de Compra*"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
          <q-btn label="Guardar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const idempresa = idempresa_md5()

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  almacenes: Array,
  proveedores: Array,
})
const PedidosAlmacen = ref([])
const emit = defineEmits(['submit', 'cancel'])
const pedidos = ref([])
const localData = ref({ ...props.modalValue })

const tiposRegistro = [
  { label: 'Ingreso con pedido', value: '1' },
  { label: 'Ingreso sin pedido', value: '2' },
]
const tiposCompra = [{ label: 'Al contado', value: '2' }]

const onSubmit = () => {
  emit('submit', localData.value)
}

async function cargarPedidos() {
  try {
    const idAlmacenes = props.almacenes.map((obj) => obj.value)
    const response = await api.get(`listaPedido/${idempresa}`)

    const filtrados = response.data.filter(
      (item) => idAlmacenes.includes(item.idalmacen) && item.estado == 2 && item.autorizacion == 1,
    )
    PedidosAlmacen.value = filtrados
    pedidos.value = filtrados.map((item) => ({
      label: `${item.almacen} - ${item.observacion || 'Sin observación'}`,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Pedidos',
    })
  }
}

// Esperar a que los almacenes estén disponibles
watch(
  () => props.almacenes,
  (newVal) => {
    if (newVal.length > 0) {
      cargarPedidos()
    }
  },
  { immediate: true },
)
// asignar almacen si selecciona un pedido
watch(
  () => localData.value.pedido,
  (newVal) => {
    const pedido = PedidosAlmacen.value.find((obj) => obj.id == newVal)
    if (pedido) {
      localData.value.almacen = pedido.idalmacen
    }
    console.log(localData.value.almacen)
  },
)
// Resetear pedido si cambia tipoRegistro
watch(
  () => localData.value.tipoRegistro,
  (newVal) => {
    if (newVal === '2') {
      localData.value.pedido = null
      localData.value.almacen = null
    } else if (newVal === '1') {
      localData.value.almacen = null
    }
  },
)
</script>
