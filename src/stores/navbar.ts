import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavStore = defineStore('navbar', () => {
  const theme = ref('standard')

  function setTheme(value: string) {
    theme.value = value
  }

  return { theme, setTheme }
})
