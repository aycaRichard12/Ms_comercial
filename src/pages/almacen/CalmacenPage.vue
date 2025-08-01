<template>
  <q-page>
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Almacén</div>
          <q-btn icon="close" @click="showForm = false" flat round dense />
        </q-card-section>

        <q-card-section class="q-pa-none">
          <FormularioAlmacen
            :isEditing="isEditing"
            :model-value="formData"
            :tipos-almacen="tiposAlmacen"
            :sucursales="listaSucursales"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <TablaAlmacen
      :rows="CaracteristicaProd"
      @add="toggleForm"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FormularioAlmacen from 'components/almacen/creacion/almacenForm.vue'
import TablaAlmacen from 'components/almacen/creacion/almacenTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const CaracteristicaProd = ref([])

const formData = ref({
  ver: 'registrarAlmacen',
  idempresa: idempresa,
})
const tiposAlmacen = ref([])

const listaSucursales = ref([])

async function loadRows() {
  try {
    const response = await api.get(`listaAlmacen/${idempresa}`) // Cambia a tu ruta real
    CaracteristicaProd.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadTiposAlmacenes() {
  try {
    const response = await api.get(`listaTipoAlmacen/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const formateado = response.data.map((item) => ({
      label: item.tipoalmacen,
      value: item.id,
    }))
    tiposAlmacen.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadSucursales() {
  try {
    const response = await api.get(`listaSucursales/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const formateado = response.data.map((item) => ({
      label: item.sucursal,
      value: item.id,
    }))
    listaSucursales.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarAlmacen',
    idempresa: idempresa,
  }
}
const editUnit = (item) => {
  formData.value = {
    ver: 'editarAlmacen',
    idempresa: idempresa,
    nombre: item.nombre,
    direccion: item.direccion,
    id: item.id,
    email: item.email,
    tipoalmacen: item.idtipoalmacen,
    stockmax: item.stockmax,
    stockmin: item.stockmin,
    telefono: item.telefono,
    sucursal: item.sucursales[0].idsucursal,
  }

  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Almacen "${item.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarAlmacen/${item.id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}

const toggleStatus = async (item) => {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoAlmacen/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
    console.log(response)
    loadRows()
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const handleSubmit = async (data) => {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    if (isEditing.value) {
      const response = await api.post(``, formData)
      console.log(response)
    } else {
      const response = await api.post(``, formData)
      console.log(response)
    }
    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Editado correctamente' : 'Registrado correctamente',
    })
    loadRows()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al guardar' + error,
    })
  }
  toggleForm()
}
onMounted(() => {
  loadRows()
  loadTiposAlmacenes()
  loadSucursales()
})
</script>
