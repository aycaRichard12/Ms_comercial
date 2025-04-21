<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ editing ? 'Editar Unidad' : 'Nueva Unidad' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="handleSubmit">
        <!-- Campos ocultos -->
        <input type="hidden" name="ver" :value="formData.ver" />
        <input type="hidden" name="idempresa" :value="formData.idempresa" />

        <div class="row q-col-gutter-md">
          <div class="col-md-6">
            <q-input
              v-model="formData.nombre"
              label="Unidad del producto*"
              outlined
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-md-6">
            <q-input
              v-model="formData.descripcion"
              label="Descripción*"
              outlined
              dense
              :rules="[(val) => !!val || 'Campo requerido']"
            />
          </div>

          <div class="col-12 text-center q-mt-md">
            <q-btn :label="editing ? 'Actualizar' : 'Registrar'" type="submit" color="primary" />
            <q-btn
              label="Cancelar"
              type="button"
              color="negative"
              class="q-ml-sm"
              @click="handleCancel"
              flat
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  editing: Boolean,
  currentItem: Object,
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  ver: 'registrarUnidadProducto',
  idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
  nombre: '',
  descripcion: '',
})

watch(
  () => props.currentItem,
  (newVal) => {
    if (newVal && props.editing) {
      formData.value = {
        ver: 'actualizarUnidadProducto',
        idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
        nombre: newVal.unidad,
        descripcion: newVal.descripcion,
        id: newVal.id,
      }
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', formData.value)
}

const handleCancel = () => {
  formData.value = {
    ver: 'registrarUnidadProducto',
    idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
    nombre: '',
    descripcion: '',
  }
  emit('cancel')
}
</script>
