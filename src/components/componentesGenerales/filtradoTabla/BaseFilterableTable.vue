<template>
  <q-table
    :title="title"
    :rows="filteredData"
    :columns="columns"
    :row-key="rowKey"
    :filter="search"
    :pagination="{ rowsPerPage: 10 }"
  >
    <template v-slot:header-cell="props">
      <q-th
        :props="props"
        @click="props.col.sortable && props.sort(props.col)"
        class="cursor-pointer text-left no-sort-icon"
        style="white-space: normal; vertical-align: top"
      >
        <div class="flex items-start no-wrap">
          <div class="flex items-center text-weight-bold q-pr-sm">
            {{ props.col.label }}
          </div>
          <ColumnFilter
            v-if="arrayHeaders.includes(props.col.name)"
            :column="props.col"
            :rows="preFilteredRowsForColumn(props.col)"
            :active-filter="activeFilters[props.col.name]"
            :sort-direction="
              pagination.sortBy === props.col.name ? (pagination.descending ? 'desc' : 'asc') : null
            "
            :data-type="props.col.dataType || 'text'"
            @column-filter-changed="handleFilterChange"
            @column-sort-changed="handleSortChange"
          />
        </div>
      </q-th>
    </template>

    <template v-for="(_, slot) in $slots" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </q-table>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import ColumnFilter from './ColumnFilter.vue' // Asegúrate de que la ruta sea correcta

const props = defineProps({
  title: { type: String, default: 'Datos' },
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  arrayHeaders: { type: Array, default: () => [] }, // Columnas que permiten filtrado
  rowKey: { type: String, default: 'id' },
  search: { type: String, default: '' },
  filterMode: { type: String, default: 'client' }, // 'client' o 'server'
})

const emit = defineEmits(['column-filter-changed'])

const activeFilters = ref({})
const pagination = ref({
  sortBy: null, // Columna por la que se ordena
  descending: false, // Dirección del orden
})

// --- Lógica de Filtrado ---

/**
 * Función que evalúa la condición lógica para un valor dado.
 */
function evaluateCondition(rowValue, condition) {
  if (!condition.active) return true

  // Normalizar a string para comparación de texto
  const value = String(rowValue || '').toLowerCase()
  const v1 = String(condition.value1 || '').toLowerCase()

  // Normalizar a número para comparación numérica
  const numValue = Number(rowValue)
  const numV1 = Number(condition.value1)
  const numV2 = Number(condition.value2)

  const isNumeric = !isNaN(numValue) && !isNaN(numV1)

  // Condición Textual
  if (!isNumeric) {
    switch (condition.operator) {
      case 'contains':
        return value.includes(v1)
      case 'equals':
        return value === v1
      case 'starts with':
        return value.startsWith(v1)
      case 'ends with':
        return value.endsWith(v1)
      default:
        return false
    }
  }

  // Condición Numérica
  if (isNumeric) {
    switch (condition.operator) {
      case 'equals':
        return numValue === numV1
      case 'not equals':
        return numValue !== numV1
      case '>':
        return numValue > numV1
      case '<':
        return numValue < numV1
      case '>=':
        return numValue >= numV1
      case '<=':
        return numValue <= numV1
      case 'between':
        return numValue >= numV1 && numValue <= numV2
      default:
        return false
    }
  }
  return false
}

/**
 * Aplica todos los filtros activos de columna (lógica AND) y la ordenación.
 */
