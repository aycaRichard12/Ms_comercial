<template>
  <q-form @submit.prevent="onSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-3">
        <label for="tipo">Tipo de registro*</label>
        <q-select
          v-model="localData.tipoRegistro"
          :options="tiposRegistro"
          id="tipo"
          emit-value
          dense
          outlined=""
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <!-- Mostrar selezct de pedido solo si tipoRegistro es '1' -->
      <div class="col-12 col-md-3" v-if="localData.tipoRegistro === '1'">
        <label for="pedido">Pedido*</label>
        <q-select
          v-model="localData.pedido"
          :options="pedidos"
          id="pedido"
          emit-value
          map-options
          dense
          outlined
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <!-- Mostrar almacén solo si tipoRegistro es '2' -->
      <div class="col-12 col-md-3" v-if="localData.tipoRegistro === '2'">
        <label for="almacen">Almacén*</label>
        <q-select
          v-model="localData.almacen"
          :options="props.almacenes"
          id="almacen"
          dense
          outlined
          emit-value
          map-options
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="nombre">Nombre*</label>
        <q-input
          v-model="localData.nombre"
          id="nombre"
          label
          outlined
          dense
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="codigo">Codigo*</label>
        <q-input
          v-model="localData.codigo"
          id="codigo"
          dense
          outlined
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="provedor">Proveedor*</label>
        <q-select
          v-model="localData.proveedor"
          :options="props.proveedores"
          id="provedor"
          dense
          outlined
          emit-value
          map-options
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="factura">Nro Factura</label>
        <q-input v-model="localData.factura" id="factura" dense outlined />
      </div>

      <div class="col-12 col-md-3">
        <label for="tipocompra">Tipo de Compra*</label>
        <q-select
          v-model="localData.tipocompra"
          :options="tiposCompra"
          id="tipocompra"
          dense
          outlined
          emit-value
          map-options
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      <q-btn label="Guardar" type="submit" color="primary" />
    </q-card-actions>
  </q-form>
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
