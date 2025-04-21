<template>
  <q-card class="shadow-2">
    <!-- Encabezado -->
    <q-card-section class="row items-center">
      <div class="col-md-4">
        <q-btn color="primary" icon="arrow_back" label="Volver" @click="volver" class="q-mr-sm" />
        <q-btn
          color="secondary"
          icon="home"
          label="Inicio"
          @click="irInicio"
          v-if="mostrarBotonInicio"
        />
      </div>
      <div class="col-md-8 text-center">
        <h5 class="text-h5 q-my-none">Seleccione el tipo de venta</h5>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Tarjetas de tipos de venta -->
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Tarjeta para cada tipo de venta -->
        <div
          v-for="tipo in tiposVentaFiltrados"
          :key="tipo.codigoDocumentSector"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card
            class="cursor-pointer hover-card"
            @click="seleccionarTipo(tipo)"
            :class="{ 'bg-primary text-white': tipoSeleccionado === tipo.codigoDocumentSector }"
          >
            <q-card-section class="text-center q-pa-lg">
              <q-icon
                :name="obtenerIcono(tipo.codigoDocumentSector)"
                size="xl"
                :color="tipoSeleccionado === tipo.codigoDocumentSector ? 'white' : 'primary'"
              />
              <div class="text-h6 q-mt-md">
                {{ tipo.documentoSector }}
              </div>
              <q-chip
                v-if="tipo.codigoDocumentSector === 0"
                color="green"
                text-color="white"
                class="q-mt-sm"
              >
                Sin factura
              </q-chip>
              <q-chip v-else color="blue" text-color="white" class="q-mt-sm"> Con factura </q-chip>
              <div class="text-caption q-mt-sm text-grey">
                {{ tipo.tipoFactura }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions class="justify-center">
              <q-btn
                color="primary"
                label="Seleccionar"
                :flat="tipoSeleccionado !== tipo.codigoDocumentSector"
                :outline="tipoSeleccionado !== tipo.codigoDocumentSector"
                @click.stop="seleccionarTipo(tipo)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Información adicional -->
    <q-card-section v-if="tipoSeleccionado !== null" class="bg-grey-2">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">Información del tipo seleccionado:</div>
      <div v-if="tipoActual">
        <p>{{ tipoActual.tipoFactura }}</p>
        <p class="text-caption">
          Código: {{ tipoActual.codigoDocumentSector }} | Sucursal: {{ tipoActual.codigoSucursal }}
        </p>
      </div>
    </q-card-section>

    <!-- Acciones -->
    <q-card-actions align="right" class="q-pa-md">
      <q-btn label="Cancelar" color="negative" flat @click="cancelar" class="q-mr-sm" />
      <q-btn
        label="Continuar"
        color="positive"
        :disable="tipoSeleccionado === null"
        @click="confirmarSeleccion"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useVentasStore } from 'stores/ventas'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const ventasStore = useVentasStore()
const { tiposVenta } = storeToRefs(ventasStore)

// Props

// Emits
const emit = defineEmits(['seleccionar-tipo', 'volver', 'ir-inicio', 'cancelar'])

// Estado local
const tipoSeleccionado = ref(null)
const cargando = ref(false)

// Computed
const tipoActual = computed(() => {
  return tiposVenta.value.find((t) => t.codigoDocumentSector === tipoSeleccionado.value)
})

const tiposVentaFiltrados = computed(() => {
  return tiposVenta.value.filter((t) => t.isActive === 1)
})

// Métodos
function obtenerIcono(codigoTipo) {
  const iconos = {
    0: 'receipt', // Comprobante
    1: 'shopping_cart', // Compra-Venta
    2: 'apartment', // Alquileres
    3: 'flight', // Exportación
    4: 'local_shipping', // Importación
  }
  return iconos[codigoTipo] || 'payments'
}

async function seleccionarTipo(tipo) {
  tipoSeleccionado.value = tipo.codigoDocumentSector
}

function confirmarSeleccion() {
  if (tipoSeleccionado.value === null) {
    $q.notify({
      type: 'warning',
      message: 'Por favor seleccione un tipo de venta',
      position: 'top',
    })
    return
  }

  emit('seleccionar-tipo', tipoSeleccionado.value)
}

function volver() {
  emit('volver')
}

function irInicio() {
  emit('ir-inicio')
}

function cancelar() {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro que desea cancelar la venta?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    ventasStore.limpiarCarrito()
    emit('cancelar')
  })
}

// Ciclo de vida
onMounted(async () => {
  if (tiposVenta.value.length === 0) {
    cargando.value = true
    try {
      await ventasStore.cargarTiposVenta()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar tipos de venta',
        caption: error.message,
        position: 'top',
      })
    } finally {
      cargando.value = false
    }
  }
})
</script>

<style lang="scss" scoped>
.hover-card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.q-card {
  border-radius: 10px;
  overflow: hidden;
}

.text-h6 {
  font-size: 1.1rem;
  font-weight: 500;
}

.q-chip {
  font-size: 0.75rem;
}
</style>