const filteredData = computed(() => {
  if (props.filterMode === 'server') {
    return props.rows // No filtrar en cliente
  }

  let data = props.rows

  // 1. Aplicar filtros de columna (Lógica AND entre columnas)
  Object.keys(activeFilters.value).forEach((colName) => {
    const filter = activeFilters.value[colName]
    const column = props.columns.find((c) => c.name === colName)
    if (!filter || !column) return

    data = data.filter((row) => {
      // Usar el valor del campo definido en las columnas
      const rowValue = row[column.field]
      let passesFilter = false

      if (filter.type === 'values' && filter.values.length > 0) {
        // Lógica OR: pasa si el valor está en la lista de seleccionados
        passesFilter = filter.values.includes(String(rowValue || '-').trim())
      } else if (filter.type === 'condition' && filter.condition && filter.condition.active) {
        // Lógica de Condiciones
        passesFilter = evaluateCondition(rowValue, filter.condition)
      } else {
        // Si el filtro está activo, pero vacío (ej: se seleccionó un filtro y luego se deseleccionó todo),
        // la fila NO pasa a menos que el filtro haya sido limpiado completamente,
        // lo cual se maneja eliminando la entrada de activeFilters.
        // Si el filtro existe en activeFilters, siempre debe pasar por uno de los IF de arriba
        // para que el filtro funcione.
        return true // Si la entrada existe pero no tiene valores/condición activa, debería haber sido eliminada
      }

      return passesFilter
    })
  })

  // 2. Aplicar ordenación
  const { sortBy, descending } = pagination.value
  if (sortBy) {
    const sortField = props.columns.find((c) => c.name === sortBy)?.field || sortBy

    data.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]

      let comparison = 0
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB
      } else {
        // Asegura comparación de strings
        comparison = String(valA || '').localeCompare(String(valB || ''))
      }

      return descending ? -comparison : comparison
    })
  }

  // 3. Aplicar filtro de búsqueda global (delegado a q-table, pero lo aplicamos si no hay filtros activos para mejor rendimiento visual)
  // Nota: q-table ya maneja el prop :filter, pero si usamos esta computed property para las filas,
  // la búsqueda global solo operará sobre los datos ya filtrados por columnas.

  // Opcional: Implementación manual de la búsqueda global (si se requiere)
  /* const searchLower = props.search.toLowerCase()
  if (searchLower) {
      data = data.filter(row => 
          Object.values(row).some(val => 
              String(val).toLowerCase().includes(searchLower)
          )
      )
  }
  */

  return data
})

/**
 * Proporciona las filas a ColumnFilter.vue para que calcule los valores únicos.
 * Esto es vital para que la lista de valores de una columna A no incluya valores
 * que ya han sido filtrados por otra columna B.
 */
function preFilteredRowsForColumn(currentColumn) {
  let data = props.rows

  // Aplicar todos los filtros MENOS el filtro de la columna actual
  Object.keys(activeFilters.value).forEach((colName) => {
    if (colName === currentColumn.name) return // Omitir el filtro de la columna actual

    const filter = activeFilters.value[colName]
    const column = props.columns.find((c) => c.name === colName)
    if (!filter || !column) return

    data = data.filter((row) => {
      const rowValue = row[column.field]

      if (filter.type === 'values' && filter.values.length > 0) {
        return filter.values.includes(String(rowValue || '-').trim())
      } else if (filter.type === 'condition' && filter.condition && filter.condition.active) {
        return evaluateCondition(rowValue, filter.condition)
      }
      return true
    })
  })
  return data
}

// --- Manejadores de Eventos ---

function handleFilterChange(payload) {
  const colName = payload.column.name

  if (payload.values?.length > 0 || (payload.condition && payload.condition.active)) {
    // Aplica o actualiza el filtro
    activeFilters.value = { ...activeFilters.value, [colName]: payload }
  } else {
    // Elimina el filtro si no hay valores/condición activa
    delete activeFilters.value[colName]
    activeFilters.value = { ...activeFilters.value } // Forzar reactividad
  }

  // Notifica al componente padre si el modo es "server"
  if (props.filterMode === 'server') {
    const serverPayload = {}
    Object.keys(activeFilters.value).forEach((key) => {
      serverPayload[key] = {
        type: activeFilters.value[key].type,
        values: activeFilters.value[key].values,
        condition: activeFilters.value[key].condition,
      }
    })
    emit('column-filter-changed', serverPayload)
  }
}

function handleSortChange(payload) {
  const { column, direction } = payload
  pagination.value.sortBy = direction === null ? null : column.name
  pagination.value.descending = direction === 'desc'
}
</script>

<style>
/* Estilo para ocultar el icono de ordenación por defecto de q-table */
.q-table th.no-sort-icon .q-table__sort-icon {
  display: none !important;
}
</style>
