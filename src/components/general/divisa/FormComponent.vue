<template>
  <q-form @submit.prevent="onSubmit">
    <q-input v-model="form.nombre" label="Nombre" />
    <q-input v-model="form.email" label="Email" />
    <q-btn type="submit" label="Guardar" color="primary" />
  </q-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['submit'])

const form = reactive({ nombre: '', email: '' })

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(form, val || { nombre: '', email: '' })
  },
  { immediate: true },
)

function onSubmit() {
  emit('submit', { ...form })
}
</script>
