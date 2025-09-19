const usuarios = []
const menus = []

let token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJhYWYzYzA4NDQwZGM2ZTg1ZGI2ZDYzMWJjMjI0OTQ0N2RlZDg0ZDhmZTQzYjY3YmY3MzRhYjMyYzU0MTVmNjMyZjExZjgyYzVjZTc0ZmJiMyIsImlhdCI6MTc1NjI0NDcxMywibmJmIjoxNzU2MjQ0NzEzLCJleHAiOjE3ODc3ODA3MTMsInN1YiI6IiIsInNjb3BlcyI6W119.ZxFi5FYgSuSdpcBkISqIMi343bZF0BheFp84peMCClIpwrclGv2xgWOhuaGN7lI6UfJ8DaWZOfIREjCrKXT-e0CUCmeXiVSNcqDJH6_zRhyBrAEtR0brfyNsbdhoblqbwUnTeuNgbHmUtjzmlj7YKVsQ2Vpc4d2X8GgByn9j8ctm4P90mFcHDYgKSqytyfk8x7e1KHZqyKINS3FMEkfmBSc-P04ZF5qCmwxz5paX2ch0tbHh2PZstRVuhU0Qb8ka3XUC5kCXndorrwMcqWBg05G9BF6356dHEmm39rmEq4Xrjfk7D0wcrzSf8QMmEzaDneLy308bufBlqtjqSonTXHRwzvKUrn_zzF8vNFa_KL2UqAiDRWkj4sMKITqPWhSMGEeO5L7ySXs_Iz0iidW8Mu9qW6S1SYT_lLcnTabvyAlzSWPZEuWghEfUPR79xenRAnPRUYvcsDg7BdnCAe9oEIY-Q8pdXTVG-O9aejtVKe1CnzY9gocdmLGWZKCiHZ9Of0cfdUOBWu0yKHObG2IThRID8U8D2GrvYIGX4L3sxJ9yazcUtVJnPQgjiBPhcA1szcB6HrjDlrCx83C6SO50vFeqizgaonRK0jNiPzEvLEFl-x4D6gpK2mziTSYfKLaCyRDhfGlehgENLGxKVnGy_Iqrd0iqUuNeqEhn3V_9CBI'

