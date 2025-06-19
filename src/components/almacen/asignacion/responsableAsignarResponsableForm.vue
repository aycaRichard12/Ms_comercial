<template>
  <div>
    <div class="row q-mb-md">
      <div class="col-md-2">
        <q-btn
          color="primary"
          icon="arrow_back"
          label="Volver"
          size="sm"
          @click="$emit('volver')"
        />
      </div>
      <div class="col-md-8 text-center">
        <h6>Asignación de Almacenes</h6>
        <h6 class="text-primary">{{ responsableNombre }}</h6>
      </div>
    </div>
    <q-form @submit.prevent="handleSubmit">
      <div style="display: flex; justify-content: center">
        <q-select
          v-model="localData.almacen"
          :options="almacenes"
          label="Almacenes*"
          outlined
          dense
          required
          option-value="value"
          option-label="label"
          emit-value
          map-options
          :rules="[(val) => !!val || 'Seleccione Almacen']"
          style="width: 300px"
        />
      </div>
      <q-card-actions align="right">
        <q-btn label="Guardar" type="submit" color="primary" />
      </q-card-actions>
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  responsableId: Number,
  responsableNombre: String,
  modelValue: Object,
  almacenes: {
    type: Array,
    default: () => [],
  },
})
const localData = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)
const emit = defineEmits(['submit', 'cancel'])

const handleSubmit = () => {
  emit('submit', localData.value)
}
</script>
