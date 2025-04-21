<template>
  <div class="q-pa-md">
    <product-unit-form
      v-if="showForm"
      :editing="editing"
      :current-item="currentItem"
      @submit="handleSubmit"
      @cancel="toggleForm"
    />

    <product-unit-table
      v-else
      :rows="productUnits"
      @new-item="toggleForm"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @status-change="toggleStatus"
    />

    <q-dialog v-model="confirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">¿Está seguro de eliminar esta unidad?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteUnit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductUnitForm from 'src/components/productoConf/unidadForm.vue'
import ProductUnitTable from 'src/components/productoConf/unidadTable.vue'

const showForm = ref(false)
const editing = ref(false)
const currentItem = ref(null)
const confirmDialog = ref(false)
const itemToDelete = ref(null)

const productUnits = ref([
  { id: 70, numero: 1, unidad: 'onz', descripcion: 'detalle', activo: true },
  { id: 68, numero: 2, unidad: 'eliminar', descripcion: 'qq', activo: true },
  { id: 21, numero: 3, unidad: 'm', descripcion: 'Metros', activo: true },
  // ... otras unidades
])

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    editing.value = false
    currentItem.value = null
  }
}

const editUnit = (item) => {
  currentItem.value = item
  editing.value = true
  showForm.value = true
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  confirmDialog.value = true
}

const deleteUnit = () => {
  productUnits.value = productUnits.value.filter((unit) => unit.id !== itemToDelete.value.id)
  // Aquí iría la llamada API para eliminar
}

const toggleStatus = (item) => {
  item.activo = !item.activo
  // Aquí iría la llamada API para actualizar el estado
}

const handleSubmit = (formData) => {
  if (editing.value) {
    // Actualizar unidad existente
    const index = productUnits.value.findIndex((u) => u.id === formData.id)
    if (index !== -1) {
      productUnits.value[index] = {
        ...productUnits.value[index],
        unidad: formData.nombre,
        descripcion: formData.descripcion,
      }
    }
  } else {
    // Crear nueva unidad
    const newId = Math.max(...productUnits.value.map((u) => u.id)) + 1
    productUnits.value.unshift({
      id: newId,
      numero: productUnits.value.length + 1,
      unidad: formData.nombre,
      descripcion: formData.descripcion,
      activo: true,
    })
  }
  toggleForm()
}
</script>
