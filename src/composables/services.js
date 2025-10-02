let URL_APIC, URL_APIP, URL_APIR, URL_APIE, URL_APICM, URL_APIA, URL_APIAF, URL_APIPANEL

if (process.env.NODE_ENV === 'production') {
  console.log('Estamos en PRODUCCIÓN')
  URL_APIC = 'https://mistersofts.com/app/ct/' //conta
  URL_APIP = 'https://mistersofts.com/app/prod/' //Producción
  URL_APIR = 'https://mistersofts.com/app/rh/' //Recursos Humanos
  URL_APIE = 'https://mistersofts.com/app/em/' //Empresa
  URL_APICM = 'https://mistersofts.com/app/cmv1/' //Comercial
  URL_APIA = 'https://mistersofts.com/app/ad/' //Administración
  URL_APIAF = 'https://mistersofts.com/app/af/' //Activos Fijos
  URL_APIPANEL = 'https://mistersofts.com/app/panel/' //Panel

  // URL_APIC = 'http://vivasoft.link/vapp/ct/' //conta
  // URL_APIP = 'http://vivasoft.link/vapp/prod/' //Producción
  // URL_APIR = 'http://vivasoft.link/vapp/rh/' //Recursos Humanos
  // URL_APIE = 'http://vivasoft.link/vapp/em/' //Empresa
  // URL_APICM = 'https://vivasoft.link/app/cm/' //Comercial
  // URL_APIA = 'https://vivasoft.link/vapp/ad/' //Administración
  // URL_APIAF = 'https://vivasoft.link/vapp/af/' //Activos Fijos
  // URL_APIPANEL = 'httpS://vivasoft.link/vapp/panel/' //Panel
} else {
  // console.log('Estamos en DESARROLLO')
  // URL_APIC = 'http://vivasoft.link/vapp/ct/' //conta
  // URL_APIP = 'http://vivasoft.link/vapp/prod/' //Producción
  // URL_APIR = 'http://vivasoft.link/vapp/rh/' //Recursos Humanos
  // URL_APIE = 'http://vivasoft.link/vapp/em/' //Empresa
  // URL_APICM = 'https://vivasoft.link/app/cm/' //Comercial
  // URL_APIA = 'https://vivasoft.link/vapp/ad/' //Administración
  // URL_APIAF = 'https://vivasoft.link/vapp/af/' //Activos Fijos
  // URL_APIPANEL = 'httpS://vivasoft.link/vapp/panel/' //Panel
}

export { URL_APIC, URL_APIP, URL_APIR, URL_APIE, URL_APICM, URL_APIA, URL_APIAF, URL_APIPANEL }
