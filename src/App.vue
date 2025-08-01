<template>
  <div class="zoom-container">
    <router-view />
  </div>
</template>

<script setup></script>
<style>
.zoom-container {
  zoom: 1; /* Escala visual de toda la app al 70% */
}
</style>
