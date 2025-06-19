<template>
  <q-form @submit.prevent="onSubmit" style="display: flex; justify-content: space-around">
    <q-input
      v-model="localData.descripcion"
      label="Descripción del producto*"
      disable
      class="q-mb-md"
      style="width: 300px"
    />

    <q-input
      v-model="localData.precioActual"
      label="Actual precio sugerido"
      disable
      class="q-mb-md"
      style="width: 300px"
      :suffix="divisa"
    />

    <q-input
      v-model="localData.precio"
      label="Nuevo precio sugerido*"
      type="number"
      :suffix="divisa"
      lazy-rules
      style="width: 300px"
      :rules="[(val) => !!val || 'Campo requerido']"
    />

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      <q-btn label="Guardar" type="submit" color="primary" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  modalValue: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['submit', 'cancel'])
// Valores iniciales (puedes reemplazarlos dinámicamente cuando abras el modal)
const localData = ref({ ...props.modalValue })

watch(
  () => props.modalValue,
  (nuevoValor) => {
    localData.value = { ...nuevoValor }
  },
  { immediate: true, deep: true },
)
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>
