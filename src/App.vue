<template>
  <div class="zoom-container">
    <router-view />
  </div>
</template>

<script setup>
import { USUARIOS } from './credenciales'
const createInitialLocalStorage = () => {
  const idx = 0
  const usuario = USUARIOS[idx].usuario
  const menu = USUARIOS[idx].menu

  if (process.env.NODE_ENV === 'production') {
    console.log('Estamos en PRODUCCIÓN')
  } else {
    console.log('Estamos en DESARROLLO')
    localStorage.clear()
    if (!localStorage.getItem('yofinanciero')) {
      const userData = usuario
      localStorage.setItem('yofinanciero', JSON.stringify(userData))
      console.log("'yofinanciero' was created.")
    } else {
      console.log("'yofinanciero' already exists.")
    }

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
