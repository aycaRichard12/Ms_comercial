<template>
  <div class="q-pa-md">
    <!-- Título del formulario -->

    <q-form @submit.prevent="onSubmit" style="display: flex; justify-content: space-around">
      <!-- Descripción del producto (solo lectura) -->
      <q-input
        v-model="localData.descripcion"
        label="Descripción del producto*"
        disable
        required
        class="q-mb-md"
        style="width: 300px"
      />

      <!-- Costo unitario actual del producto (solo lectura) -->
      <q-input
        v-model="localData.precioactual"
        label="Costo unitario actual del producto*"
        disable
        required
        class="q-mb-md"
        style="width: 300px"
      >
        <template #append>
          <q-icon name="attach_money" />
        </template>
      </q-input>

      <!-- Nuevo costo unitario -->
      <q-input
        v-model="localData.precio"
        label="Nuevo costo unitario del producto*"
        class="q-mb-md"
        type="number"
        style="width: 300px"
        :rules="[(val) => !!val || 'Campo requerido']"
      >
        <template #append>
          <q-icon name="attach_money" />
        </template>
      </q-input>

      <!-- Botón de envío -->
      <q-card-actions align="right">
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
        <q-btn label="Guardar" type="submit" color="primary" />
      </q-card-actions>
    </q-form>
  </div>
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
