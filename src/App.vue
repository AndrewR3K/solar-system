<template>
  <div id="app">
    <space></space>
  </div>
</template>

<script>
import space from './components/Space.vue'

export default {
  name: 'App',
  data() {
    return {
    }
  },
  components: {
    space
  },
  methods: {
  }
}
</script>

<style lang="scss">
html, body, #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #000000;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
