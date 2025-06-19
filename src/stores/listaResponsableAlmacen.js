import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesGenerales'

export const useAlmacenStore = defineStore('almacen', () => {
  const $q = useQuasar()
  const almacenes = ref([])

  async function listaAlmacenes() {
    try {
      const contenidousuario = validarUsuario()
      if (!contenidousuario || contenidousuario.length === 0) {
        console.error('Contenido de usuario no encontrado.')
        return
      }

      const idempresa = contenidousuario[0]?.empresa?.idempresa
      const idusuario = contenidousuario[0]?.idusuario

      if (!idempresa || !idusuario) {
        console.error('Falta idempresa o idusuario en el contenido del usuario.')
        return
      }

      const endpoint = `/listaResponsableAlmacen/${idempresa}`
      const response = await api.get(endpoint)
      const resultado = response.data

      if (resultado && resultado[0] === 'error') {
        console.error('Error desde la API:', resultado.error)
        $q.notify({
          type: 'negative',
          message: `Error al cargar almacenes: ${resultado.error}`,
        })
      } else if (Array.isArray(resultado)) {
        // Solo almacenes asignados al usuario actual
        const userAlmacenes = resultado.filter((u) => u.idusuario == idusuario)
        almacenes.value = userAlmacenes
      } else {
        console.error('Respuesta inesperada al cargar almacenes:', resultado)
        $q.notify({
          type: 'negative',
          message: 'Formato de respuesta inesperado al cargar almacenes.',
        })
      }
    } catch (error) {
      console.error('Error al obtener almacenes:', error)
      $q.notify({
        type: 'negative',
        message:
          'No se pudo conectar con el servidor para cargar almacenes o hubo un error en la solicitud.',
      })
    }
  }

  return {
    almacenes,
    listaAlmacenes,
  }
})
