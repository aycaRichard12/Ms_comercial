<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <div v-if="showForm" class="q-mx-auto q-mt-md">
      <form-precio-sugerido
        :isEditing="isEditing"
        :modalValue="ProductoSeleccionado"
        @submit="guardarPrecioBase"
        @cancel="toggleForm"
      />
    </div>

    <table-precio-sugerido
      :rows="productos"
      :almacenes="listaAlmacenes"
      :loading="cargando"
      @edit="abrirFormularioEditar"
    />
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'

import FormPrecioSugerido from 'src/components/precios/PrecioSugerido/FormPrecioSugerido.vue'
import TablePrecioSugerido from 'src/components/precios/PrecioSugerido/TablePrecioSugerido.vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
const showForm = ref(false)
const isEditing = ref(false)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const listaAlmacenes = ref([])
const productos = ref([])
const ProductoSeleccionado = ref({
  ver: '',
  idempresa: idempresa,
})
const $q = useQuasar()
const cargarListaAlmacenes = async () => {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    console.log(response.data)
    console.log(idusuario)
    const filtrado = response.data.filter((u) => u.idusuario == idusuario)
    let formateado = filtrado.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    listaAlmacenes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const guardarPrecioBase = async (data) => {
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
        message: response.data.mensaje || 'Guardado correctamente',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar',
      })
    }
  } catch (error) {
    console.error('Error al guardar: ', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar',
    })
  }
  toggleForm()
}
const abrirFormularioEditar = async (item) => {
  isEditing.value = true
  showForm.value = true
  console.log(item)
  try {
    const response = await api.get(`verificarExistenciaPrecioSugerido/${item.id}`)
    console.log(response.data)
    if (response.data.estado == 'exito') {
      ProductoSeleccionado.value = {
        ver: 'editarPrecioSugerido',
        idempresa: idempresa,
        id: response.data?.datos?.id,
        descripcion: response.data?.datos?.codigo + ' ' + response.data?.datos?.descripcion,
        precioActual: response.data?.datos?.precio,
      }

      console.log(ProductoSeleccionado.value)
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadRows() {
  try {
    const response = await api.get(`listaPrecioSugerido/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    productos.value = response.data
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
  ProductoSeleccionado.value = {
    ver: '',
    idempresa: idempresa,
  }
}
onMounted(() => {
  cargarListaAlmacenes()
  loadRows()
})
</script>
