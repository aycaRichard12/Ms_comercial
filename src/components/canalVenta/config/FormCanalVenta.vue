<template>
  <q-form @submit.prevent="handleSubmit" class="q-ma-md">
    <q-card-section>
      <div class="text-h6 text-left">Canal Venta</div>
    </q-card-section>
    <q-card-section>
      <q-input
        v-model="localData.canal"
        label="Nombre del canal de venta*"
        outlined
        dense
        :rules="[(val) => !!val || 'Campo obligatorio']"
      />
      <q-input
        v-model="localData.descripcion"
        label="Descripción del canal de venta*"
        outlined
        dense
        :rules="[(val) => !!val || 'Campo obligatorio']"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat color="negative" @click="emit('cancel')" />
      <q-btn label="Guardar" type="submit" color="primary" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  modelValue: Object,
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

const handleSubmit = () => {
  emit('submit', localData.value)
}
</script>
