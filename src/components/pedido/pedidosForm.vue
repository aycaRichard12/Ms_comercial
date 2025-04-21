<!-- PedidoForm.vue -->
<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <div class="text-h5 text-center q-pa-md">Nuevo Pedido</div>
    <div class="row">
      <!-- Fecha -->
      <div class="col-md-6 q-pa-md">
        <q-input filled v-model="form.fecha" mask="####/##/##" :rules="['date']">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.fecha" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- Tipo de Pedido -->
      <div class="col-md-6 q-pa-md">
        <q-select
          color="primary"
          filled
          v-model="form.tipo"
          :options="tipoOptions"
          label="Tipo de Pedido*"
          emit-value
          map-options
        >
          <template v-if="form.tipo" v-slot:append>
            <q-icon name="cancel" @click.stop.prevent="form.tipo = null" class="cursor-pointer" />
          </template>
        </q-select>
      </div>

      <!-- Almacén Destino -->
      <div class="col-md-6 q-pa-md">
        <q-select
          color="primary"
          filled
          v-model="form.almacenorigen"
          :options="almacendestino"
          label="Almacén Destino*"
          emit-value
          map-options
        >
          <template v-if="form.almacenorigen" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="form.almacenorigen = null"
              class="cursor-pointer"
            />
          </template>
        </q-select>
      </div>

      <!-- Almacén Origen (solo para tipo 2) -->
      <div class="col-md-6 q-pa-md" v-if="form.tipo === '2'">
        <q-select
          color="primary"
          filled
          v-model="form.almacendestino"
          :options="almacenorigen"
          label="Almacén Origen*"
          emit-value
          map-options
          :rules="form.tipo === '2' ? ['required'] : []"
        >
          <template v-if="form.almacendestino" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="form.almacendestino = null"
              class="cursor-pointer"
            />
          </template>
        </q-select>
      </div>

      <!-- Observación -->
      <div class="col-md-6 q-pa-md">
        <q-input filled v-model="form.observacion" label="Observación*" />
      </div>
    </div>

    <div class="text-center">
      <q-btn type="submit" label="Registrar" color="primary" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useFetchList } from 'src/composables/useFetchList'

const props = defineProps({
  initialFormData: Object,
})

const emit = defineEmits(['submit'])

const empresa = idempresa_md5()
const usuario = idusuario_md5()

const form = ref(
  props.initialFormData || {
    ver: 'registrarPedido',
    id: '',
    almacendestino: '0',
    idempresa: empresa,
    idusuario: usuario,
    fecha: new Date().toISOString().slice(0, 10),
    tipo: null,
    almacenorigen: null,
    observacion: '',
  },
)

// Opciones para tipo de pedido (usando emit-value)
const tipoOptions = [
  { label: 'Pedido de Compra (Almacén a Proveedor)', value: '1' },
  { label: 'Pedido de Movimiento (Entre Almacenes)', value: '2' },
]

// Carga de almacenes
const { items: almacendestino } = useFetchList(
  `/listaResponsableAlmacen/${empresa || null}`,
  (item) => ({
    label: item.almacen,
    value: item.idalmacen,
  }),
)

const { items: almacenorigen } = useFetchList(`/listaAlmacen/${empresa || null}`, (item) => ({
  label: item.nombre,
  value: item.id,
}))

// Limpiar almacén origen cuando no es tipo 2
watch(
  () => form.value.tipo,
  (newVal) => {
    if (newVal !== '2') {
      form.value.almacenorigen = null
    }
  },
)

const onSubmit = () => {
  emit('submit', form.value)
}
</script>
