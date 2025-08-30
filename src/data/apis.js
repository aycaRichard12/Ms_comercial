// src/data/apis.js

/**
 * Define los colores de las insignias para cada método HTTP.
 * Esto centraliza la configuración visual.
 */
export const methodColors = {
  GET: 'positive',
  POST: 'info',
  PUT: 'warning',
  DELETE: 'negative',
  PATCH: 'orange',
}

/**
 * Array principal que contiene toda la documentación de la API, agrupada por categorías.
 * Para agregar una nueva API, simplemente añade un nuevo objeto al array `endpoints` de un grupo existente
 * o crea un nuevo grupo.
 */
export const apiGroups = [
  {
    groupName: 'Autenticación',
    endpoints: [
      {
        id: 'auth-login',
        name: 'Crear Token de Autenticación',
        method: 'POST',
        endpoint: '/api/out',
        description:
          'Genera un token JWT para autenticar al usuario. Este token es necesario para acceder a las rutas protegidas de la API.',
        params: [
          { name: 'ver', type: 'String', required: true, example: 'generarTokenJWT' },
          {
            name: 'idmd5',
            type: 'String',
            required: true,
            example: 'MyS3cr3tP@c0c7c76d30bd3dcaefc96f40275bdc0a',
          },
        ],
        requestExample: JSON.stringify(
          {
            ver: 'generarTokenJWT',
            idmd5: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
          },
          null,
          2,
        ),
        responseExample: JSON.stringify(
          {
            estado: 'success',
            token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaXN0ZXJzb2Z0cy5jb20iLCJhdWQiOiJtb2R1bG9jbSIsImlhdCI6MTc1NTgwNTk3OSwiZXhwIjoxNzg3NDI4Mzc5LCJkYXRhIjp7ImlkX2VtcHJlc2EiOjUwL......',
          },
          null,
          2,
        ),
        errors: [
          {
            code: 404,
            message: 'Not Found: No se encontró el parámetro con los valores proporcionados ',
          },
          { code: 500, message: 'Internal Server Error: Error inesperado en el servidor.' },
        ],
        notes:
          'El token JWT es válido únicamente hasta que su licencia de usuario empresa expire. Manténgalo seguro y no lo comparta.',
      },
    ],
  },
  {
    groupName: 'Productos',
    endpoints: [
      {
        id: 'user-get-by-id',
        name: 'Obtener Productos por Codigo Almacen',
        method: 'GET',
        endpoint: 'api/out/productos/{Codigo Almacen}',
        description: 'Recupera los Productos del almacen en un formato JSON.',
        params: [
          {
            name: 'Autorizacion Bearer',
            type: 'token',
            required: true,
            example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaXN0ZXJzb2Z0cy5j.....',
          },
        ],
        requestExample: null, // No hay cuerpo de solicitud para un GET
        responseExample: JSON.stringify({
          id: 5023,
          nombre_producto: 'Pan hamburguesa',
          descripcion_producto: 'de harina fina importada',
          codigo_sin: '99100',
          actividad_sin: '610000',
          unidad_sin: '17',
          codigo_nandina: null,
          url_imagen: 'images/Pan hamburguesa343791.jpg',
          stock_actual: 46,
          codigo_barras: '777746535001',
          categoria: 'Producto Terminado',
          subcategoria: '',
          origen_producto: 'Panadería',
          estado_producto: 'Óptimo',
          unidad_medida: 'pzas',
          caracteristicas_extra: 'aprox. 70g',
        }),
        errors: [
          { code: 404, message: 'Not Found: Usuario no encontrado.' },
          { code: 401, message: 'Unauthorized: Se requiere token de autenticación.' },
        ],
        notes: 'Solo los que tengan los token pueden obtener los productos en formato Jsonn.',
      },
      {
        id: 'user-create',
        name: 'Crear un Nuevo Usuario',
        method: 'POST',
        endpoint: '/api/users',
        description: 'Crea un nuevo registro de usuario en el sistema.',
        params: [
          { name: 'name', type: 'String', required: true, example: 'Peter Jones' },
          { name: 'email', type: 'String', required: true, example: 'peter.jones@example.com' },
          { name: 'password', type: 'String', required: true, example: 'Str0ngP@ssw0rd!' },
        ],
        requestExample: JSON.stringify(
          {
            name: 'Peter Jones',
            email: 'peter.jones@example.com',
            password: 'Str0ngP@ssw0rd!',
          },
          null,
          2,
        ),
        responseExample: JSON.stringify(
          {
            success: true,
            message: 'Usuario creado exitosamente.',
            userId: 'd8e4f3b9-b3c1-4e8a-9f5d-1a2b3c4d5e6f',
          },
          null,
          2,
        ),
        errors: [
          { code: 400, message: 'Bad Request: Datos inválidos o faltantes.' },
          { code: 409, message: 'Conflict: El correo electrónico ya está en uso.' },
        ],
        notes: '',
      },
    ],
  },
]
