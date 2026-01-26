<script setup>
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster rich-colors position="top-center"/>
  <RouterView />
</template>