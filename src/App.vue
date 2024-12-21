<script setup lang="ts">
import { RouterView } from 'vue-router'
import FooterComp from '@/components/Footer.vue'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="flex flex-col h-screen">
    <Navbar></Navbar>
    <div class="grow min-h-fit">
      <RouterView />
    </div>

    <FooterComp></FooterComp>
  </div>
</template>