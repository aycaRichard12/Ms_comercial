<template>
  <div class="q-pa-md">
    <category-form
      v-if="showForm"
      :editing="editing"
      :current-item="currentItem"
      :parent-categories="parentCategories"
      @submit="handleSubmit"
      @cancel="toggleForm"
    />

    <category-table
      v-else
      :rows="filteredRows"
      @new-item="toggleForm"
      @edit-item="editCategory"
      @delete-item="deleteCategory"
      @status-change="toggleStatus"
    />

    <q-dialog v-model="confirmDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm"
            >¿Estás seguro de eliminar
            {{ itemToDelete.categoria ? 'la categoría' : 'la subcategoría' }} "{{
              itemToDelete.categoria || itemToDelete.subcategoria
            }}"?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="confirmDeleteItem" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import CategoryForm from 'src/components/productoConf/categoriaForm.vue'
import CategoryTable from 'src/components/productoConf/categoriaTable.vue'

export default {
  components: {
    CategoryForm,
    CategoryTable,
  },

  setup() {
    const showForm = ref(false)
    const editing = ref(false)
    const currentItem = ref(null)
    const confirmDelete = ref(false)
    const itemToDelete = ref(null)

    const parentCategories = ref([
      { value: '121', label: 'Eliminar para' },
      { value: '103', label: 'pruebas2312' },
      { value: '102', label: 'pruebas3' },
      { value: '101', label: 'pruebas2' },
      { value: '27', label: 'Producto en produccion' },
      { value: '18', label: 'materia prima' },
      { value: '17', label: 'Producto Terminado' },
      { value: '16', label: 'Productos Externos' },
    ])

    const rows = ref([
      {
        id: 121,
        numero: 1,
        categoria: 'Eliminar para',
        subcategoria: '',
        descripcion: 'detalle',
        estado: 2,
      },
      {
        id: 103,
        numero: 2,
        categoria: 'pruebas2312',
        subcategoria: '',
        descripcion: 'detallew123qweq12',
        estado: 2,
      },
      // ... otros datos de ejemplo
    ])

    const filteredRows = computed(() => {
      return rows.value.map((row) => ({
        ...row,
        estadoText: row.estado === 2 ? 'Activo' : row.estado === 1 ? 'Inactivo' : 'Indefinido',
      }))
    })

    function toggleForm() {
      showForm.value = !showForm.value
      if (!showForm.value) {
        editing.value = false
        currentItem.value = null
      }
    }

    function editCategory(item) {
      currentItem.value = item
      editing.value = true
      showForm.value = true
    }

    function deleteCategory(item) {
      itemToDelete.value = item
      confirmDelete.value = true
    }

    function confirmDeleteItem() {
      rows.value = rows.value.filter((r) => r.id !== itemToDelete.value.id)
      // Aquí normalmente harías una llamada API para eliminar
    }

    function toggleStatus(item) {
      item.estado = item.estado === 2 ? 1 : 2
      // Aquí normalmente harías una llamada API para actualizar el estado
    }

    function handleSubmit(formData) {
      if (editing.value) {
        // Actualizar elemento existente
        const index = rows.value.findIndex((r) => r.id === formData.id)
        if (index !== -1) {
          const isCategory = formData.tipoCP === '2'
          rows.value[index] = {
            ...rows.value[index],
            categoria: isCategory ? formData.nombre : '',
            subcategoria: !isCategory ? formData.nombre : '',
            descripcion: formData.descripcion,
          }
        }
      } else {
        // Crear nuevo elemento
        const newId = Math.max(...rows.value.map((r) => r.id)) + 1
        const newNumero = rows.value.length + 1
        const isCategory = formData.tipoCP === '2'

        rows.value.unshift({
          id: newId,
          numero: newNumero,
          categoria: isCategory ? formData.nombre : '',
          subcategoria: !isCategory ? formData.nombre : '',
          descripcion: formData.descripcion,
          estado: 2,
          idpadreCP: formData.idpadreCP,
        })

        // Si es una nueva categoría padre, añadir al dropdown
        if (isCategory) {
          parentCategories.value.push({
            value: newId.toString(),
            label: formData.nombre,
          })
        }
      }

      toggleForm()
    }

    return {
      showForm,
      editing,
      currentItem,
      confirmDelete,
      itemToDelete,
      parentCategories,
      rows,
      filteredRows,
      toggleForm,
      editCategory,
      deleteCategory,
      confirmDeleteItem,
      toggleStatus,
      handleSubmit,
    }
  },
}
</script>
