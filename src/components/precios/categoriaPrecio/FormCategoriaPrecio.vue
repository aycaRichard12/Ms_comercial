<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <q-form @submit.prevent="onSubmit">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input
              v-model="localData.tipo"
              label="Categoría de precio *"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              v-model="localData.porcentaje"
              label="Porcentaje incremento al costo unitario *"
              type="number"
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              v-model="localData.idalmacen"
              :options="props.almacenes"
              label="Almacén *"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
          <q-btn label="Guardar" type="submit" color="primary" />
        </q-card-actions>
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
  almacenes: Array, // Asegúrate de que esto tenga datos
})
const emit = defineEmits(['submit', 'cancel'])

const localData = ref({
  tipo: '',
  porcentaje: '',
})
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
async function onSubmit() {
  emit('submit', { ...localData.value })
}
</script>
