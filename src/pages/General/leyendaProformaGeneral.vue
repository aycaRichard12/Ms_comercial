<template>
  <q-card class="q-pa-md">
    <!-- Formulario -->
    <div v-show="mostrarFormulario">
      <q-form @submit="registrarLeyenda">
        <div class="q-mb-md">
          <q-input v-model="leyenda" label="Leyenda de la cotización *" outlined dense required />
        </div>
        <div class="q-my-md text-center">
          <q-btn type="submit" color="primary" label="Registrar" />
        </div>
      </q-form>
    </div>

    <!-- Controles superiores -->
    <div class="row items-center q-my-sm">
      <q-btn flat color="primary" label="Cancelar Registro" @click="toggleFormulario" />
      <q-space />
      <q-input
        dense
        outlined
        debounce="300"
        v-model="busqueda"
        placeholder="Buscar"
        class="q-ml-sm"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tabla -->
    <q-table :rows="filtrarLeyendas" :columns="columnas" row-key="id" flat bordered class="q-mt-md">
      <template #body-cell-opciones="props">
        <q-td align="center">
          <q-btn icon="edit" color="info" dense flat @click="editar(props.row)" />
          <q-btn icon="delete" color="negative" dense flat @click="eliminar(props.row)" />
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td align="center">
          <q-btn icon="thumb_up" color="primary" dense flat @click="cambiarEstado(props.row)" />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>
<script setup>
import { ref, computed } from 'vue'

const mostrarFormulario = ref(true)
const leyenda = ref('')
const busqueda = ref('')
const leyendas = ref([
  {
    id: 11,
    texto: 'Solo será válida durante 10 días a partir de la fecha de entrega.',
    estado: 'activo',
  },
])

const columnas = [
  { name: 'id', label: 'N°', field: 'id', align: 'center' },
  { name: 'texto', label: 'Leyenda', field: 'texto', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const registrarLeyenda = () => {
  leyendas.value.push({
    id: Date.now(),
    texto: leyenda.value,
    estado: 'activo',
  })
  leyenda.value = ''
  mostrarFormulario.value = false
}

const editar = (row) => {
  console.log('Editar', row)
}

const eliminar = (row) => {
  leyendas.value = leyendas.value.filter((l) => l.id !== row.id)
}

const cambiarEstado = (row) => {
  row.estado = row.estado === 'activo' ? 'inactivo' : 'activo'
}

const toggleFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value
}

const filtrarLeyendas = computed(() =>
  leyendas.value.filter((l) => l.texto.toLowerCase().includes(busqueda.value.toLowerCase())),
)
</script>
