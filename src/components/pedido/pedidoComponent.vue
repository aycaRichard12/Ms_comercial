<!-- PedidoManager.vue -->
<template>
  <div>
    <PedidoForm :initialFormData="editingPedido" @submit="handleSubmit" />

    <PedidoTable
      :pedidos="pedidos"
      @editar="editar"
      @eliminar="eliminar"
      @verDetalle="verDetalle"
      @autorizar="autorizarPedido"
    />
    <DetalleModal
      :visible="detalleModalVisible"
      :detalle="selectedDetalle"
      @update:visible="detalleModalVisible = $event"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFetchList } from 'src/composables/useFetchList'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import PedidoForm from './pedidosForm.vue'
import PedidoTable from './pedidosTable.vue'
import { api } from 'boot/axios'
import DetalleModal from './detallePedidoComponent.vue'
const empresa = idempresa_md5()
const editingPedido = ref(null)
const detalleModalVisible = ref(false) // Estado para mostrar el modal
const selectedDetalle = ref(null) // Datos seleccionados para mostrar
// Cargar lista de pedidos
const { items: pedidos } = useFetchList(`/listaPedido/${empresa || null}`)

const handleSubmit = async (formData) => {
  const datos = objectToFormData({
    ver: 'registrarPedido',
    ...formData,
  })

  for (let [k, v] of datos.entries()) {
    console.log(`${k}: ${v}`)
  }
  // const formData_ = new FormData()
  // formData_.append('ver', 'registrarPedido')
  // formData_.append('fecha', '2025/04/20')
  // formData_.append('observacion', 'Hola')
  // formData_.append('almacenorigen', '72')
  // formData_.append('tipo', '1')
  // formData_.append('almacendestino', '')
  // formData_.append('idusuario', 'usuario_test')
  // formData_.append('idempresa', 'empresa_test')

  try {
    const response = await api.post('/', datos) // sin headers
    console.log('Respuesta de la API:', response)
    editingPedido.value = null
  } catch (error) {
    console.error('Error al enviar el formulario:', error)
  }
}

function objectToFormData(obj) {
  const formData = new FormData()
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      formData.append(key, obj[key])
    } else {
      formData.append(key, 0)
    }
  }
  return formData
}

const editar = (row) => {
  console.log('Editar:', row)
  // Cargar los datos del pedido seleccionado para editar
  editingPedido.value = { ...row }
}

const eliminar = (row) => {
  console.log('Eliminar:', row)
  // Aquí iría la lógica para eliminar el pedido
}

const verDetalle = (row) => {
  selectedDetalle.value = row
  detalleModalVisible.value = true
}
const autorizarPedido = (row) => {
  console.log('Autorizar pedido:', row)
  // Aquí iría la lógica para autorizar el pedido
}
</script>
