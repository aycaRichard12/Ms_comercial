<template>
  <div class="q-pa-md">
    <product-state-form
      v-if="showForm"
      :editing="editing"
      :current-item="currentItem"
      @submit="handleSubmit"
      @cancel="toggleForm"
    />

    <product-state-table
      v-else
      :rows="productStates"
      @new-item="toggleForm"
      @edit-item="editState"
      @delete-item="confirmDelete"
      @status-change="toggleStatus"
    />

    <q-dialog v-model="confirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Está seguro de eliminar este estado?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteState" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductStateForm from 'src/components/productoConf/estadoForm.vue'
import ProductStateTable from 'src/components/productoConf/estadoTable.vue'

const showForm = ref(false)
const editing = ref(false)
const currentItem = ref(null)
const confirmDialog = ref(false)
const itemToDelete = ref(null)

const productStates = ref([
  { id: 68, numero: 1, estado: 'Prueba', descripcion: 'sad', activo: true },
  { id: 20, numero: 2, estado: 'Usado', descripcion: 'Productos seminuevos', activo: true },
  // ... otros estados
])

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    editing.value = false
    currentItem.value = null
  }
}

const editState = (item) => {
  currentItem.value = item
  editing.value = true
  showForm.value = true
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  confirmDialog.value = true
}

const deleteState = () => {
  productStates.value = productStates.value.filter((state) => state.id !== itemToDelete.value.id)
  // Aquí iría la llamada API para eliminar
}

const toggleStatus = (item) => {
  item.activo = !item.activo
  // Aquí iría la llamada API para actualizar el estado
}

const handleSubmit = (formData) => {
  if (editing.value) {
    // Lógica para actualizar
    const index = productStates.value.findIndex((s) => s.id === formData.id)
    if (index !== -1) {
      productStates.value[index] = {
        ...productStates.value[index],
        estado: formData.nombre,
        descripcion: formData.descripcion,
      }
    }
  } else {
    // Lógica para crear nuevo
    const newId = Math.max(...productStates.value.map((s) => s.id)) + 1
    productStates.value.unshift({
      id: newId,
      numero: productStates.value.length + 1,
      estado: formData.nombre,
      descripcion: formData.descripcion,
      activo: true,
    })
  }
  toggleForm()
}
</script>
