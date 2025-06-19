<template>
  <q-form @submit.prevent="onSubmit">
    <div class="q-pa-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar' : 'Nuevo' }} Pedido</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <!-- Fecha -->
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="localData.fecha"
              type="date"
              label="Fecha*"
              :rules="[(val) => !!val || 'La fecha es requerida']"
              lazy-rules
            />
          </div>

          <!-- Tipo de Pedido -->
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="localData.tipo"
              :options="tiposPedido"
              label="Tipo de Pedido*"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un tipo de pedido']"
              lazy-rules
              @update:model-value="handleTipoChange"
            />
          </div>

          <!-- Almacén Destino (visible siempre) -->
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="localData.almacendestino"
              :options="almacenes"
              label="Almacén Destino*"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione el almacén destino']"
              lazy-rules
              @update:model-value="updateFiltrado"
            />
          </div>

          <!-- Almacén Origen (solo para movimientos) -->
          <div
            class="col-md-3 col-sm-6 col-xs-12"
            v-if="localData.tipo === TIPOS_PEDIDO.MOVIMIENTO"
          >
            <q-select
              v-model="localData.almacenorigen"
              :options="filtrado"
              label="Almacén Origen*"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione el almacén origen']"
              lazy-rules
              :loading="loadingAlmacenes"
            />
          </div>

          <!-- Observación -->
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="localData.observacion"
              label="Observación*"
              :rules="[(val) => !!val || 'La observación es requerida']"
              lazy-rules
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            flat
            color="negative"
            @click="$emit('cancel')"
            :disable="submitting"
          />
          <q-btn label="Guardar" type="submit" color="primary" :loading="submitting" />
        </q-card-actions>
      </q-card>
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const idempresa = idempresa_md5()

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  almacenes: Array,
  proveedores: Array,
})

const emit = defineEmits(['submit', 'cancel'])

// Constants
const TIPOS_PEDIDO = Object.freeze({
  COMPRA: 1,
  MOVIMIENTO: 2,
})

const tiposPedido = [
  { label: 'Pedido de Compra', value: TIPOS_PEDIDO.COMPRA },
  { label: 'Pedido de Movimiento', value: TIPOS_PEDIDO.MOVIMIENTO },
]

// State
const almacenesOrigen = ref([])
const loadingAlmacenes = ref(false)
const submitting = ref(false)

// Initialize form data
const localData = ref({
  fecha: new Date().toISOString().slice(0, 10),
  tipo: null,
  almacenorigen: null,
  almacendestino: null,
  observacion: null,
  ...(props.modalValue || {}),
})

// Computed
const filtrado = computed(() => {
  return almacenesOrigen.value.filter((item) => item.value !== localData.value.almacendestino)
})

// Methods
const onSubmit = () => {
  submitting.value = true
  emit('submit', localData.value)
  submitting.value = false
}

async function getAlmacenesOrigen() {
  loadingAlmacenes.value = true
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    almacenesOrigen.value = response.data.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes',
      caption: error.message,
    })
  } finally {
    loadingAlmacenes.value = false
  }
}

function handleTipoChange(newVal) {
  if (newVal === TIPOS_PEDIDO.MOVIMIENTO) {
    getAlmacenesOrigen()
  } else if (newVal === TIPOS_PEDIDO.COMPRA) {
    localData.value.almacenorigen = null
  }
}

function updateFiltrado() {
  if (localData.value.tipo === TIPOS_PEDIDO.MOVIMIENTO) {
    localData.value.almacenorigen = null
  }
}

// Watchers
watch(
  () => props.modalValue,
  (newVal) => {
    if (newVal) {
      localData.value = { ...newVal }
      if (newVal.tipo === TIPOS_PEDIDO.MOVIMIENTO) {
        getAlmacenesOrigen()
      }
    }
  },
  { deep: true },
)

// Lifecycle hooks
onMounted(() => {
  if (props.editing && localData.value.tipo === TIPOS_PEDIDO.MOVIMIENTO) {
    getAlmacenesOrigen()
  }
})
</script>
