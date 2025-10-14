<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-primary q-mb-lg">
      <q-icon name="analytics" class="q-mr-sm" />
      Resumen del Saldo Final de Inventario
    </div>

    <q-card flat class="q-mb-xl q-pa-sm">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-primary text-white">
            <q-card-section class="row items-center">
              <q-icon name="attach_money" size="lg" class="q-mr-md" />
              <div>
                <div class="text-subtitle1">Valor Total del Saldo</div>
                <div class="text-h5 text-weight-bold">
                  {{ formatCurrency(saldoFinal.Saldo_Valorado) }}
                </div>
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              Costo total valorado de la existencia final.
            </q-tooltip>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-secondary text-white">
            <q-card-section class="row items-center">
              <q-icon name="all_inbox" size="lg" class="q-mr-md" />
              <div>
                <div class="text-subtitle1">Unidades en Existencia</div>
                <div class="text-h5 text-weight-bold">
                  {{ saldoFinal.Existencia_Final }}
                </div>
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              Cantidad de unidades disponibles en el inventario.
            </q-tooltip>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="shadow-3 bg-teal text-white">
            <q-card-section class="row items-center">
              <q-icon name="straighten" size="lg" class="q-mr-md" />
              <div>
                <div class="text-subtitle1">Costo Unitario Promedio</div>
                <div class="text-h5 text-weight-bold">
                  {{ formatCurrency(saldoFinal.Precio_Unitario_Promedio_Ponderado_Final) }}
                </div>
              </div>
            </q-card-section>
            <q-tooltip anchor="bottom middle" self="top middle">
              Precio unitario calculado mediante el promedio ponderado.
            </q-tooltip>
          </q-card>
        </div>
      </div>
    </q-card>

    <q-expansion-item
      icon="category"
      label="Detalle"
      header-class="text-weight-bold text-subtitle1 bg-blue-grey-1"
      expand-icon-class="text-primary"
      dense
      bordered
      class="rounded-borders overflow-hidden shadow-2"
    >
      <q-card>
        <q-card-section class="q-pa-none">
          <q-table
            :rows="saldoFinal.Lotes_Detalle_PEPS"
            :columns="columns"
            row-key="index"
            :rows-per-page-options="[0]"
            hide-pagination
            flat
            dense
          >
            <template v-slot:body-cell-lote="props">
              <q-td :props="props">
                <q-badge color="info" text-color="white" :label="`Lote #${props.row.index + 1}`" />
              </q-td>
            </template>

            <template v-slot:body-cell-precio_unitario="props">
              <q-td :props="props">
                {{ formatCurrency(props.row.precio_unitario) }}
              </q-td>
            </template>

            <template v-slot:body-cell-subtotal="props">
              <q-td :props="props" class="text-weight-bold">
                {{ formatCurrency(props.row.cantidad * props.row.precio_unitario) }}
              </q-td>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey-6 q-pa-md">
                <q-icon name="info" size="2em" class="q-mr-sm" />
                No hay lotes de existencia final registrados.
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// Función para formatear como moneda (puedes ajustarla según tu configuración regional)
const formatCurrency = (value) => {
  // Asumiendo moneda local (ej. USD, puedes cambiar a 'es-ES', { style: 'currency', currency: 'EUR' })
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB', // Moneda de ejemplo (Bolivianos), cámbiala según necesites
    minimumFractionDigits: 2,
  }).format(value)
}

// --- Datos Ficticios (Reemplazar con datos reales) ---
const saldoFinal = ref({
  Saldo_Valorado: 3064,
  Existencia_Final: 46,
  Lotes_Detalle_PEPS: [],
  Precio_Unitario_Promedio_Ponderado_Final: 66.6086956521739,
})

// Añadir un índice para la tabla (Mejora la clave y el uso en el template)
saldoFinal.value.Lotes_Detalle_PEPS = saldoFinal.value.Lotes_Detalle_PEPS.map((lote, index) => ({
  ...lote,
  index,
}))

// --- Definición de Columnas para q-table ---
const columns = [
  {
    name: 'lote',
    required: true,
    label: 'Lote',
    align: 'left',
    field: (row) => `Lote #${row.index + 1}`,
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Unidades',
    field: 'cantidad',
    align: 'center',
    sortable: true,
  },
  {
    name: 'precio_unitario',
    label: 'Precio Unitario',
    field: 'precio_unitario',
    align: 'right',
    format: (val) => formatCurrency(val), // El formato se maneja en el slot para mejor control
    sortable: true,
  },
  {
    name: 'subtotal',
    label: 'Valor de Lote',
    field: 'subtotal',
    align: 'right',
    sortable: true,
  },
]
</script>
