<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 1000px; max-width: 800px">
        <q-card-section class="q-pa-none">
          <form-divisa
            :modalValue="formData"
            :editing="estaEditando"
            @submit="guardarDivisa"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <table-divisa
      :rows="listaDivisas"
      @add="toggleForm"
      @edit="editUnit"
      @delete="confirmDelete"
      @toggle-status="changeStatus"
    ></table-divisa>
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import FormDivisa from 'src/components/general/divisa/FormDivisa.vue'
import TableDivisa from 'src/components/general/divisa/TableDivisa.vue'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
const idempresa = idempresa_md5()
const showForm = ref(false)
const listaDivisas = ref([])
const $q = useQuasar()
const isEditing = ref(false)
const formData = ref({
  ver: 'registrarDivisa',
  idempresa: idempresa,
})
//=======================================Formulario
const guardarDivisa = async (data) => {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }
  try {
    let response
    if (isEditing.value) {
      response = await api.post(``, formData)
    } else {
      response = await api.post(``, formData)
    }
    console.log(response)
    if (response.data.estado === 'exito') {
      loadRows()

      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Proveedor guardado correctamente',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el proveedor',
      })
    }
  } catch (error) {
    console.error('Error al guardar Proveedor: ', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el Proveedor',
    })
  }
  toggleForm()
}
//=======================================Tabla
async function loadRows() {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo

    const response = await api.get(`listaDivisa/${idempresa}/${token}/${tipo}`)
    console.log(response.data)
    listaDivisas.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const editUnit = (item) => {
  console.log(item)
  isEditing.value = true
  showForm.value = true

  formData.value = {
    ver: 'editarDivisa',
    id: item.id,
    nombre: item.nombre,
    tipo: item.tipo,
  }
}

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
const resetForm = () => {
  isEditing.value = false

  formData.value = {
    ver: 'registrarDivisa',
    idempresa: idempresa,
  }
}
const confirmDelete = (Divisa) => {
  console.log(Divisa)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Divisa "${Divisa.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarDivisa/${Divisa.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
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
    const response = await api.get(`actualizarEstadoDivisa/${item.id}/${nuevoEstado}/${idempresa}`) // Cambia a tu ruta real
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
