import stressmodel from './stressmodel.js'
import wintermodel from './wintermodel.js'

export default function lodamodel(name) {
  if (name === 'default' || name === 'stressmodel' || name.length == 0) return stressmodel
  if (name === 'wintermodel') return wintermodel
  return null
}
