<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-card v-if="showForm" class="q-mx-auto q-mt-md">
      <q-card-section class="q-pa-none">
        <producto-form
          :isEditing="isEditing"
          :model-value="formData"
          :categorias="categorias"
          :estados="estados"
          :subcategorias="subcategorias"
          :unidades="unidades"
          :medidas="medidas"
          @submit="handleSubmit"
          @cancel="toggleForm"
          @categoria-changed="loadsubcategorias"
        />
      </q-card-section>
    </q-card>

    <producto-tabla
      :rows="productos"
      @add="toggleForm"
      @mostrarReporte="mostrarReporte"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { idempresa_md5, validarUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import ProductoForm from 'src/components/producto/creacion/productoForm.vue'
import ProductoTabla from 'src/components/producto/creacion/productoTable.vue'
const idempresa = idempresa_md5()
const contenidousuario = validarUsuario()
console.log(contenidousuario)
const token = contenidousuario[0]?.factura?.access_token
const tipo = contenidousuario[0]?.factura?.tipo
const productos = ref([])

const categorias = ref([])

const estados = ref([])
const subcategorias = ref([])
const unidades = ref([])
const medidas = ref([])
const $q = useQuasar()
const isEditing = ref(false)
const showForm = ref(false)
const formData = ref({
  ver: 'registrarProducto',
  idempresa: idempresa,
})

async function loadRows() {
  try {
    let response

    response = await api.get(`listaProducto/${idempresa}/${token}/${tipo}`) // Cambia a tu ruta con factura

    productos.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

async function loadcategorias() {
  try {
    const response = await api.get(`listaCategoriaProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1 && u.idp == 0)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    categorias.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadestados() {
  try {
    const response = await api.get(`listaEstadoProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    estados.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Estados de Producto',
    })
  }
}
async function loadsubcategorias(idcategoria) {
  console.log('idcategoria:', idcategoria)

  if (!idcategoria) {
    subcategorias.value = []
    return
  }
  try {
    const response = await api.get(`listaCategoriaProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(formData.value.categoria)
    const filtrados = response.data.filter((u) => u.estado == 1 && u.idp == idcategoria)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    subcategorias.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadunidades() {
  try {
    const response = await api.get(`listaUnidadProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    unidades.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadmedidas() {
  try {
    const response = await api.get(`listaCaracteristicaProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1)

    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    medidas.value = formateado // Asume que la API devuelve un array
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
      console.log(response.data)
    } else {
      const response = await api.post(``, formData)
      console.log(response.data)
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
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
    subcategorias.value = [] // limpia subcategorías
  }
}
function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarProducto',
    idempresa: idempresa,
  }
}
const editUnit = (item) => {
  formData.value = {
    ver: 'editarProducto',
    idempresa: idempresa,
    codigo: item.codigo,
    nombre: item.nombre,
    codigobarras: item.codigobarras,
    categoria: item.categoria,
    estadoproductos: item.estadoproductos,
    descripcion: item.descripcion,
    subcategoria: item.subcategoria,
    unidad: item.unidad,
    medida: item.medida,
    otraCaracteristica: item.otraCaracteristica,
  }

  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (row) => {
  console.log(row)

  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Proveedor "${row.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarProducto/${row.id}`) // Cambia a tu ruta real
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
onMounted(() => {
  loadcategorias()
  loadestados()
  loadmedidas()
  loadsubcategorias()
  loadunidades()
  loadRows()
})
</script>
