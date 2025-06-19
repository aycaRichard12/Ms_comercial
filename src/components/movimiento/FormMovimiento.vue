<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <q-form @submit.prevent="onSubmit">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input
              v-model="formData.fecha"
              label="Fecha *"
              id="fechaMOV"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Por favor ingrese la fecha']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              v-model="formData.descripcion"
              label="Descripción *"
              id="descripcionMOV"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Por favor ingrese la descripción']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              v-model="formData.almacenorigen"
              :options="originStores"
              label="Almacén Origen *"
              emit-value
              map-options
              lazy-rules
              :rules="[
                (val) =>
                  (val !== null && val !== '') || 'Por favor seleccione un almacén de origen',
              ]"
            />
          </div>
          <div class="col-md-3">
            <q-select
              v-model="formData.almacendestino"
              :options="destinationStores"
              label="Almacén Destino *"
              emit-value
              map-options
              lazy-rules
              :rules="[
                (val) =>
                  (val !== null && val !== '') || 'Por favor seleccione un almacén de destino',
              ]"
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios'
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

const $q = useQuasar()
const props = defineProps({
  editing: Boolean,
  modalValue: Object,
})
const formData = ref({ ...props.modalValue })

// ref({
//   ver: 'registrarMovimiento',
//   id: '',
//   idusuario: 'eb160de1de89d9058fcb0b968dbbbd68',
//   fecha: '',
//   descripcion: '',
//   almacenorigen: '',
//   almacendestino: '',
// })

const originStores = ref([])

const destinationStores = ref([])

async function getOrigenStores() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const StoresAsignados = response.data.filter((u) => u.idusuario === idusuario)
    console.log(response)
    originStores.value = StoresAsignados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    //arrayOfObjects
  } catch (error) {
    console.error('Error al cargar almacenes : ', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  }
}
async function getDestinationStores() {
  try {
    const almacenesOrigen = originStores.value.map((u) => u.value)
    const conjuntoAlmacenes = new Set(almacenesOrigen)
    const response = await api.get(`listaAlmacen/${idempresa}`)
    const StoresActives = response.data.filter((u) => u.estado == 1 && !conjuntoAlmacenes.has(u.id))
    destinationStores.value = StoresActives.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    //arrayOfObjects
  } catch (error) {
    console.log('Error no se cargaron los almacenes: ', error)
    $q.notify({ type: 'negative', message: 'Error no se pudieron cargar los almacenes de destino' })
  }
}
const emit = defineEmits(['submit', 'cancel'])

const onSubmit = () => {
  emit('submit', formData.value)
}

onMounted(async () => {
  // Set current date to the fecha field
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  formData.value.fecha = `${year}-${month}-${day}`
  await getDestinationStores()
  await getOrigenStores()
})
</script>

<style scoped>
/* You can add specific styles for this component here if needed */
</style>
