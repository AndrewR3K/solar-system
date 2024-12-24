import { Galaxy } from '@/models/Orbitals'
import { ref } from 'vue'

export function useGenerator(): { generateGalaxy: (systemCount: any, scene: any) => any; galaxyGenerating: any } {
  const galaxyGenerating = ref(false)


  const generateGalaxy = (systemCount: any, scene: any) => {
    let galaxy: any = {}
    galaxyGenerating.value = true
    galaxy = new Galaxy(scene)
    galaxy.generate(systemCount ?? 1000, () => {
      setTimeout(() => {
        galaxyGenerating.value = false
      }, 1000)
    })

    return galaxy
  }


  return { generateGalaxy, galaxyGenerating }
}
