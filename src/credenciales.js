import { USES } from './composables/usuarios/mistersoft/listaUsuarios'
import { USES_V } from './composables/usuarios/vivasofts/listaUsuarios'

export let USUARIOS = []
if (process.env.VITE_APP_ENV == 'mistersofts') {
  USUARIOS = USES
} else {
  USUARIOS = USES_V
}
