<template>
  <div v-if="navStore.theme === 'explorer'" class="fixed bottom-0 right-0 p-4">
    <ul class="menu bg-base-200 rounded-box">
      <li>
        <a href="/" class="btn btn-ghost">
          <img src="@/assets/logo.png" class="h-5 w-5" draggable="false" />
        </a>
      </li>
      <li>
        <a>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="h-5 w-5" fill="currentColor">
            <path
              d="M192 64C86 64 0 150 0 256S86 448 192 448l256 0c106 0 192-86 192-192s-86-192-192-192L192 64zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24l0 32 32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0 0 32c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-32-32 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l32 0 0-32z" />
          </svg>
        </a>
      </li>
      <li>
        <a>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="h-5 w-5" fill="currentColor">
            <path
              d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
          </svg>
        </a>
      </li>
    </ul>
  </div>

  <div class="navbar bg-base-100 z-50" v-else>
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <li v-for="(navItem, index) in navItems" :key="'navbar' + index">
            <details v-if="(navItem?.sub?.length ?? 0) > 0">
              <summary>{{ navItem.display }}</summary>
              <ul class="p-2">
                <li v-for="(subItem, subIndex) in navItem.sub" :key="'navbar-subitem' + index + subIndex">
                  <RouterLink :to="subItem.to">{{ subItem.display }}</RouterLink>
                </li>
              </ul>
            </details>
            <RouterLink v-else :to="navItem.to || ''">{{ navItem.display }}</RouterLink>
          </li>
        </ul>
      </div>
      <a href="/" class="btn btn-ghost text-xl">
        <img src="@/assets/logo.png" class="w-10" draggable="false" />
        Celestial Explorer
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li v-for="(navItem, index) in navItems" :key="'navbar' + index">
          <details v-if="(navItem?.sub?.length ?? 0) > 0">
            <summary>{{ navItem.display }}</summary>
            <ul class="p-2">
              <li v-for="(subItem, subIndex) in navItem.sub" :key="'navbar-subitem' + index">
                <RouterLink :to="subItem.to">{{ subItem.display }}</RouterLink>
              </li>
            </ul>
          </details>
          <RouterLink v-else :to="navItem.to || ''">{{ navItem.display }}</RouterLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
      <a class="btn">github</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useNavStore } from '@/stores/navbar';

const navStore = useNavStore()


const navItems = ref([
  {
    display: 'Home',
    to: '/'
  },
  {
    display: 'Systems',
    sub: [
      {
        display: 'Galaxy',
        to: '/system/sol'
      }
    ]
  }
])
</script>
