<template>
  <q-car class="q-pa-m">
    <q-card-section>
      <h5 class="text-left q-mt-none q-mb-md">Nuevo Registro</h5>
      <q-form @submit.prevent="onSubmit" class="q-gutter-x-md">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.nombre"
              label="Razón Social *"
              :rules="[(val) => !!val || 'Campo Obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.nombrecomercial"
              label="Nombre Comercial *"
              :rules="[(val) => !!val || 'Campo Obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              outlined
              v-model="localData.tipocliente"
              :options="tipoClienteOptions"
              label="Tipo de Cliente *"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un tipo']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              outlined
              v-model="localData.canalventa"
              :options="canalVentaOptions"
              label="Canal de venta *"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un canal']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              outlined
              v-model="localData.tipodocumento"
              :options="tipoDocumetosOptions"
              label="Tipo de Documentos *"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un tipo']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.nrodocumento"
              label="Nro De Documento"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.email" label=" Email" />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.direccion" label="Dirección" />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.telefono" label="Teléfono" />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.movil"
              label="Movil *"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.pais"
              label="País *"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.ciudad"
              label="Ciudad *"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.zona" label="Zona" />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.web" label="Página Web" />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.contacto" label="Contacto" />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.detalle" label="Detalle" />
          </div>
        </div>
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
  tipoClienteOptions: Array,
  canalVentaOptions: Array,
  tipoDocumetosOptions: Array,
})
const emit = defineEmits(['submit', 'cancel'])
const localData = ref({ ...props.modalValue })
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>
