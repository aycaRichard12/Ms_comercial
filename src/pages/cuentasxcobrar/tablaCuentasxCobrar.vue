<template>
  <BaseFilterableTable
    ref="refHijo"
    title="Cuentas por Cobrar"
    nombreColumnaTotales="cuotasProcesadas"
    :rows="props.rows"
    :columns="columnas"
    :arrayHeaders="ArrayHeaders"
    :sumColumns="summationHeaders"
    row-key="id"
    flat
    bordered
    class="q-ma-sm"
  >
    <template #body-cell-acciones="props">
      <q-td align="center">
        <q-btn
          v-if="Number(privilegios[1]) !== 0 && [1, 3].includes(Number(props.row.estado))"
          icon="add_circle"
          color="primary"
          round
          :id="'btn-' + props.row.id"
          @click="$emit('cargarFormulario', props.row)"
          title="Registrar cobro"
        />
        <!-- <span class="text-caption q-ml-sm">
                Condition:
                {{ privilegios[1] !== 0 && [1, 3].includes(props.row.estado) }} (Privilege[1]:
                {{ privilegios[1] }}, Estado: {{ props.row.estado }})
              </span> -->
        <q-btn
          icon="list_alt"
          color="info"
          round
          @click="$emit('mostrarDetalles', props.row)"
          title="Ver listado de cobros"
        />
      </q-td>
    </template>
  </BaseFilterableTable>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
const refHijo = ref(null)

// Propiedades recibidas del componente padre
const props = defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})
defineExpose({ obtenerDatos: () => ejecutarDesdePadre(), getActiveFiltersReport })
function getActiveFiltersReport() {
  return refHijo.value.getActiveFiltersReport()
}

function ejecutarDesdePadre() {
  const resultado = refHijo.value.obtenerDatosFiltrados()
  console.log('Resultado recibido del hijo:', resultado)
  return resultado
}

// Eventos que serán emitidos al componente padre
defineEmits(['cargarFormulario', 'mostrarDetalles', 'column-filter-changed'])

// Mapeo de tipos de venta (copiado de la lógica del archivo original)

// Definición de las columnas (CORREGIDA: se añade 'sortable: true' a las columnas)
const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'cliente', label: 'Razon Social', field: 'cliente', align: 'left' },
  { name: 'factura', label: 'N° Factura', field: 'nfactura', align: 'center' },
  {
    name: 'fecha',
    label: 'Fecha Crédito',
    field: 'fechaventa',
    align: 'center',
  },
  {
    name: 'vencimiento',
    label: 'Vencimiento',
    field: 'fechalimite',
    align: 'center',
  },
  { name: 'cuotas', label: 'N° Cuotas', field: 'ncuotas', align: 'center' },
  {
    name: 'cuotasProcesadas',
    label: 'Cuotas Procesadas',
    field: 'cuotasProcesadas',
    align: 'center',
  },
  {
    name: 'totalVenta',
    label: 'Total Venta',
    field: 'ventatotal',
    align: 'right',
  },
  {
    name: 'totalCobrado',
    label: 'Total Cobrado',
    field: 'totalCobrado',
    align: 'right',
  },
  {
    name: 'saldo',
    label: 'Saldo',
    field: 'saldo',
    align: 'right',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: '', align: 'center' },
]

// Headers para la tabla filtrable (copiado del archivo original)
const ArrayHeaders = [
  'cliente',
  'factura',
  'fecha',
  'vencimiento',
  'cuotas',
  'cuotasProcesadas',
  'totalVenta',
  'totalCobrado',
  'saldo',
  'estado',
]
const summationHeaders = ['totalVenta', 'totalCobrado', 'saldo']
</script>
