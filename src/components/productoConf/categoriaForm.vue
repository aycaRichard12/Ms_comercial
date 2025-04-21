<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ editing ? 'Editar Registro' : 'Nuevo Registro' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="submitForm">
        <div class="row q-col-gutter-md">
          <!-- Hidden fields -->
          <input type="hidden" name="ver" v-model="formData.ver" />
          <input type="hidden" name="idempresa" v-model="formData.idempresa" />

          <!-- Visible fields -->
          <div class="col-md-3">
            <q-input
              v-model="formData.nombre"
              :label="
                formData.tipoCP === '2' ? 'Categoría del producto*' : 'Subcategoría del producto*'
              "
              outlined
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-input
              v-model="formData.descripcion"
              label="Descripción*"
              outlined
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-select
              v-model="formData.tipoCP"
              label="Tipo de registro*"
              outlined
              dense
              :options="typeOptions"
              option-label="label"
              option-value="value"
              :rules="[(val) => !!val || 'Campo requerido']"
              @update:model-value="handleTypeChange"
            />
          </div>

          <div class="col-md-3" v-if="formData.tipoCP === '1'">
            <q-select
              v-model="formData.idpadreCP"
              label="Categoría padre*"
              outlined
              dense
              :options="parentCategories"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-12 text-center">
            <q-btn
              :label="editing ? 'Actualizar' : 'Registrar'"
              type="submit"
              color="primary"
              class="q-mt-md"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" color="negative" @click="cancelForm" flat />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  currentItem: Object,
  parentCategories: Array,
})
const emit = defineEmits(['submit', 'cancel'])
const formData = ref({
  ver: 'registrarCategoriaProducto',
  idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
  nombre: '',
  descripcion: '',
  tipoCP: null,
  idpadreCP: null,
})
const typeOptions = [
  { value: 1, label: 'Sub Categoria' },
  { value: 2, label: 'Categoria' },
]

watch(
  () => props.currentItem,
  (newVal) => {
    if (newVal && props.editing) {
      formData.value = {
        ver: 'actualizarCategoriaProducto',
        idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
        nombre: newVal.categoria || newVal.subcategoria,
        descripcion: newVal.descripcion,
        tipoCP: newVal.categoria ? '2' : '1',
        idpadreCP: newVal.idpadreCP,
        id: newVal.id,
      }
    }
  },
  { immediate: true },
)

function handleTypeChange(value) {
  if (value === '2') {
    formData.value.idpadreCP = null
  }
}

function submitForm() {
  emit('submit', { ...formData.value })
}
function cancelForm() {
  resetForm()
  emit('cancel')
}
function resetForm() {
  formData.value = {
    ver: '',
    idempresa: '',
    nombre: '',
    descripcion: '',
    tipoCP: null,
    idpadreCP: null,
  }
}
</script>