console.log('token', token)
const richard50 = [
  {
    ok: 'success',
    login: 'usuario',
    idusuario: '03afdbd66e7929b125f8597834fa83a4',
    usuario: 'richard50',
    nombre: 'Richard Ayca Acuña',
    cargo: 'Soporte',
    idarea: 'f0935e4cd5920aa6c7c996a5ee53a70f',
    idcargo: '73278a4a86960eeb576a8fd4c9ec6997',
    area: 'Sistemas',
    empresa: {
      nombre: 'Comercio e Inversiones YF SRL',
      idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
      nit: '123456789',
      fex: '2030-09-09',
      telefono: '+591 12345678',
      direccion: 'Av. Ayacucho N° 218 esq. Gral Achá',
      logo: 'logos/yof_d67fc1b140.jpg',
      email: 'info@yofinanciero.com',
      idsucursal: 'a5bfc9e07964f8dddeb95fc584cd965d',
      sucursal: 'Sucursal0',
      opais: 'Bolivia',
      oestado: 'Cochababma',
      ociudad: 'Cercado',
      ocelular: '+591 76548252',
      ositioweb: 'www.comercio.com',
      ocierrefiscal: '31/12',
      onempleador: null,
      onpatronal: null,
      idregion: 'b6d767d2f8ed5d21a44b0e5886680cb9',
      region: 'Cochabamba',
      tiponegocio: 'Comercial',
      tipo: '2',
      idtiponegocio: 'c9f0f895fb98ab9159f51fd0297e236d',
    },
    factura: {
      token_type: 'Bearer',
      expires_in: '31622400',
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJjYjE2NDUzNTc4ZGRhYTgwNmFhMWEyNDcxMGYxZTI3OWQyODU1MGM5ZGE4MTAwNmVmNmIyYjU1YTI3MDc4ZDRjYzNjODkwZTU2NGIxZDVjNyIsImlhdCI6MTc0MjQ3NTY2NCwibmJmIjoxNzQyNDc1NjY0LCJleHAiOjE3NzQwMTE2NjQsInN1YiI6IiIsInNjb3BlcyI6W119.KFugkzjz4rXPCRsMl23sAIrDkYRuOwAJi9W0WUGg1XthO4ZvGJTsU-8ifEQYdudyIZ_b-zy49NL7fhbKoxtNVoBZbtuoYDTzCZN3Jb0Jsc3enVL_YezYr_5vA8qBBRvYdyihqTjvRQt9dYVP--QtrLp0qtQ8wP_vUyNTQh9POJUZhMd6EXjjxG_6tfgAzVOYbVty_WFU0xXDkReYLfphjqFRLPo-3vWlo5god5ixYMM55PWXLnz01bYlJREhJ-U-z46_klvgfAbdGs_EdIeBSUlYfXOn0NOWHP5Q6QlVt85ajFLByd1uv5jVW3IsDzrMkfvf1u-4YCeOkPFqU3WMvAia46nVjLnpfBNERqYEnlwmiMnNoZ2HDDiHDJyy7i8ADDGy_pS-i6SItZ6yE9Qk3MfX6xYO5bxBZXFpozSxLlVytk3qeq3tuBr9H_QXbW3G-yQzk2mHTK7iMRX8Lzm6uZuJed60MpnzekEiKQBNIWdYgp9v5BmvYHHRyvjoMn5cI2LV9RNJVKB11Z2tQHSeeY61bo9u3aGJ094v3BRpnRiIffJEP-7jo7zpvAxz3AS5bS_lFaOdfU2LboJSTAWVefTHw9JFnHnTRQZSBJ_EDqnOJrQhS6vjYa1zGtHti4Qs8U1U4cqcTn-pyzL0lqltfsdGbaBU5UE4RcsiB2eKzhs',
      tipo: '1',
      tipof: 'PRUEBA',
    },
  },
]
const test1 = [
  {
    ok: 'success',
    login: 'usuario',
    idusuario: '03afdbd66e7929b125f8597834fa83a4',
    usuario: 'richard50',
    nombre: 'Benancio',
    cargo: 'Contador',
    idarea: 'f0935e4cd5920aa6c7c996a5ee53a70f',
    idcargo: '73278a4a86960eeb576a8fd4c9ec6997',
    area: 'Sistemas',
    empresa: {
      nombre: 'Comercio e Inversiones YF SRL',
      idempresa: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
      nit: '123456789',
      fex: '2030-09-09',
      telefono: '+591 12345678',
      direccion: 'Av. Ayacucho N° 218 esq. Gral Achá',
      logo: 'logos/yof_d67fc1b140.jpg',
      email: 'info@yofinanciero.com',
      idsucursal: 'a5bfc9e07964f8dddeb95fc584cd965d',
      sucursal: 'Sucursal0',
      opais: 'Bolivia',
      oestado: 'Cochababma',
      ociudad: 'Cercado',
      ocelular: '+591 76548252',
      ositioweb: 'www.comercio.com',
      ocierrefiscal: '31/12',
      onempleador: null,
      onpatronal: null,
      idregion: 'b6d767d2f8ed5d21a44b0e5886680cb9',
      region: 'Cochabamba',
      tiponegocio: 'Comercial',
      tipo: '2',
      idtiponegocio: 'c9f0f895fb98ab9159f51fd0297e236d',
    },
    factura: {
      token_type: 'Bearer',
      expires_in: '31622400',
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAzMzUiLCJqdGkiOiJjYjE2NDUzNTc4ZGRhYTgwNmFhMWEyNDcxMGYxZTI3OWQyODU1MGM5ZGE4MTAwNmVmNmIyYjU1YTI3MDc4ZDRjYzNjODkwZTU2NGIxZDVjNyIsImlhdCI6MTc0MjQ3NTY2NCwibmJmIjoxNzQyNDc1NjY0LCJleHAiOjE3NzQwMTE2NjQsInN1YiI6IiIsInNjb3BlcyI6W119.KFugkzjz4rXPCRsMl23sAIrDkYRuOwAJi9W0WUGg1XthO4ZvGJTsU-8ifEQYdudyIZ_b-zy49NL7fhbKoxtNVoBZbtuoYDTzCZN3Jb0Jsc3enVL_YezYr_5vA8qBBRvYdyihqTjvRQt9dYVP--QtrLp0qtQ8wP_vUyNTQh9POJUZhMd6EXjjxG_6tfgAzVOYbVty_WFU0xXDkReYLfphjqFRLPo-3vWlo5god5ixYMM55PWXLnz01bYlJREhJ-U-z46_klvgfAbdGs_EdIeBSUlYfXOn0NOWHP5Q6QlVt85ajFLByd1uv5jVW3IsDzrMkfvf1u-4YCeOkPFqU3WMvAia46nVjLnpfBNERqYEnlwmiMnNoZ2HDDiHDJyy7i8ADDGy_pS-i6SItZ6yE9Qk3MfX6xYO5bxBZXFpozSxLlVytk3qeq3tuBr9H_QXbW3G-yQzk2mHTK7iMRX8Lzm6uZuJed60MpnzekEiKQBNIWdYgp9v5BmvYHHRyvjoMn5cI2LV9RNJVKB11Z2tQHSeeY61bo9u3aGJ094v3BRpnRiIffJEP-7jo7zpvAxz3AS5bS_lFaOdfU2LboJSTAWVefTHw9JFnHnTRQZSBJ_EDqnOJrQhS6vjYa1zGtHti4Qs8U1U4cqcTn-pyzL0lqltfsdGbaBU5UE4RcsiB2eKzhs',
      tipo: '1',
      tipof: 'PRUEBA',
    },
  },
]
const soporte74 = [
  {
    ok: 'success',
    login: 'usuario',
    idusuario: 'a8f15eda80c50adb0e71943adc8015cf',
    usuario: 'soporte74',
    nombre: 'Soporte Soporte',
    cargo: 'Soporte',
    idarea: '812b4ba287f5ee0bc9d43bbf5bbe87fb',
    idcargo: '26657d5ff9020d2abefe558796b99584',
    area: 'Sistemas',
    empresa: {
      nombre: 'CIACNEN SRL',
      idempresa: 'ad61ab143223efbc24c7d2583be69251',
      nit: '123189023',
      fex: '2030-09-09',
      telefono: '+591 (4) 458-8736',
      direccion: 'Calle Niceto Rodriguez Nº s/n, Zona Sarcobamba',
      logo: 'logos/yof_9ea6023fbe.jpeg',
      email: 'info@cia.cafe',
      idsucursal: 'f457c545a9ded88f18ecee47145a72c0',
      sucursal: 'Sucursal0',
      opais: 'Bolivia',
      oestado: 'Cochabamba',
      ociudad: 'Cochabamba',
      ocelular: '+591 (7) 271-6783',
      ositioweb: 'www.ciacnen.com',
      ocierrefiscal: '31/3',
      onempleador: null,
      onpatronal: null,
      idregion: 'e4da3b7fbbce2345d7772b0674a318d5',
      region: 'Bolivia',
      tiponegocio: 'Industrial',
      tipo: '2',
      idtiponegocio: '8f14e45fceea167a5a36dedd4bea2543',
    },
    factura: {
      token_type: 'Bearer',
      expires_in: '31536000',
      access_token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzMDAyMzIiLCJqdGkiOiJiMGM2MzI0Zjc2YTdiZmIwNzliYWRiMjIxM2E3MTQzMmFjYjg2MjlhMzA2YzZmZTY0ODAxNzBlNTFmMTRlYWU4ZTkwZDk3N2NjMDM2MTdmNCIsImlhdCI6MTcyNzQ3NTUyMywibmJmIjoxNzI3NDc1NTIzLCJleHAiOjE3NTkwMTE1MjMsInN1YiI6IiIsInNjb3BlcyI6W119.llLu_9D8mxSjwd3YsvNaFf5-OJWq3IUi5OnrYpwxLd8z-TNh4KlRpAS1RSmphcnc-wtaPoUsv5IisoXCrIvlC6vgLeCFgu92p3pijETH7usOALsFIPDxAgsAvVAxRvuDWP_CdpxH_2VbpmaLLYVtWGAu3nCvCGIC5JczO0ykxli_ruEN_WtcRVDWBig6n40MgQUks__1xRXw-ZG8Y1C6_Y2xJ87xP-5nJXalFbyj6PVK_GBx1Gw6e_So5X5Fl_RLrIqJ4eCkcalkezc3GRnEswusRx6H__93u2vWD1v7Wp5EkVGrGhU0cmSt_FTL753WfuKXfBW-gAFbAj3OMDG5yagd8MU3TvO2fkOdEw0CGhs4bTN9b6QVBygFXA1-k68wTBNyu7xkfN5-4u0YsglUm6uJd9p6gnfAg6mqpg6F7BDM3kNX_0JEaNlCauUhc-30fx83mVeS3d4r8jtEFjKGd2c4QSWn-_H-fR742J7rPOC_8BA8SmO10zUVWBiNkCZ1tsdDsmPyqIVFvXFBfw6VZHtHlFCKxOSiaoJRF--bO04XzLBQRm2jXsKMLgSg6Jd1lZQ-8Y8_OguMqMZd2GVnHezk5OSKDOafUQjiGlGNDGqQPJfw8I7t3b3_Jzgd0ZmsNVUdRd7uS1xrS_NOzff1uLfCPUxJObK6HPfqudZFoSQ',
      tipo: '2',
      tipof: 'FACTURA',
    },
  },
]

