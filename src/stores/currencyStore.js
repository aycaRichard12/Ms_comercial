import { defineStore } from 'pinia'
import { useDivisa } from 'src/composables/useDivisa'

export const useCurrencyStore = defineStore('currency', () => {
  const { divisa, loading, error, cargarDivisaActiva, simbolo } = useDivisa()

  return {
    divisa,
    loading,
    error,
    cargarDivisaActiva,
    simbolo,
  }
})
