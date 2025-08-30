// src/composables/useDivisa.js
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (!contenidousuario) {
    localStorage.clear()
    window.location.assign('../../app/')
    throw new Error('Sesión inválida') // Importante: lanzar error
  }
  return contenidousuario
}

export function useDivisa() {
  const divisa = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const cargarDivisaActiva = async () => {
    loading.value = true
    error.value = null

    try {
      const contenidousuario = validarUsuario()
      const empresa = contenidousuario[0]?.empresa
      const factura = contenidousuario[0]?.factura
      const endpoint = `listaDivisa/${empresa.idempresa}/${factura.access_token}/${factura.tipo}`
      console.log(endpoint)
      const response = await api.get(endpoint)

      // Procesamiento completo como en tu versión original
      const data = response.data?.data || response.data
      console.log(data)
      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido')
      }

      const divisaActiva = data
        .filter((item) => {
          return Number(item.estado) === 1
        })
        .map((item) => ({
          id: item.id,
          nombre: item.nombre,
          tipo: item.tipo,
          codigosin: item.monedasin?.codigo || null,
          simbolo: item.tipo || '$',
          valor: item.valor,
          locale: item.locale || 'es-CO',
          current: item.current || 'COP',
        }))[0]

      if (!divisaActiva) {
        throw new Error('No se encontró divisa activa')
      }
      console.log(divisaActiva)

      divisa.value = divisaActiva
    } catch (err) {
      error.value = err
      console.error('Error al cargar divisa:', err)

      // Valores por defecto
      divisa.value = {
        id: null,
        nombre: 'Dólar',
        simbolo: '$',
        codigosin: 'USD',
      }

      // Opcional: redirigir si es error de autenticación
      if (err.message.includes('Sesión inválida')) {
        window.location.assign('../../app/')
      }
    } finally {
      loading.value = false
    }
  }

  return {
    divisa,
    loading,
    error,
    cargarDivisaActiva,
    simbolo: computed(() => divisa.value?.tipo || '$'),
  }
}
