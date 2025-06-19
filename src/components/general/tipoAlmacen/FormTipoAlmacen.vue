<template>
  <q-form @submit.prevent="onSubmit">
    <q-card-section>
      <q-input v-model="localData.nombre" label="Nombre" :rules="[(val) => !!val || 'Requerido']" />
      <q-input v-model="localData.descripcion" label="Descripción" type="textarea" />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
      <q-btn label="Guardar" type="submit" color="primary" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { watch, ref } from 'vue'

const props = defineProps({
  modelValue: Object,
  isEditing: Boolean,
})

const emit = defineEmits(['submit', 'cancel'])

const localData = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)

function onSubmit() {
  emit('submit', localData.value)
}
</script>
