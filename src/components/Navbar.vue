<template>
    <div class="navbar bg-base-100 z-50">
        <div class="navbar-start">
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </div>
                <ul tabindex="0"
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                    <li v-for="(navItem, index) in navItems" :key="'navbar' + index">
                        <details v-if="navItem?.sub?.length > 0">
                            <summary>{{ navItem.display }}</summary>
                            <ul class="p-2">
                                <li v-for="(subItem, subIndex) in navItem.sub" :key="'navbar-subitem' + index">
                                    <RouterLink :to="subItem.to">{{ subItem.display }}</RouterLink>
                                </li>
                            </ul>
                        </details>
                        <RouterLink v-else :to="navItem.to">{{ navItem.display }}</RouterLink>
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
                    <details v-if="navItem?.sub?.length > 0">
                        <summary>{{ navItem.display }}</summary>
                        <ul class="p-2">
                            <li v-for="(subItem, subIndex) in navItem.sub" :key="'navbar-subitem' + index">
                                <RouterLink :to="subItem.to">{{ subItem.display }}</RouterLink>
                            </li>
                        </ul>
                    </details>
                    <RouterLink v-else :to="navItem.to">{{ navItem.display }}</RouterLink>
                </li>
            </ul>
        </div>
        <div class="navbar-end">
            <a class="btn">github</a>
        </div>
    </div>
</template>
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const navItems = ref([
    {
        display: 'Home',
        to: '/'
    },
    {
        display: 'Systems',
        sub: [
            {
                display: 'Sol',
                to: '/system/sol'
            }
        ]
    }
])
</script>