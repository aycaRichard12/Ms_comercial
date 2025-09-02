<template>
  <div class="zoom-container">
    <router-view />
  </div>
</template>

<script setup>
import { usuarios, menus } from './credenciales'
// NOTIFICACIONES
const createInitialLocalStorage = () => {
  // Check if 'yofinanciero' exists before setting it
  const idx = 2 // Puedes cambiar el índice para seleccionar otro usuario y menú
  const usuario = usuarios[idx]
  const menu = menus[idx]

  if (process.env.NODE_ENV === 'production') {
    console.log('Estamos en PRODUCCIÓN')
  } else {
    console.log('Estamos en DESARROLLO')
    localStorage.clear() // Limpiar localStorage en desarrollo para evitar datos antiguos
    if (!localStorage.getItem('yofinanciero')) {
      const userData = usuario
      localStorage.setItem('yofinanciero', JSON.stringify(userData))
      console.log("'yofinanciero' was created.")
    } else {
      console.log("'yofinanciero' already exists.")
    }

    // Check if 'yofinancieromenu' exists before setting it
    if (!localStorage.getItem('yofinancieromenu')) {
      const menuData = menu
      localStorage.setItem('yofinancieromenu', JSON.stringify(menuData))
      console.log("'yofinancieromenu' was created.")
    } else {
      console.log("'yofinancieromenu' already exists.")
    }
  }
}

createInitialLocalStorage()
</script>
<style>
.zoom-container {
  zoom: 1; /* Escala visual de toda la app al 70% */
}
</style>
