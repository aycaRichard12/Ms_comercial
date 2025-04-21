<template>
  <div class="q-pa-md container">
    <div class="q-pa-md">
      <q-btn
        color="primary"
        size="sm"
        label="Volver"
        @click="handleContinue"
        icon="arrow_back"
        class="q-mb-md"
      />
    </div>
    <div
      class="item"
      v-for="opcion in opciones"
      :key="opcion.codigo"
      @click="$emit('seleccionar', opcion.codigo)"
    >
      <q-card class="q-hoverable" flat bordered>
        <q-card-section class="text-center">
          <q-icon name="account_balance" color="primary" size="40px" />
          <div class="text-h6 q-mt-sm">{{ opcion.nombre }}</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center">
          <q-btn label="Ingresar" color="primary" flat class="q-mt-sm" />
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['continuar'])

const handleContinue = () => {
  emit('continuar') // Esto activará el toggle en el padre
}
const opciones = [
  { codigo: 'preforma', nombre: 'VENTA PERFORMA' },
  { codigo: 'facturaCV', nombre: 'FACTURA COMPRA-VENTA' },
  { codigo: 'facturaCMEX', nombre: 'FACTURA COMERCIAL DE EXPORTACIÓN' },
  { codigo: 'facturaABYM', nombre: 'FACTURA DE ALQUILER DE BIENES INMUEBLES' },
  { codigo: 'prueba', nombre: 'prueba' },
  { codigo: 'PruebaD', nombre: 'pruebaD' },
]
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.item {
  cursor: pointer;
  transition: transform 0.2s;
}

.item:hover {
  transform: scale(1.02);
}
</style>
