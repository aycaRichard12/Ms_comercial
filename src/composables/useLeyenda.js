import { ref } from 'vue'
import { api } from 'boot/axios'

function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))

  if (!contenidousuario || !Array.isArray(contenidousuario) || contenidousuario.length === 0) {
    localStorage.clear()
    window.location.assign('../../app/')
    throw new Error('Sesión inválida')
  }

  return contenidousuario
}

export function useLeyenda() {
  const leyenda = ref(null)
  const loading = ref(false)
  const error = ref(null)

  let contenidousuario = null
  let empresa = null
  let factura = null

  try {
    contenidousuario = validarUsuario()
    empresa = contenidousuario[0]?.empresa
    factura = contenidousuario[0]?.factura

    if (!empresa || !factura || !empresa.idempresa || !factura.access_token || !factura.tipo) {
      throw new Error('Datos incompletos para cargar leyenda')
    }
  } catch (err) {
    error.value = err
    console.error('Error de validación de usuario o datos faltantes:', err.message)
    leyenda.value = {
      id: null,
      codigosin: '',
    }
    return {
      leyenda,
      loading,
      error,
      cargarLeyendaActivo: async () => {}, // función vacía en caso de error inmediato
    }
  }

  const cargarLeyendaActivo = async () => {
    loading.value = true
    error.value = null

    try {
      const endpoint = `listaLeyendaFactura/${empresa.idempresa}/${factura.access_token}/${factura.tipo}`
      console.log('Consultando endpoint:', endpoint)

      const response = await api.get(endpoint)
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : []

      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido')
      }

      console.log('Respuesta de leyenda:', data)

      const leyendaActiva = data
        .filter((item) => Number(item.estado) === 1)
        .map((item) => ({
          id: item.id,
          codigosin: item.leyendasin.codigo,
        }))[0]

      if (!leyendaActiva) {
        throw new Error('No se encontró leyenda activa')
      }

      leyenda.value = leyendaActiva
      console.log('Leyenda activa cargada:', leyendaActiva)
    } catch (err) {
      error.value = err
      console.error('Error al cargar leyenda:', err.message)

      leyenda.value = {
        id: null,
        codigosin: '',
      }

      if (err.message.includes('Sesión inválida')) {
        window.location.assign('../../app/')
      }
    } finally {
      loading.value = false
    }
  }

  return {
    leyenda,
    loading,
    error,
    cargarLeyendaActivo,
  }
}
