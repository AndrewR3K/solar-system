<template>
  <main>
    <!-- Hero Section -->
    <section class="hero min-h-[75vh] bg-gradient-to-b from-primary to-neutral relative overflow-hidden">
      <div class="hero-content text-center text-base-100 z-50">
        <div>
          <h1 class="text-5xl font-bold text-white">Explore the Universe</h1>
          <p class="py-6 text-lg text-white">Dive into the beauty of solar systems or create your own. A journey through
            space
            awaits!</p>
          <button class="btn btn-secondary">Start Exploring</button>
        </div>
      </div>
      <div class="absolute lg:top-1/4 left-0 right-0 z-0">
        <img src="@/assets/hero-visual.jpg" alt="Solar System Visualization"
          class="lg:w-3/4 mx-auto rounded-lg shadow-lg" />
        <div class="lg:hidden absolute bg-gradient-to-b from-transparent to-black left-0 right-0 top-0 bottom-0"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-10 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card shadow-lg bg-base-100">
            <!-- <img src="@/assets/hero-visual.jpg" alt="Feature 1" class="rounded-t-lg" /> -->
            <div class="card-body">
              <h3 class="card-title text-lg font-bold">Explore Solar Systems</h3>
              <p>Discover beautifully crafted solar systems with detailed views of planets and stars.</p>
            </div>
          </div>
          <div class="card shadow-lg bg-base-100">
            <!-- <img src="@/assets/hero-visual.jpg" alt="Feature 2" class="rounded-t-lg" /> -->
            <div class="card-body">
              <h3 class="card-title text-lg font-bold">Create Your Own</h3>
              <p>Generate unique solar systems with custom parameters and visualizations.</p>
            </div>
          </div>
          <div class="card shadow-lg bg-base-100">
            <!-- <img src="@/assets/hero-visual.jpg" alt="Feature 3" class="rounded-t-lg" /> -->
            <div class="card-body">
              <h3 class="card-title text-lg font-bold">Interactive Visuals</h3>
              <p>Enjoy stunning interactive graphics optimized for all devices.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="hero relative overflow-hidden min-h-[40vh]">
      <div class="hero-content text-center text-base-100 z-20">
        <div>
          <h1 class="text-5xl font-bold text-white">Begin Your Journey</h1>
          <p class="py-6 text-lg text-white">Start exploring or creating solar systems now. The universe is at your
            fingertips!</p>
          <button class="btn btn-secondary">Get Started</button>
        </div>
      </div>
      <div class="absolute left-0 right-0 z-0">
        <img src="@/assets/cta-visual.jpg" alt="Solar System Visualization" class="mx-auto" />
        <div class="absolute bg-gradient-to-t from-transparent to-black left-0 right-0 top-0 bottom-0"></div>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
import { useNavStore } from '@/stores/navbar';
let navStore = useNavStore()
navStore.setTheme('standard')
</script>
