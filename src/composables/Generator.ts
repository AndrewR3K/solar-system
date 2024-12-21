import { Galaxy } from '@/models/Orbitals'
import { ref } from 'vue'

export function useGenerator(systemCount: number): { galaxy: any; galaxyGenerating: any } {
  let galaxy: any = {}
  const galaxyGenerating = ref(false)
  galaxyGenerating.value = true
  galaxy = new Galaxy()
  galaxy.generate(systemCount ?? 1000, () => {
    console.log('done')
    setTimeout(() => {
      galaxyGenerating.value = false
    }, 1000)
  })

  return { galaxy, galaxyGenerating }
}