const manfret104 = [
  {
    ok: 'success',
    login: 'usuario',
    idusuario: '96da2f590cd7246bbde0051047b0d6f7',
    usuario: 'manfret104',
    nombre: 'Manfret Herrera',
    cargo: 'Arquitecto de Software',
    idarea: '2b24d495052a8ce66358eb576b8912c8',
    idcargo: '1ff8a7b5dc7a7d1f0ed65aaa29c04b1e',
    area: 'Área de Desarrollo Tecnológico',
    empresa: {
      nombre: 'InovaTech Solutions',
      idempresa: 'c9e1074f5b3f9fc8ea15d152add07294',
      nit: '1234567890',
      fex: '2030-09-09',
      telefono: '+591 4 123 4567',
      direccion: 'Av. Empresarial 123, Cochabamba, Bolivia',
      logo: 'logos/yof_54492b7072.png',
      email: 'estudianteest83@gmail.com',
      idsucursal: '54229abfcfa5649e7003b83dd4755294',
      sucursal: 'Sede Principal',
      opais: 'Bolivia',
      oestado: 'Cochabamba',
      ociudad: 'Cercado',
      ocelular: '+591 4 123 4567',
      ositioweb: 'https://www.inovatechsoluciones.com/',
      ocierrefiscal: null,
      onempleador: null,
      onpatronal: null,
      idregion: 'a5bfc9e07964f8dddeb95fc584cd965d',
      region: 'Región Central',
      tiponegocio: 'Tecnológica',
      tipo: '2',
      idtiponegocio: 'c74d97b01eae257e44aa9d5bade97baf',
    },
    factura: {
      token_type: '',
      expires_in: '',
      access_token: '',
      tipo: '',
      tipof: '',
    },
  },
]
const test75 = [
  {
    ok: 'success',
    login: 'usuario',
    idusuario: '7f39f8317fbdb1988ef4c628eba02591',
    usuario: 'test75',
    nombre: 'Juan J. Marca Gates',
    cargo: 'Tester',
    idarea: 'e369853df766fa44e1ed0ff613f563bd',
    idcargo: 'd645920e395fedad7bbbed0eca3fe2e0',
    area: 'Sistemas',
    empresa: {
      nombre: 'Compañía Industrial - PRUEBA',
      idempresa: 'd09bf41544a3365a46c9077ebb5e35c3',
      nit: '15986325',
      fex: '2030-09-09',
      telefono: '+591 4568525',
      direccion: 'Av. Villazón # 1577 esq. Tumusla',
      logo: 'logos/yof_0f5e4c0b2e.png',
      email: 'exito@gmail.com',
      idsucursal: '02e74f10e0327ad868d138f2b4fdd6f0',
      sucursal: 'Central',
      opais: 'Bolivia',
      oestado: 'Cochabamba',
      ociudad: 'Cercado',
      ocelular: '72716783',
      ositioweb: 'www.exito.com',
      ocierrefiscal: '31/3',
      onempleador: '321-12364-123',
      onpatronal: '13245151-001',
      idregion: 'a87ff679a2f3e71d9181a67b7542122c',
      region: 'Bolivia',
      tiponegocio: 'Industrial',
      idtn: '7',
      tipo: '2',
      idtiponegocio: '8f14e45fceea167a5a36dedd4bea2543',
    },
    factura: {
      token_type: '',
      expires_in: '',
      access_token: '',
      tipo: '',
      tipof: '',
    },
  },
]

