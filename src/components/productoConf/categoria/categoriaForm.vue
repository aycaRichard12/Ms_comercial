<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <q-form @submit="submitForm" ref="formRef">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input
              v-model="localData.nombre"
              label="Categoría del producto*"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-input
              v-model="localData.descripcion"
              label="Descripción*"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-3">
            <q-select
              v-model="localData.tipoCP"
              label="Tipo de registro*"
              :options="typeOptions"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
              @update:model-value="handleTypeChange"
            />
          </div>
          <div class="col-md-3" v-if="localData.tipoCP == 1">
            <q-select
              v-model="localData.idp"
              :options="props.parentCategories"
              label="Categoría padre*"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
          <!-- Aseguramos que el tipoCP sea numérico para la comparación -->
          <!-- <div class="col-md-3">
            <q-select
              v-if="localData.tipoCP === '1'"
              v-model="localData.idpadreCP"
              label="Categoría padre*"
              :options="parentCategories"
              emit-value
              map-options
              :rules="Number(localData.tipoCP) === 1 ? [(val) => !!val || 'Campo requerido'] : []"
            />
          </div> -->

          <q-card-actions align="right">
            <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
            <q-btn label="Guardar" type="submit" color="primary" />
          </q-card-actions>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  currentItem: Object,
  parentCategories: Array, // Asegúrate de que esto tenga datos
})

const emit = defineEmits(['submit', 'cancel'])
const typeOptions = [
  { value: 1, label: 'Sub Categoría' },
  { value: 2, label: 'Categoría' },
]

// Inicializa con tipoCP = 2 (Categoría) para que el campo padre no aparezca al inicio
const localData = ref({
  nombre: '',
  descripcion: '',
  tipoCP: 2,
  idp: null,
})
console.log(props.parentCategories)
// Debería verse como: [{ value: 1, label: "Nombre" }, ...]
watch(
  () => props.modalValue,
  (newVal) => {
    if (newVal) {
      localData.value = {
        ...localData.value, // Mantén los valores por defecto
        ...newVal, // Sobrescribe con los nuevos valores
      }
    }
  },
  { immediate: true },
)

const formRef = ref(null)

function handleTypeChange(tipo) {
  // Si se cambia a "Categoría" (2), limpia el idpadreCP
  console.log(tipo)
  if (Number(tipo) === 2) {
    localData.value.idp = 0
  }
}

async function submitForm() {
  const valid = await formRef.value.validate()
  if (valid) {
    emit('submit', { ...localData.value })
  }
}
</script>
