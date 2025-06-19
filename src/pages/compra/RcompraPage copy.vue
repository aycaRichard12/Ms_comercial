<template>
  <div v-if="showForm" class="q-mx-auto q-mt-md">
    <form-compra
      :modalValue="registroActual"
      :almacenes="almacenes"
      :proveedores="proveedores"
      @submit="guardarRegistro"
      @cancel="cerrarFormulario"
    ></form-compra>
  </div>

  <table-compra
    :rows="compras"
    :almacenes="almacenes"
    @detalleCompra="verDetalle"
    @add="toggleForm"
    @edit="editarCompra"
    @delete="eliminarCompra"
    @repDesglosado="generarReporteDesglosado"
    @repCompras="generarReporteGeneral"
    @toggle-status="autorizarCompra"
  ></table-compra>
  <div>
    <q-dialog v-model="mostrarDetalleCompra" persistent>
      <q-card class="q-pa-md" style="width: 1200px; max-width: 90vw">
        <DetalleCompra
          :model-value="formulario"
          :rows="detalleCompra"
          :product="productosDisponibles"
          @submit="agregarDetalle"
          @close="cancelarDetalle"
          @editarDetalle="editarDetalle"
          @eliminarDetalle="eliminarDetalle"
        />
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import FormCompra from 'src/components/compra/FormCompra.vue'
import TableCompra from 'src/components/compra/TableCompra.vue'
import DetalleCompra from 'src/components/compra/DetalleCompra.vue'
import { objectToFormData } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const showForm = ref(false)
const almacenes = ref([])
const proveedores = ref([])
const compras = ref([])
const isEditing = ref([])
const mostrarDetalleCompra = ref(false)
const registroActual = ref({
  ver: 'registrarCompra',
  idusuario: idusuario,
})

//================================Formulario
async function cargarProveedores() {
  try {
    const response = await api.get(`listaProveedor/${idempresa}`)

    proveedores.value = response.data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    // Agregar opción "Todos (Canal Venta)" al inicio
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Almacenes',
    })
  }
}

async function guardarRegistro(data) {
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    let response
    if (isEditing.value) {
      // PUT con FormData (algunos servidores requieren POST + método oculto para PUT)
      // Aquí se asume que tu backend acepta PUT con FormData directamente. tipoCompra
      response = await api.post(``, formData)
    } else {
      // POST = nuevo cliente
      response = await api.post('', formData)
    }
    console.log(response)

    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'compra registrado correctamente',
      })
      loadRows()
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al registrar la compra',
      })
    }
  } catch (error) {
    console.error('Error al guardar cliente:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el cliente',
    })
  }
}
//================================Tabla
async function verDetalle(compra) {
  console.log(compra)
  await listaProductosDisponibles(compra) // espera que se carguen los productos
  await getDetalleCompra(compra)
  mostrarDetalleCompra.value = true
}

async function autorizarCompra(compra) {
  console.log(compra.id, compra.autorizacion)

  $q.dialog({
    title: 'Confirmar',
    message: `¿Confirmar Compra?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`actualizarEstadoCompra/${compra.id}/1`)
      console.log(response)
      if (response.data.estado === 'error') {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje,
        })
      } else {
        loadRows()
      }
    } catch (error) {
      console.error('Error al confirmar compra:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}
async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((item) => item.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    // Agregar opción "Todos (Canal Venta)" al inicio
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Almacenes',
    })
  }
}
async function loadRows() {
  try {
    const response = await api.get(`listaCompra/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    compras.value = response.data // Asume que la API devuelve un array
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
  registroActual.value = {
    ver: 'registrarCliente',
    idempresa: idempresa,
  }
}
//=======================================Detalle modal
const formulario = ref({
  ver: 'registrarDetalleCompra',
})
const detalleCompra = ref([])

const productosDisponibles = ref([])
async function getDetalleCompra(compra) {
  console.log(compra)
  try {
    const response = await api.get(`listaDetalleCompra/${compra.id}`) // Cambia a tu ruta real
    console.log(response.data)
    detalleCompra.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function listaProductosDisponibles(compra) {
  formulario.value = {
    ver: 'registrarDetalleCompra',
    idingreso: compra.id,
  }
  console.log(compra)
  try {
    const response = await api.get(`ListaProductosCompra/${compra.id}/${compra.idalmacen}`)
    console.log(response)
    productosDisponibles.value = response.data.map((item) => ({
      label: item.codigo + ' - ' + item.descripcion,
      value: item.idproductoalmacen,
      stock: item.stock,
      descripcion: item.descripcion,
    }))
    console.log(productosDisponibles.value)
    // Agregar opción "Todos (Canal Venta)" al inicio
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Almacenes',
    })
  }
}
async function agregarDetalle(item) {
  const formData = objectToFormData(item)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  let response

  try {
    if (item.idingreso) {
      console.log(item.idingreso)
      response = await api.post(``, formData)
    } else {
      console.log(item)
      response = await api.post('', formData)
    }
    console.log(response)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Guardado correctamente',
      })
      getDetalleCompra({ id: item.idingreso })
      showForm.value = false
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar',
      })
    }
  } catch (error) {
    console.error('Error al guardar :', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar',
    })
  }

  formulario.value = {
    ver: 'registrarDetalleCompra',
  }
}

function cancelarDetalle() {
  mostrarDetalleCompra.value = false
  formulario.value = {
    ver: 'registrarDetalleCompra',
  }
}

function editarDetalle(row) {
  formulario.value = {
    ver: 'editarDetalleCompra',
    idproductoalmacen: row.idproductoalmacen,
    id: row.id,
    precio: row.precio,
    cantidad: row.cantidad,
  }
  getDetalleCompra({ id: row.idingreso })

  // Elimina temporalmente el item para permitir edición
}

function eliminarDetalle(row) {
  detalleCompra.value = detalleCompra.value.filter((item) => item.id !== row.id)
}
onMounted(async () => {
  await cargarAlmacenes() // Espera que almacenes se cargue
  await cargarProveedores()
  await loadRows() // Finalmente carga las compras
})
</script>
