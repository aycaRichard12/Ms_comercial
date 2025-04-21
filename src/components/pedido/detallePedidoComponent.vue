<template>
  <q-dialog :model-value="visible" @update:model-value="actualizarVisibilidad">
    <q-card style="min-width: 1000px">
      <q-card-section>
        <div class="text-h6">Detalles del Pedido</div>
      </q-card-section>

      <detalleFormulario />
      <detalleTabla />
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" @click="cerrar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import detalleFormulario from './detallePedidoForm.vue'
import detalleTabla from './detallePedidoTable.vue'

// Definir propiedades
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  detalle: {
    type: Object,
    default: () => ({}),
  },
})
console.log(props)
// Emitir eventos
const emit = defineEmits(['update:visible'])

// Métodos
const actualizarVisibilidad = (valor) => {
  emit('update:visible', valor) // Notificar al componente padre sobre cambios
}

const cerrar = () => {
  emit('update:visible', false) // Notificar el cierre al padre
}
</script>
