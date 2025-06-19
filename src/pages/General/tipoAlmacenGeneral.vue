<template>
  <div class="q-pa-md">
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="q-pa-none">
          <TipoAlmacenForm
            :model-value="formData"
            :is-editing="isEditing"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <TipoAlmacenTable
      :rows="rows"
      @add="toggleForm"
      @edit="editItem"
      @delete="deleteItem"
      @toggle-status="changeStatus"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import TipoAlmacenForm from 'components/general/tipoAlmacen/FormTipoAlmacen.vue'
import TipoAlmacenTable from 'components/general/tipoAlmacen/TableTipoAlmacen.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const rows = ref([])

const formData = ref({
  ver: 'registrarTipoAlmacen',
  idempresa: idempresa,
  nombre: '',
  descripcion: '',
})
async function loadRows() {
  try {
    const response = await api.get(`listaTipoAlmacen/${idempresa}`) // Cambia a tu ruta real
    rows.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) resetForm()
}

function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarTipoAlmacen',
    idempresa: idempresa,
    nombre: '',
    descripcion: '',
  }
}

async function handleSubmit(data) {
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

function editItem(item) {
  formData.value = {
    ver: 'editarTipoAlmacen',
    idempresa: idempresa,
    nombre: item.tipoalmacen,
    descripcion: item.descripcion,
    id: item.id,
  }
  isEditing.value = true
  showForm.value = true
}

async function deleteItem(item) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar el tipo de almacén "${item.tipoalmacen}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarTipoAlmacen/${item.id}/`) // Cambia a tu ruta real
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

async function changeStatus(item) {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoTipoAlmacen/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
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
onMounted(() => {
  loadRows()
})
</script>