const menurichard50 = [
  {
    modulo: '3',
    menu: [
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Administración-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Administración-Asignación-Almacén',
            codigo: 'asignaralmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Punto de Venta',
            codigo: 'asignarpuntodeventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Producto',
            codigo: 'asignarproductos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Almacén',
            codigo: 'registraralmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Punto de Venta',
            codigo: 'registrarpuntodeventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Producto o Servic',
            codigo: 'registrarproductos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Costo Unitario',
            codigo: 'costounitario-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Categorías de Prec',
            codigo: 'categoriasdeprecio-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Precios Sugeridos',
            codigo: 'preciossugeridos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Costos ',
            codigo: 'reportedepreciosbase-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Categor',
            codigo: 'reportedecategoriasdeprecio-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Reg.ClProv-Registro de Clientes',
            codigo: 'registrodecliente-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-RegCliPro-Registrar Proveedor',
            codigo: 'registrarproveedor-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Autorizar-Pedido',
            codigo: 'gestionPedido-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Autorizar-Ventas Pendientes',
            codigo: 'procesarventaspendientes-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Autorizar-Compras',
            codigo: 'autorizarcompra-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },

          {
            titulo: 'Adm-Campana-Crear Campañas',
            codigo: 'crearcampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Campana-Rep. Campañas',
            codigo: 'reportedecampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Campana-Rep. Ventas',
            codigo: 'reportedeventasporcampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Ventas-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'V-Generar Venta-Registrar Venta',
            codigo: 'registrarventaoculto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Generar Venta-Registrar Cotización',
            codigo: 'registrarcotizacionoculto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V - Generar Venta - Rep. de Ventas',
            codigo: 'reportedeventas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Generar Venta-Rep. de Cotizacion',
            codigo: 'reportedecotizacionesocultas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Generar Venta-Rep. Productos vendidos',
            codigo: 'reporteproductosvendidosindividual-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V - Generar Venta - Kardex',
            codigo: 'kardex-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Cuentas por Cobrar-Rep. Ctas Cobrar',
            codigo: 'reportecuentasporcobrarocultas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V- Cuentas por Cobra -Cobro Cuentas',
            codigo: 'cuentasporcobrarocultas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V - Cuentas por Cobrar - Rep. de Cobro',
            codigo: 'reportecuentasxpagarxperiodo-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V - Contingencias - Anulaciones',
            codigo: 'registraranulaciones-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V - Contingencias - Registro de Extravío',
            codigo: 'registrodeextravios-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V - Contingencias - Registro de Mermas',
            codigo: 'registrodemermas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Movimiento-Movimientos',
            codigo: 'movimientos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Movimiento-Rep. Movimientos',
            codigo: 'reportedemovimientos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Contingencias-Rep. de Extravíos',
            codigo: 'reportedeextravios-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'V-Contingencias-Rep. de Mermas',
            codigo: 'reportedemermas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Configuración-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Configuracion-General-Tipo Almacén',
            codigo: 'tipodealmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Divisas',
            codigo: 'divisas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Leyenda Proforma',
            codigo: 'leyendaproforma-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Categoría',
            codigo: 'categoriadeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Estado',
            codigo: 'estadodeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Unidad',
            codigo: 'unidaddeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Característica',
            codigo: 'caracteristicadeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Parámetros de obsolesc',
            codigo: 'parametrosdeobsolescencia-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Tipo de Cliente',
            codigo: 'tiposdeclientes-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Canal de Venta',
            codigo: 'canalesdeventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Configuración',
        codigo: 'configuraciongeneral',
        submenu: [
          {
            titulo: 'General',
            codigo: 'configuraciongeneral-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Producto o Servicio',
            codigo: 'configuracionproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Cliente',
            codigo: 'configuracioncliente-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Apis',
            codigo: 'generartokensapis-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Administración',
        codigo: 'administracion',
        submenu: [
          {
            titulo: 'Creación',
            codigo: 'administracioncreacion-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Asignación',
            codigo: 'administracionasignacion-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Precios',
            codigo: 'administracionprecios-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Cliente o Proveedor',
            codigo: 'registrarclienteoproveedor-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Cierre Caja',
            codigo: 'cierrecaja-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Autorizaciones',
            codigo: 'admautorizaciones-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Campañas',
            codigo: 'gestioncampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },

      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Compras',
        codigo: 'compras',
        submenu: [
          {
            titulo: 'Pedidos',
            codigo: 'pedidos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Compras',
            codigo: 'gestioncompra-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Compras-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: '-Compras-Registrar Compras',
            codigo: 'registrarcompra-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: '-Compras-Compras Desglosado',
            codigo: 'reporteproductoscomprados-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: '-Compras-Rep. Compras',
            codigo: 'reportedecompras-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: '-Pedidos-Generar Pedido',
            codigo: 'generarpedido-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: '-Pedidos-Rep. Pedidos',
            codigo: 'reportedepedidos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Ventas',
        codigo: 'ventas',
        submenu: [
          {
            titulo: 'Generar Venta',
            codigo: 'registrarventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Contingencia',
            codigo: 'contingencias-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Cuentas por Cobrar',
            codigo: 'cuentasporcobrar-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos',
            codigo: 'gestionmovimientos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Inventario Externo',
            codigo: 'inventarioexterno-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Reportes',
        codigo: 'reportes',
        submenu: [
          {
            titulo: 'Reporte Stock de Productos Individual',
            codigo: 'reportestockdeproductosindividual-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Global',
            codigo: 'reportestockdeproductosglobal-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Indice de Rotación',
            codigo: 'reportedeindicederotacion-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },

          {
            titulo: 'Reporte de Caducidad de Productos',
            codigo: 'reportedecaducidaddeproductos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Productos vendidos Global',
            codigo: 'reporteproductosvendidosglobal-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Rep. de Clientes',
            codigo: 'reportedeclientes-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },

          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Alm',
            codigo: 'reportedeindicederotacionporalmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Glo',
            codigo: 'reportedeindicederotacionglobal-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Cli',
            codigo: 'reportedeindicederotacionporcliente-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },

          {
            titulo: 'Estadísticas',
            codigo: 'dashboard-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Configuración Factura',
        codigo: 'configuracionfactura',
        submenu: [
          {
            titulo: 'Leyendas de Facturas',
            codigo: 'leyendasdefacturas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Métodos de Pago de Facturas',
            codigo: 'metodosdepagodefacturas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
    ],
  },
]
const menurichard501 = [
  {
    modulo: '3',
    menu: [
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Configuración General',
        codigo: 'configuraciongeneral',
        submenu: [
          {
            titulo: 'General',
            codigo: 'configuraciongeneral-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Producto o Servicio',
            codigo: 'configuracionproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Cliente',
            codigo: 'configuracioncliente-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Administración',
        codigo: 'administracion',
        submenu: [
          {
            titulo: 'Creación',
            codigo: 'administracioncreacion-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Asignación',
            codigo: 'administracionasignacion-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Precios',
            codigo: 'administracionprecios-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Registro de Cliente',
            codigo: 'registrodecliente-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Proveedor',
            codigo: 'registrarproveedor-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: ' Crear Campañas',
            codigo: 'crearcampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Compras',
        codigo: 'compras',
        submenu: [
          {
            titulo: 'Generar Pedido',
            codigo: 'generarpedido-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Compra o Producción',
            codigo: 'registrarcompra-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Ventas',
        codigo: 'ventas',
        submenu: [
          {
            titulo: 'Generar Venta',
            codigo: 'registrarventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Contingencia',
            codigo: 'contingencias-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Cuentas por Cobrar',
            codigo: 'cuentasporcobrar-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos',
            codigo: 'movimientos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Inventario Externo',
            codigo: 'inventarioexterno-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Reportes',
        codigo: 'reportes',
        submenu: [
          {
            titulo: 'Reporte Productos Comprados',
            codigo: 'reporteproductoscomprados-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Individual',
            codigo: 'reportestockdeproductosindividual-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Global',
            codigo: 'reportestockdeproductosglobal-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Indice de Rotación',
            codigo: 'reportedeindicederotacion-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Ventas por Campañas',
            codigo: 'reportedeventasporcampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Caducidad de Productos',
            codigo: 'reportedecaducidaddeproductos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Productos vendidos Global',
            codigo: 'reporteproductosvendidosglobal-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Configuracion-General-Tipo Almacén',
            codigo: 'tipodealmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Divisas',
            codigo: 'divisas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Leyenda Proforma',
            codigo: 'leyendaproforma-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Categoría',
            codigo: 'categoriadeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Estado',
            codigo: 'estadodeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Unidad',
            codigo: 'unidaddeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Característica',
            codigo: 'caracteristicadeproducto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Parámetros de obsolesc',
            codigo: 'parametrosdeobsolescencia-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Tipo de Cliente',
            codigo: 'tiposdeclientes-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Canal de Venta',
            codigo: 'canalesdeventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración-Asignación-Almacén',
            codigo: 'asignaralmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Punto de Venta',
            codigo: 'asignarpuntodeventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Producto',
            codigo: 'asignarproductos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Almacén',
            codigo: 'registraralmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Punto de Venta',
            codigo: 'registrarpuntodeventa-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Producto',
            codigo: 'registrarproductos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Costo Unitario',
            codigo: 'costounitario-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Categorías de Prec',
            codigo: 'categoriasdeprecio-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Precios Sugeridos',
            codigo: 'preciossugeridos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas-Generar Venta-Registrar Venta',
            codigo: 'registrarventaoculto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Venta-Generar Venta-Registrar Cotización',
            codigo: 'registrarcotizacionoculto-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Ventas',
            codigo: 'reportedeventas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Cotizacio',
            codigo: 'reportedecotizacionesocultas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte  Productos v',
            codigo: 'reporteproductosvendidosindividual-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Generar Venta - Kardex',
            codigo: 'kardex-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Mermas',
            codigo: 'reportedemermas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Compras',
            codigo: 'reportedecompras-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Extravíos',
            codigo: 'reportedeextravios-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Pedidos',
            codigo: 'reportedepedidos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Campañas',
            codigo: 'reportedecampanas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Clientes',
            codigo: 'reportedeclientes-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Movimientos',
            codigo: 'reportedemovimientos-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Cuentas por Cobrar - Reporte Ctas Cob',
            codigo: 'reportecuentasporcobrarocultas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas- Cuentas por Cobra -Cobro Cuentas',
            codigo: 'cuentasporcobrarocultas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Alm',
            codigo: 'reportedeindicederotacionporalmacen-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Glo',
            codigo: 'reportedeindicederotacionglobal-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Cli',
            codigo: 'reportedeindicederotacionporcliente-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Costos ',
            codigo: 'reportedepreciosbase-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Categor',
            codigo: 'reportedecategoriasdeprecio-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Anulaciones',
            codigo: 'registraranulaciones-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Registro de Extravío',
            codigo: 'registrodeextravios-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Registro Merma - Registro de Mermas',
            codigo: 'registrodemermas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Dashboard',
            codigo: 'dashboard-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '03afdbd66e7929b125f8597834fa83a4',
        titulo: 'Configuración Factura',
        codigo: 'configuracionfactura',
        submenu: [
          {
            titulo: 'Leyendas de Facturas',
            codigo: 'leyendasdefacturas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
          {
            titulo: 'Métodos de Pago de Facturas',
            codigo: 'metodosdepagodefacturas-03afdbd66e7929b125f8597834fa83a4',
            permiso: '1111',
          },
        ],
      },
    ],
  },
]

const menusoporte74 = [
  {
    modulo: '3',
    menu: [
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Configuración General',
        codigo: 'configuraciongeneral',
        submenu: [
          {
            titulo: 'General',
            codigo: 'configuraciongeneral-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Producto o Servicio',
            codigo: 'configuracionproducto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Cliente',
            codigo: 'configuracioncliente-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Administración',
        codigo: 'administracion',
        submenu: [
          {
            titulo: 'Creación',
            codigo: 'administracioncreacion-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Asignación',
            codigo: 'administracionasignacion-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Precios',
            codigo: 'administracionprecios-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Registro de Cliente',
            codigo: 'registrodecliente-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Proveedor',
            codigo: 'registrarproveedor-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: ' Crear Campañas',
            codigo: 'crearcampanas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Compras',
        codigo: 'compras',
        submenu: [
          {
            titulo: 'Generar Pedido',
            codigo: 'generarpedido-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Compra o Producción',
            codigo: 'registrarcompra-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Ventas',
        codigo: 'ventas',
        submenu: [
          {
            titulo: 'Generar Venta',
            codigo: 'registrarventa-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Contingencia',
            codigo: 'contingencias-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Cuentas por Cobrar',
            codigo: 'cuentasporcobrar-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos',
            codigo: 'movimientos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Inventario Externo',
            codigo: 'inventarioexterno-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Reportes',
        codigo: 'reportes',
        submenu: [
          {
            titulo: 'Reporte Productos Comprados',
            codigo: 'reporteproductoscomprados-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Individual',
            codigo: 'reportestockdeproductosindividual-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Global',
            codigo: 'reportestockdeproductosglobal-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Indice de Rotación',
            codigo: 'reportedeindicederotacion-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Ventas por Campañas',
            codigo: 'reportedeventasporcampanas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Caducidad de Productos',
            codigo: 'reportedecaducidaddeproductos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Productos vendidos Global',
            codigo: 'reporteproductosvendidosglobal-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Configuracion-General-Tipo Almacén',
            codigo: 'tipodealmacen-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Divisas',
            codigo: 'divisas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Leyenda Proforma',
            codigo: 'leyendaproforma-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Categoría',
            codigo: 'categoriadeproducto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Estado',
            codigo: 'estadodeproducto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Unidad',
            codigo: 'unidaddeproducto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Característica',
            codigo: 'caracteristicadeproducto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Parámetros de obsolesc',
            codigo: 'parametrosdeobsolescencia-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Tipo de Cliente',
            codigo: 'tiposdeclientes-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Canal de Venta',
            codigo: 'canalesdeventa-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración-Asignación-Almacén',
            codigo: 'asignaralmacen-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Punto de Venta',
            codigo: 'asignarpuntodeventa-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Producto',
            codigo: 'asignarproductos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Almacén',
            codigo: 'registraralmacen-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Punto de Venta',
            codigo: 'registrarpuntodeventa-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Producto',
            codigo: 'registrarproductos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Costo Unitario',
            codigo: 'costounitario-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Categorías de Prec',
            codigo: 'categoriasdeprecio-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Precios Sugeridos',
            codigo: 'preciossugeridos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas-Generar Venta-Registrar Venta',
            codigo: 'registrarventaoculto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Venta-Generar Venta-Registrar Cotización',
            codigo: 'registrarcotizacionoculto-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Ventas',
            codigo: 'reportedeventas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Cotizacio',
            codigo: 'reportedecotizacionesocultas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte  Productos v',
            codigo: 'reporteproductosvendidosindividual-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Generar Venta - Kardex',
            codigo: 'kardex-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Mermas',
            codigo: 'reportedemermas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Compras',
            codigo: 'reportedecompras-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Extravíos',
            codigo: 'reportedeextravios-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Pedidos',
            codigo: 'reportedepedidos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Campañas',
            codigo: 'reportedecampanas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Clientes',
            codigo: 'reportedeclientes-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Movimientos',
            codigo: 'reportedemovimientos-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Cuentas por Cobrar - Reporte Ctas Cob',
            codigo: 'reportecuentasporcobrarocultas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas- Cuentas por Cobra -Cobro Cuentas',
            codigo: 'cuentasporcobrarocultas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Alm',
            codigo: 'reportedeindicederotacionporalmacen-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Glo',
            codigo: 'reportedeindicederotacionglobal-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Cli',
            codigo: 'reportedeindicederotacionporcliente-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Costos ',
            codigo: 'reportedepreciosbase-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Categor',
            codigo: 'reportedecategoriasdeprecio-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Anulaciones',
            codigo: 'registraranulaciones-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Registro de Extravío',
            codigo: 'registrodeextravios-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Registro Merma - Registro de Mermas',
            codigo: 'registrodemermas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Dashboard',
            codigo: 'dashboard-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: 'a8f15eda80c50adb0e71943adc8015cf',
        titulo: 'Configuración Factura',
        codigo: 'configuracionfactura',
        submenu: [
          {
            titulo: 'Leyendas de Facturas',
            codigo: 'leyendasdefacturas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
          {
            titulo: 'Métodos de Pago de Facturas',
            codigo: 'metodosdepagodefacturas-a8f15eda80c50adb0e71943adc8015cf',
            permiso: '1111',
          },
        ],
      },
    ],
  },
]
const menumanfret104 = [
  {
    modulo: '3',
    menu: [
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Configuración',
        codigo: 'configuraciongeneral',
        submenu: [
          {
            titulo: 'General',
            codigo: 'configuraciongeneral-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Producto o Servicio',
            codigo: 'configuracionproducto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Cliente',
            codigo: 'configuracioncliente-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Apis',
            codigo: 'generartokensapis-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Administración',
        codigo: 'administracion',
        submenu: [
          {
            titulo: 'Creación',
            codigo: 'administracioncreacion-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Asignación',
            codigo: 'administracionasignacion-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Precios',
            codigo: 'administracionprecios-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Cliente o Proveedor',
            codigo: 'registrarclienteoproveedor-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Cierre Caja',
            codigo: 'cierrecaja-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: ' Crear Campañas',
            codigo: 'crearcampanas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Autorizaciones',
        codigo: 'centroAutorizaciones',
        submenu: [
          {
            titulo: 'Autorización Pedido',
            codigo: 'gestionPedido-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Procesar Ventas Pendientes',
            codigo: 'procesarventaspendientes-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Compras',
        codigo: 'compras',
        submenu: [
          {
            titulo: 'Generar Pedido',
            codigo: 'generarpedido-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Compra o Producción',
            codigo: 'registrarcompra-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos de Inventario',
            codigo: 'movimientosdeinventario-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Compras a Crédito',
            codigo: 'ingresocredito-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Ventas',
        codigo: 'ventas',
        submenu: [
          {
            titulo: 'Generar Venta',
            codigo: 'registrarventa-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Contingencia',
            codigo: 'contingencias-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Cuentas por Cobrar',
            codigo: 'cuentasporcobrar-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos',
            codigo: 'movimientos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Inventario Externo',
            codigo: 'inventarioexterno-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Reportes',
        codigo: 'reportes',
        submenu: [
          {
            titulo: 'Reporte Productos Comprados',
            codigo: 'reporteproductoscomprados-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Individual',
            codigo: 'reportestockdeproductosindividual-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Global',
            codigo: 'reportestockdeproductosglobal-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Indice de Rotación',
            codigo: 'reportedeindicederotacion-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Ventas por Campañas',
            codigo: 'reportedeventasporcampanas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Caducidad de Productos',
            codigo: 'reportedecaducidaddeproductos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Productos vendidos Global',
            codigo: 'reporteproductosvendidosglobal-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Configuracion-General-Tipo Almacén',
            codigo: 'tipodealmacen-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Divisas',
            codigo: 'divisas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Leyenda Proforma',
            codigo: 'leyendaproforma-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Categoría',
            codigo: 'categoriadeproducto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Estado',
            codigo: 'estadodeproducto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Unidad',
            codigo: 'unidaddeproducto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Característica',
            codigo: 'caracteristicadeproducto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Parámetros de obsolesc',
            codigo: 'parametrosdeobsolescencia-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Tipo de Cliente',
            codigo: 'tiposdeclientes-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Canal de Venta',
            codigo: 'canalesdeventa-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración-Asignación-Almacén',
            codigo: 'asignaralmacen-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Punto de Venta',
            codigo: 'asignarpuntodeventa-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Producto',
            codigo: 'asignarproductos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Almacén',
            codigo: 'registraralmacen-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Punto de Venta',
            codigo: 'registrarpuntodeventa-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Producto',
            codigo: 'registrarproductos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Costo Unitario',
            codigo: 'costounitario-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Categorías de Prec',
            codigo: 'categoriasdeprecio-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Precios Sugeridos',
            codigo: 'preciossugeridos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas-Generar Venta-Registrar Venta',
            codigo: 'registrarventaoculto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Venta-Generar Venta-Registrar Cotización',
            codigo: 'registrarcotizacionoculto-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Ventas',
            codigo: 'reportedeventas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Cotizacio',
            codigo: 'reportedecotizacionesocultas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte  Productos v',
            codigo: 'reporteproductosvendidosindividual-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Generar Venta - Kardex',
            codigo: 'kardex-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Compras',
            codigo: 'reportedecompras-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Mermas',
            codigo: 'reportedemermas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Movimientos',
            codigo: 'reportedemovimientos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Pedidos',
            codigo: 'reportedepedidos-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Campañas',
            codigo: 'reportedecampanas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Clientes',
            codigo: 'reportedeclientes-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Extravíos',
            codigo: 'reportedeextravios-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Cuentas por Cobrar - Reporte Ctas Cob',
            codigo: 'reportecuentasporcobrarocultas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Cuentas por Cobrar - Reporte de Cobro',
            codigo: 'reportecuentasxpagarxperiodo-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas- Cuentas por Cobra -Cobro Cuentas',
            codigo: 'cuentasporcobrarocultas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Alm',
            codigo: 'reportedeindicederotacionporalmacen-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Glo',
            codigo: 'reportedeindicederotacionglobal-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Cli',
            codigo: 'reportedeindicederotacionporcliente-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Costos ',
            codigo: 'reportedepreciosbase-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Categor',
            codigo: 'reportedecategoriasdeprecio-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Anulaciones',
            codigo: 'registraranulaciones-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Registro de Extravío',
            codigo: 'registrodeextravios-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Registro Merma - Registro de Mermas',
            codigo: 'registrodemermas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Dashboard',
            codigo: 'dashboard-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Reg.ClProv-Registro de Clientes',
            codigo: 'registrodecliente-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Adm-RegCliPro-Registrar Proveedor',
            codigo: 'registrarproveedor-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '96da2f590cd7246bbde0051047b0d6f7',
        titulo: 'Configuración Factura',
        codigo: 'configuracionfactura',
        submenu: [
          {
            titulo: 'Leyendas de Facturas',
            codigo: 'leyendasdefacturas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
          {
            titulo: 'Métodos de Pago de Facturas',
            codigo: 'metodosdepagodefacturas-96da2f590cd7246bbde0051047b0d6f7',
            permiso: '1111',
          },
        ],
      },
    ],
  },
]
const menutest75 = [
  {
    modulo: '3',
    menu: [
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Configuración',
        codigo: 'configuraciongeneral',
        submenu: [
          {
            titulo: 'General',
            codigo: 'configuraciongeneral-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Producto o Servicio',
            codigo: 'configuracionproducto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Cliente',
            codigo: 'configuracioncliente-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Apis',
            codigo: 'generartokensapis-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Autorizaciones',
        codigo: 'centroAutorizaciones',
        submenu: [
          {
            titulo: 'Autorización Pedido',
            codigo: 'gestionPedido-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Procesar Ventas Pendientes',
            codigo: 'procesarventaspendientes-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Administración',
        codigo: 'administracion',
        submenu: [
          {
            titulo: 'Creación',
            codigo: 'administracioncreacion-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Asignación',
            codigo: 'administracionasignacion-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Precios',
            codigo: 'administracionprecios-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Cliente o Proveedor',
            codigo: 'registrarclienteoproveedor-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Cierre Caja',
            codigo: 'cierrecaja-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: ' Crear Campañas',
            codigo: 'crearcampanas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Compras',
        codigo: 'compras',
        submenu: [
          {
            titulo: 'Generar Pedido',
            codigo: 'generarpedido-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Registrar Compra o Producción',
            codigo: 'registrarcompra-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos de Inventario',
            codigo: 'movimientosdeinventario-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Ventas',
        codigo: 'ventas',
        submenu: [
          {
            titulo: 'Generar Venta',
            codigo: 'registrarventa-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Contingencia',
            codigo: 'contingencias-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Cuentas por Cobrar',
            codigo: 'cuentasporcobrar-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Movimientos',
            codigo: 'movimientos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Inventario Externo',
            codigo: 'inventarioexterno-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Reportes',
        codigo: 'reportes',
        submenu: [
          {
            titulo: 'Reporte Productos Comprados',
            codigo: 'reporteproductoscomprados-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Individual',
            codigo: 'reportestockdeproductosindividual-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Stock de Productos Global',
            codigo: 'reportestockdeproductosglobal-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Indice de Rotación',
            codigo: 'reportedeindicederotacion-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Ventas por Campañas',
            codigo: 'reportedeventasporcampanas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Caducidad de Productos',
            codigo: 'reportedecaducidaddeproductos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte Productos vendidos Global',
            codigo: 'reporteproductosvendidosglobal-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Reporte de Pedidos',
            codigo: 'reportedepedidos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Clientes',
            codigo: 'reportedeclientes-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Campañas',
            codigo: 'reportedecampanas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Extravíos',
            codigo: 'reportedeextravios-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Mermas',
            codigo: 'reportedemermas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Movimientos',
            codigo: 'reportedemovimientos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte de Compras',
            codigo: 'reportedecompras-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Alm',
            codigo: 'reportedeindicederotacionporalmacen-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Glo',
            codigo: 'reportedeindicederotacionglobal-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Reporte - Reporte de Índice de Rotación - Cli',
            codigo: 'reportedeindicederotacionporcliente-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Estadísticas',
            codigo: 'dashboard-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Configuración Factura',
        codigo: 'configuracionfactura',
        submenu: [
          {
            titulo: 'Leyendas de Facturas',
            codigo: 'leyendasdefacturas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Métodos de Pago de Facturas',
            codigo: 'metodosdepagodefacturas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Configuración-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Configuracion-General-Tipo Almacén',
            codigo: 'tipodealmacen-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Divisas',
            codigo: 'divisas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-General-Leyenda Proforma',
            codigo: 'leyendaproforma-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Categoría',
            codigo: 'categoriadeproducto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Estado',
            codigo: 'estadodeproducto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Unidad',
            codigo: 'unidaddeproducto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Característica',
            codigo: 'caracteristicadeproducto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Producto-Parámetros de obsolesc',
            codigo: 'parametrosdeobsolescencia-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Tipo de Cliente',
            codigo: 'tiposdeclientes-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Configuración-Cliente-Canal de Venta',
            codigo: 'canalesdeventa-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Administración-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Administración-Asignación-Almacén',
            codigo: 'asignaralmacen-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Punto de Venta',
            codigo: 'asignarpuntodeventa-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Asignación - Producto',
            codigo: 'asignarproductos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Almacén',
            codigo: 'registraralmacen-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Punto de Venta',
            codigo: 'registrarpuntodeventa-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Creación - Producto o Servic',
            codigo: 'registrarproductos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Costo Unitario',
            codigo: 'costounitario-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Categorías de Prec',
            codigo: 'categoriasdeprecio-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Precios Sugeridos',
            codigo: 'preciossugeridos-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Costos ',
            codigo: 'reportedepreciosbase-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Administración - Precios - Reporte de Categor',
            codigo: 'reportedecategoriasdeprecio-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Adm-Reg.ClProv-Registro de Clientes',
            codigo: 'registrodecliente-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Adm-RegCliPro-Registrar Proveedor',
            codigo: 'registrarproveedor-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Ventas-Atributos',
        codigo: 'opcionesocultas',
        submenu: [
          {
            titulo: 'Ventas-Generar Venta-Registrar Venta',
            codigo: 'registrarventaoculto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Venta-Generar Venta-Registrar Cotización',
            codigo: 'registrarcotizacionoculto-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Ventas',
            codigo: 'reportedeventas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte de Cotizacio',
            codigo: 'reportedecotizacionesocultas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Generar Venta - Reporte  Productos v',
            codigo: 'reporteproductosvendidosindividual-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Generar Venta - Kardex',
            codigo: 'kardex-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Cuentas por Cobrar - Reporte Ctas Cob',
            codigo: 'reportecuentasporcobrarocultas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas- Cuentas por Cobra -Cobro Cuentas',
            codigo: 'cuentasporcobrarocultas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Venta - Cuentas por Cobrar - Reporte de Cobro',
            codigo: 'reportecuentasxpagarxperiodo-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Anulaciones',
            codigo: 'registraranulaciones-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Contingencias - Registro de Extravío',
            codigo: 'registrodeextravios-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
          {
            titulo: 'Ventas - Registro Merma - Registro de Mermas',
            codigo: 'registrodemermas-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
    ],
  },
]
const menutest1 = [
  {
    modulo: '3',
    menu: [
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Compras',
        codigo: 'compras',
        submenu: [
          {
            titulo: 'Registrar Compra o Producción',
            codigo: 'registrarcompra-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
      {
        usuario: '7f39f8317fbdb1988ef4c628eba02591',
        titulo: 'Ventas',
        codigo: 'ventas',
        submenu: [
          {
            titulo: 'Generar Venta',
            codigo: 'registrarventa-7f39f8317fbdb1988ef4c628eba02591',
            permiso: '1111',
          },
        ],
      },
    ],
  },
]
usuarios.push(richard50)
usuarios.push(soporte74)
usuarios.push(manfret104)
usuarios.push(test75)
usuarios.push(test1)
console.log(menurichard501)
menus.push(menurichard50)
menus.push(menusoporte74)
menus.push(menumanfret104)
menus.push(menutest75)
menus.push(menutest1)

export { usuarios, menus }
