<template>
  <q-dialog v-model="mostrar">
    <q-card class="q-pa-md" style="min-width: 300px; max-width: 400px">
      <q-card-section>
        <div class="text-h6">Subir Voucher</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-btn icon="photo" label="Subir Archivo" color="primary" @click="seleccionarImagen" />
        <q-btn icon="camera_alt" label="Usar Cámara" color="secondary" @click="usarCamara" />
        <input
          ref="inputImagen"
          type="file"
          accept="image/*,application/pdf"
          class="hidden"
          @change="onImagenSeleccionada"
        />

        <div v-if="imagenPreview || selectedFile">
          <div v-if="isPdfSelected" class="q-mt-md flex flex-center column">
            <q-icon name="picture_as_pdf" size="6em" color="red-8" />
            <div class="q-mt-sm text-center text-weight-medium">
              Archivo PDF Seleccionado: <br />{{ selectedFile.name }}
            </div>
          </div>
          <q-img v-else :src="imagenPreview" class="q-mt-md" style="max-height: 200px" />

          <q-btn
            class="q-mt-md full-width"
            label="Subir Voucher"
            color="positive"
            @click="subirVoucher"
            :loading="subiendo"
            :disable="!selectedFile"
          />
        </div>

        <q-dialog v-model="mostrarCamara" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">Captura con Cámara</div>
              <video ref="video" autoplay playsinline style="width: 100%; height: auto" />
              <div class="q-mt-md flex justify-around">
                <q-btn
                  color="primary"
                  icon="photo_camera"
                  label="Capturar"
                  @click="capturarImagen"
                />
                <q-btn flat label="Cancelar" color="negative" @click="cerrarCamara" />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="grey" @click="cerrar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onBeforeUnmount, watch, nextTick, computed } from 'vue' // Import 'computed'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const mostrar = defineModel({ type: Boolean })
const props = defineProps({
  idPedido: {
    type: [String, Number],
    required: true,
  },
})
const emit = defineEmits(['voucher-uploaded', 'closed'])

const imagenPreview = ref(null) // URL for displaying image preview
const selectedFile = ref(null) // The actual File object to be uploaded
const mostrarCamara = ref(false)
const inputImagen = ref(null)
const video = ref(null)
let stream = null
const subiendo = ref(false)

// New computed property to check if the selected file is a PDF
const isPdfSelected = computed(() => {
  return selectedFile.value && selectedFile.value.type === 'application/pdf'
})

const seleccionarImagen = () => {
  inputImagen.value?.click()
}

const onImagenSeleccionada = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file // Store the actual file
    // Only create URL for image previews
    if (file.type.startsWith('image/')) {
      imagenPreview.value = URL.createObjectURL(file)
    } else {
      imagenPreview.value = null // Clear image preview if PDF or other type
    }
  }
}

const usarCamara = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $q.notify({
        type: 'negative',
        message: 'Tu navegador no soporta la cámara.',
      })
      return
    }

    // Set mostrarCamara to true FIRST to open the dialog
    mostrarCamara.value = true

    // Request camera stream
    stream = await navigator.mediaDevices.getUserMedia({ video: true })

    // Use nextTick to wait for the dialog and video element to be rendered
    await nextTick()

    if (video.value) {
      video.value.srcObject = stream
      video.value.play() // Explicitly call play() after assigning srcObject
    } else {
      console.error('Video element not found after nextTick.')
      $q.notify({
        type: 'negative',
        message: 'Error al iniciar la cámara: elemento de video no disponible.',
      })
      cerrarCamara()
    }
  } catch (error) {
    console.error('No se pudo acceder a la cámara:', error)
    let errorMessage = 'No se pudo acceder a la cámara.'
    if (error.name === 'NotAllowedError') {
      errorMessage =
        'Acceso a la cámara denegado. Por favor, permite el acceso en la configuración de tu navegador.'
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No se encontró una cámara disponible.'
    } else if (error.name === 'NotReadableError') {
      errorMessage =
        'La cámara ya está en uso o no se puede leer. Intenta cerrar otras aplicaciones que usen la cámara.'
    } else if (error.name === 'OverconstrainedError') {
      errorMessage =
        'No se encontraron las capacidades de cámara requeridas. Intenta con una cámara diferente.'
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
    })
    cerrarCamara()
  }
}

const capturarImagen = () => {
  if (!video.value || !stream) {
    $q.notify({ type: 'warning', message: 'Cámara no lista para capturar.' })
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight
  const context = canvas.getContext('2d')
  context.drawImage(video.value, 0, 0, canvas.width, canvas.height)

  canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], `voucher_camera_${Date.now()}.png`, { type: 'image/png' })
      selectedFile.value = file
      imagenPreview.value = URL.createObjectURL(file) // Preview captured image
      $q.notify({ type: 'info', message: 'Imagen capturada.' })
    } else {
      $q.notify({ type: 'negative', message: 'Error al capturar la imagen.' })
    }
  }, 'image/png')

  cerrarCamara()
}

const cerrarCamara = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    if (video.value) {
      video.value.srcObject = null
    }
    stream = null
  }
  mostrarCamara.value = false
}

const subirVoucher = async () => {
  if (!selectedFile.value) {
    $q.notify({ type: 'warning', message: 'Primero selecciona o captura un archivo.' }) // Updated message
    return
  }
  if (!props.idPedido) {
    $q.notify({ type: 'negative', message: 'No se ha proporcionado el ID del pedido.' })
    return
  }

  subiendo.value = true
  try {
    const formData = new FormData()
    formData.append('idpedido', props.idPedido)
    formData.append('recibo', selectedFile.value)

    const response = await api.post('uploadRecibo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Voucher subido exitosamente.',
      })
      emit('voucher-uploaded', response.data.ruta_recibo)
      cerrar()
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Error al subir el voucher.',
      })
    }
  } catch (error) {
    console.error('Error al subir el voucher:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de conexión al subir el voucher.',
      caption: error.message,
    })
  } finally {
    subiendo.value = false
  }
}

const cerrar = () => {
  cerrarCamara()
  if (imagenPreview.value) {
    URL.revokeObjectURL(imagenPreview.value)
  }
  imagenPreview.value = null
  selectedFile.value = null // Clear selected file
  mostrar.value = false
  emit('closed')
}

onBeforeUnmount(() => {
  cerrarCamara()
  if (imagenPreview.value) {
    URL.revokeObjectURL(imagenPreview.value)
  }
})

watch(mostrar, (newVal) => {
  if (!newVal) {
    cerrar()
  }
})
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>
