<template>
  <q-page padding>
    <TableComponent
      :rows="datos"
      :privilegios="privilegios"
      :estadofactura="estadofactura"
      @editar="(row) => console.log('Editar', row)"
      @eliminar="(id) => console.log('Eliminar', id)"
      @cambiarEstado="(row) => console.log('Cambiar estado', row)"
    />
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import TableComponent from 'src/components/general/divisa/TableComponent.vue'
import { api } from 'boot/axios'
import { validarUsuario } from 'src/composables/FuncionesG'
const datos = ref([])
import { useRoute } from 'vue-router'

// const privilegios = [0, 1, 1, 1] // temporal; deberías obtenerlo dinámicamente
// const estadofactura = ref(true) // si aplica, igual que en JS original

async function listarDatos() {
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa
  const token = contenidousuario[0]?.factura?.access_token
  const tipo = contenidousuario[0]?.factura?.tipo

  const endpoint = `listaDivisa/${idempresa}/${token}/${tipo}`
  try {
    console.log(endpoint)
    const res = await api.get(endpoint)
    if (res.data[0] === 'error') {
      console.error(res.data.error)
    } else {
      datos.value = res.data
      console.log(datos.value)
    }
  } catch (err) {
    console.error(err)
  }
}

const getCurrentKey = () => {
  const route = useRoute() // Accede a la ruta actual
  const key = route.query.key || null // Obtiene el parámetro `key` de la ruta
  return key
  // const currentPage = route.path.split('/')[1] // Extraer la página actual
  // return currentPage
}

// Uso
const currentKey = getCurrentKey()
console.log(currentKey)

onMounted(listarDatos)
</script>
