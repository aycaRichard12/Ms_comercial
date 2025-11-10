<template>
  <q-btn
    round
    :icon="isListening ? 'mic_off' : 'mic'"
    :color="isListening ? 'red' : 'primary'"
    size="md"
    @click="toggleListening"
    :loading="isProcessing"
  >
    <template v-slot:loading>
      <q-spinner v-if="isProcessing || isListening" size="1em" color="white" />
    </template>
  </q-btn>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaHoraNumerica } from 'src/composables/FuncionesG'
// Globales del navegador
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechSynthesisUtterance =
  window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance

// Instancias de Quasar y Vue Router
const { proxy } = getCurrentInstance() // Acceso a this.$q y this.$axios
const $router = useRouter()
const $q = proxy.$q
const $axios = proxy.$axios

// --- ESTADO REACTIVO ---
const PHP_ENDPOINT_URL = 'https://vivasoft.link/app/cmv1/api/detectar_intencion'

const isListening = ref(false)
const isProcessing = ref(false)
const sessionId = ref(null) // Ahora es una referencia reactiva
const recognition = ref(null)

// --- UTILIDADES ---

const notify = (message, type = 'info') => {
  $q.notify({
    message: message,
    color: type === 'negative' ? 'negative' : type === 'positive' ? 'positive' : 'info',
    position: 'top',
    timeout: 2000,
  })
}

const emitirVoz = (texto) => {
  if ('speechSynthesis' in window && texto) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-ES'
    window.speechSynthesis.speak(utterance)
  }
}

// --- GESTIÓN DE SESIÓN ---

const createOrRetrieveSessionId = () => {
  let id = idusuario_md5() + obtenerFechaHoraNumerica().toString()

  if (!id) {
    // Generar un ID simple y guardar para persistencia
    id = 'guest-' + Date.now() + Math.random().toString(36).substring(2, 9)
    localStorage.setItem('dialogflow_session_id', id)
  }

  sessionId.value = id
  console.log(`[Session] Dialogflow Session ID: ${sessionId.value}`)
}

// --- LÓGICA DE ACCIÓN Y NAVEGACIÓN ---

const ejecutarAccion = (data) => {
  const { intencion, respuestaPorVoz } = data
  console.log(`[Acción] Ejecutando acción para la intención: ${intencion}`)
  // 1. Retroalimentación
  emitirVoz(respuestaPorVoz)
  notify(respuestaPorVoz, 'positive')

  // 2. Ejecutar Lógica de Quasar/Vue Router
  switch (intencion) {
    case 'navegar.contacto':
      $router.push('/contacto')
      break
    case 'navegar.perfil':
      $router.push('/perfil')
      break
    case 'navegar.ajustes':
      $router.push('/settings')
      break
    case 'cerrar.sesion':
      $q.loading.show({ message: 'Cerrando sesión...' })
      setTimeout(() => {
        $q.loading.hide()
        $router.push('/login')
      }, 1500)
      break

    case 'Default Fallback Intent':
      break // Ya manejado por la respuestaPorVoz de Dialogflow

    default:
      console.log(`[Acción] Intención reconocida pero sin acción de Quasar definida: ${intencion}`)
      break
  }
}

// --- LÓGICA DE VOZ Y HTTP ---

const setupSpeechRecognition = () => {
  if (!SpeechRecognition) {
    console.error('ERROR: Tu navegador no soporta el reconocimiento de voz.')
    notify('El control por voz no está disponible en este navegador.', 'negative')
    return
  }

  recognition.value = new SpeechRecognition()
  recognition.value.lang = 'es-ES'
  recognition.value.interimResults = false
  recognition.value.maxAlternatives = 1

  recognition.value.onstart = () => {
    isListening.value = true
    notify('Habla ahora...')
  }

  recognition.value.onresult = (event) => {
    const command = event.results[0][0].transcript
    console.log(`[Voz] Comando reconocido: "${command}"`)
    sendToDialogflow(command)
  }

  recognition.value.onend = () => {
    isListening.value = false
  }

  recognition.value.onerror = (event) => {
    isListening.value = false
    isProcessing.value = false
    console.error(`[Voz] Error: ${event.error}`)
    notify('Error al escuchar. Inténtalo de nuevo.', 'negative')
  }
}

const toggleListening = () => {
  if (isProcessing.value) return

  if (isListening.value) {
    recognition.value.stop()
  } else {
    try {
      isListening.value = true
      recognition.value.start()
    } catch (e) {
      notify('Asegúrate de conceder permiso al micrófono.', 'negative')
      console.error('Error al iniciar micrófono:', e)
    }
  }
}

const sendToDialogflow = async (command) => {
  isProcessing.value = true
  notify('Procesando comando...', 'info')

  try {
    const response = await $axios.post(PHP_ENDPOINT_URL, {
      comando: command,
      sessionId: sessionId.value, // Usamos el valor de la referencia reactiva
    })

    const data = response.data
    console.log(`[IA] Intención: ${data.intencion}, Respuesta: "${data.respuestaPorVoz}"`)

    ejecutarAccion(data)
  } catch (error) {
    notify('Error de comunicación con el servidor. Revisar consola.', 'negative')
    emitirVoz('Lo siento, no pude comunicarme con el servidor.')
    console.error('Error en la petición PHP/Dialogflow:', error)
  } finally {
    isProcessing.value = false
  }
}

// --- CICLO DE VIDA ---

onMounted(() => {
  createOrRetrieveSessionId() // Inicializa o recupera el ID de sesión
  setupSpeechRecognition()
})
</script>
