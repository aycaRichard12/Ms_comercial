// import Pusher from 'pusher-js'
// import { onMounted, onUnmounted } from 'vue'
// import { useQuasar } from 'quasar'
// import { idusuario_md5 } from './FuncionesGenerales'
// import emitter from 'src/event-bus'

// export function usePusher() {
//   const $q = useQuasar()
//   let pusher = null
//   let channel = null

//   const initPusher = () => {
//     pusher = new Pusher('0bc643ef8d66124dac64', {
//       cluster: 'sa1',
//       authEndpoint: process.env.VITE_API_URL,
//       auth: {
//         params: { user_id: idusuario_md5(), ver: 'authPusher' },
//       },
//     })

//     const userId = idusuario_md5()
//     channel = pusher.subscribe(`private-user-${userId}`)

//     channel.bind('nueva-notificacion', (data) => {
//       // 1. Notificación persistente de Quasar
//       $q.notify({
//         type: data.type,
//         message: data.title,
//         caption: data.message,
//         icon: data.icon,
//         position: 'top-right',
//         timeout: 0, // Persistente
//         actions: [
//           {
//             label: 'Ir ahora',
//             color: 'white',
//             handler: () => {
//               // Usamos el emitter para manejar la navegación interna según tu lógica
//               emitter.emit('abrir-submenu', data.actionPath)
//             },
//           },
//           { label: 'Cerrar', color: 'white' },
//         ],
//       })

//       // 2. Reproducir sonido (Opcional)
//       const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
//       audio.play().catch((e) => console.log('Interacción requerida para audio', e))

//       // 3. Actualizar lista de notificaciones localmente
//       emitter.emit('reiniciar-notificaciones')
//     })
//   }

//   onMounted(() => initPusher())
//   onUnmounted(() => {
//     if (channel) channel.unbind_all()
//     if (pusher) pusher.disconnect()
//   })
// }

// usePusher.js
// import Pusher from 'pusher-js'
// import { ref } from 'vue'

export function usePusher() {
  //const channel = ref(null)

  const initPusher = (userIdMd5) => {
    console.log(userIdMd5)
    // Evitar doble inicialización
    // if (pusherInstance.value) return

    // // Activar logs para ver qué pasa en la consola
    // Pusher.logToConsole = true

    // pusherInstance.value = new Pusher('0bc643ef8d66124dac64', {
    //   cluster: 'sa1',
    //   authEndpoint: process.env.VITE_API_URL,
    //   auth: {
    //     params: {
    //       user_id: userIdMd5,
    //       ver: 'authPusher',
    //     },
    //   },
    // })
    // console.log(pusherInstance.value)

    // channel.value = pusherInstance.value.subscribe(`private-user-${userIdMd5}`)

    // channel.value.bind('nueva-notificacion', (data) => {
    //   console.log('Notificación recibida:', data)
    // })
  }

  return { initPusher }
}
