import { useQuasar } from 'quasar'
import { useProveedorStore } from 'stores/proveedor' // crea este store si no lo tienes

export function useWhatsapp() {
  const $q = useQuasar()
  const proveedorStore = useProveedorStore()

  const mostrarDialogoWhatsapp = async (mensaje) => {
    try {
      // const mensajeResponse = await api.get(`mensajePedidoWhatsapp/${idPedido}`)
      // const mensaje = mensajeResponse.data.mensaje

      // Asegúrate de tener proveedores en listaProveedores
      if (proveedorStore.lista.length === 0) {
        await proveedorStore.getProveedor()
      }

      $q.dialog({
        title: 'Enviar por WhatsApp',
        message: 'Seleccione proveedor:',
        options: {
          type: 'radio',
          model: '',
          items: proveedorStore.lista.map((p) => ({
            label: `${p.nombre} (${p.telefono})`,
            value: p.telefono.replace(/\D/g, ''), // solo dígitos
          })),
        },
        cancel: true,
        persistent: true,
      }).onOk((numero) => {
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
      })
    } catch (error) {
      console.error('Error al obtener mensaje de pedido:', error)
      $q.notify({ type: 'negative', message: 'No se pudo generar el mensaje para WhatsApp' })
    }
  }

  return { mostrarDialogoWhatsapp }
}
