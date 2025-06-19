<template>
  <q-car class="q-pa-m">
    <q-card-section>
      <h5 class="text-left q-mt-none q-mb-md">Nuevo Registro</h5>
      <q-form @submit.prevent="onSubmit" class="q-gutter-x-md">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input v-model="localData.nombre" label="Nombre Proveedor*" outlined required />
          </div>
          <div class="col-md-3">
            <q-input
              v-model="localData.codigo"
              label="Código*"
              outlined
              required
              class="col-md-3"
            />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.nit" label="NIT*" outlined required class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.detalle" label="Detalle" outlined class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.email" label="Email" outlined class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input
              v-model="localData.direccion"
              label="Dirección*"
              outlined
              required
              class="col-md-3"
            />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.telefono" label="Teléfono" outlined class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.movil" label="Movil*" outlined required class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.pais" label="País*" outlined required class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input
              v-model="localData.ciudad"
              label="Ciudad*"
              outlined
              required
              class="col-md-3"
            />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.zona" label="Zona" outlined class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.web" label="Página Web" outlined class="col-md-3" />
          </div>
          <div class="col-md-3">
            <q-input v-model="localData.contacto" label="Contacto" outlined class="col-md-3" />
          </div>
        </div>

        <!-- Hidden inputs -->
        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
          <q-btn label="Guardar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-car>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
})
const emit = defineEmits(['submit', 'cancel'])
const localData = ref({ ...props.modalValue })
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>

<style scoped>
.q-form .q-input {
  width: 100%;
}
</style>
