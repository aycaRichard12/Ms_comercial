<template>
  <q-card>
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="categoria">Categoría de precio *</label>
          <q-input
            v-model="localData.tipo"
            id="categoria"
            dense
            outlined
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="porcentaje">Porcentaje incremento al costo unitario *</label>
          <q-input
            v-model="localData.porcentaje"
            id="porcentaje"
            dense
            outlined
            type="number"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="almacen">Almacén *</label>
          <q-select
            v-model="localData.idalmacen"
            :options="props.almacenes"
            id="almacen"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
        <q-btn label="Guardar" type="submit" color="primary" />
      </q-card-actions>
    </q-form>
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
