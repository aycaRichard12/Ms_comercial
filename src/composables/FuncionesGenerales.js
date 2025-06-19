import { useFetchList } from 'src/composables/useFetchList'
//vapp
export function idempresa_md5() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario?.[0]?.empresa?.idempresa
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
  }
}
export function idusuario_md5() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario?.[0]?.idusuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
  }
}
export function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
    window.location.assign('../../app/')
  }
}

export async function divisaEmonedaActiva() {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `listaDivisa/${idempresa}/${token}/${tipo}`
    console.log(endpoint)
    const { items: resultado } = useFetchList(endpoint, (key) => ({
      id: key.id,
      nombre: key.nombre,
      tipo: key.tipo,
      codigosin: key.monedasin ? key.monedasin.codigo : null,
    }))

    if (resultado[0] == 'error') {
      console.log(resultado.error)
      throw resultado.error
    }
    console.log(resultado)
    const use = resultado.filter((u) => u.estado == 1)
    const divisaActiva = use.map((key) => ({
      id: key.id,
      nombre: key.nombre,
      tipo: key.tipo,
      codigosin: key.monedasin ? key.monedasin.codigo : null,
    }))[0]

    console.log(divisaActiva)
    return divisaActiva
  } catch (error) {
    console.error(error)
    throw error
  }
}

export function objectToFormData(obj) {
  const formData = new FormData()
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      formData.append(key, obj[key])
    } else {
      formData.append(key, 0)
    }
  }
  return formData
}
