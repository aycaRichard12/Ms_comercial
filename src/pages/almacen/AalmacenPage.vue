<template>
  <q-page padding>
    <q-card-section v-if="!asignando">
      <q-dialog v-model="showForm" persistent>
        <q-card class="responsive-dialog">
          <q-card-section class="bg-primary text-h6 text-white flex justify-between">
            <div>Registrar Usuario</div>
            <q-btn color="" icon="close" @click="showForm = false" flat dense round />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <ResponsableForm @registroExitoso="cargarTabla" @cancel="toggleForm" />
          </q-card-section>
        </q-card>
      </q-dialog>

      <ResponsableTable
        :rows="responsables"
        @add="toggleForm"
        @eliminar="eliminarResponsable"
        @asignar="iniciarAsignacion"
      />
    </q-card-section>

    <q-card-section v-else>
      <AsignarAlmacenes
        :responsableId="responsableSeleccionado"
        :responsable-nombre="responsableSeleccionado"
        :almacenes="almacenes"
        :model-value="formData"
        @submit="handleSubmit"
        @volver="cancelarAsignacion"
      />

      <q-separator class="q-my-md" />

      <AlmacenTable :rows="almacenesAsignados" @eliminar="eliminarAlmacen" />
    </q-card-section>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ResponsableForm from 'src/components/almacen/asignacion/responsableForm.vue'
import ResponsableTable from 'src/components/almacen/asignacion/responsableTable.vue'
import AsignarAlmacenes from 'components/almacen/asignacion/responsableAsignarResponsableForm.vue'
import AlmacenTable from 'components/almacen/asignacion/responsableAsignarResponsableTable.vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'
const [lectura, escritura, editar, eliminar] = obtenerPermisosPagina()
console.log(lectura, escritura, editar, eliminar)
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa
const responsables = ref([])
const almacenesAsignados = ref([])
const asignando = ref(false)
const responsableSeleccionado = ref({})
const isEditing = ref(false)
const showForm = ref(false)
const almacenes = ref([])
async function loadUsuarios() {
  try {
    const response = await api.get(`listaResponsable/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    responsables.value = response.data.map((item) => ({
      ...item,
      usuario: Array.isArray(item.usuario) ? item.usuario[0] : item.usuario,
    }))
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

function cargarTabla() {
  loadUsuarios()
}
function eliminarResponsable(id) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Usuario ?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarResponsable/${id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadUsuarios()
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
const cargarAlmacen = async () => {
  try {
    const response = await api.get(`listaAlmacen/${idempresa}`) // ejemplo

    const filtrado = response.data.filter(
      (obj) => obj.estado == 1 && !almacenesAsignados.value.some((v) => v.idalmacen === obj.id),
    )

    const formateado = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))

    almacenes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

async function iniciarAsignacion(responsable) {
  console.log(responsable)
  responsableSeleccionado.value = responsable
  console.log(responsableSeleccionado.value)
  // Cargar almacenes asignados reales desde API aquí
  try {
    const response = await api.get(`listaAlmacenAsignado/${responsableSeleccionado.value?.id}`) // ejemplo
    console.log(response)

    almacenesAsignados.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }

  cargarAlmacen()
  asignando.value = true
}

function cancelarAsignacion() {
  asignando.value = false
  responsableSeleccionado.value = {}
  almacenesAsignados.value = []
}

function eliminarAlmacen(id) {
  almacenesAsignados.value = almacenesAsignados.value.filter((a) => a.id !== id)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Almacen?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarResponsableAlmacen/${id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        iniciarAsignacion(responsableSeleccionado.value)
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
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
  }
}
const formData = ref({
  ver: 'registrarResponsablealmacen',
  idempresa: idempresa,
})
const handleSubmit = async (data) => {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  formData.append('idresponsable', responsableSeleccionado.value?.id)
  try {
    if (isEditing.value) {
      const response = await api.post(``, formData)
      console.log(response)
    } else {
      const response = await api.post(``, formData)
      console.log(response)
    }
    iniciarAsignacion(responsableSeleccionado.value)
    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Editado correctamente' : 'Registrado correctamente',
    })
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
  loadUsuarios()
})
</script>
