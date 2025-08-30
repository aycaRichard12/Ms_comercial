<?php
require_once "apiTokens.php";

class outVenta
{
    // --- CONEXIONES Y CLASES AUXILIARES ---
    private $cm;
    private $rh;
    private $em;
    private $conexion;
    private $verificar;
    private $factura;
    private $logger;
    private $venta;
    private $funcionesVenta;
    private $token;
    private $configuracion;
     private $numceros;

    // --- CONSTANTES DE CLASE ---
    private const TIPO_VENTA_SIN_FACTURA = 0;
    private const TIPO_PAGO_CREDITO = 'credito';
    private const PAGO_VARIABLE_DIVIDIDO = 'dividido';
    private const MAX_INTENTOS_CONSULTA_FACTURA = 5;
    private const ESTADO_FACTURA_VALIDADA = 690; // Código de estado 'VALIDADA' de Emizor/SIN
    private const MAX_INTENTOS_NRO_FACTURA = 1000;

    /**
     * Constructor de la clase Ventas.
     */
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->logger = new LogErrores();
        $this->venta = new UseVEnta();
        $this->funcionesVenta = new ventas();
        $this->token = new ApiTokens();
        $this->configuracion = new configuracion();
        $this->numceros = 4;
        // Asignación de conexiones a bases de datos
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->em = $this->conexion->em;
        
    }
    public function getidAlmacen($codigo){
        $sql = "SELECT id_almacen FROM almacen WHERE codigo = ?";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("s", $codigo);
        $stmt->execute();
        $stmt->bind_result($id_almacen);  // vinculas la salida a una variable
        $stmt->fetch();                   // obtienes el valor
        $stmt->close();
        return $id_almacen;               // retorna el id directamente
    }
     
    public function registrarCliente($datosCliente, $idmd5E, $token, $factura) {
        $res = 0;

        //  Validar campos obligatorios
        $obligatorios = ['nombre', 'nombreComercial', 'tipoDocumento', 'nit'];
        foreach ($obligatorios as $campo) {
            if (!isset($datosCliente[$campo]) || empty(trim($datosCliente[$campo]))) {
                return 0; // o puedes lanzar una excepción si prefieres
            }
        }

        //  Verificar si ya existe cliente con el mismo NIT
        $sql = "SELECT c.id_cliente FROM cliente c WHERE c.nit = ?;";
        $stmt = $this->cm->prepare($sql);
        $stmt->bind_param("s", $datosCliente['nit']);
        $stmt->execute();
        $stmt->bind_result($id_cliente);
        $stmt->fetch();
        $stmt->close();

        if ($id_cliente) {
            $res = $id_cliente;
        } else {
            
            //  Registrar cliente nuevo
            $id_cliente_nuevo = $this->funcionesVenta->registrocliente(
                $datosCliente['nombre'],
                $datosCliente['nombreComercial'],
                $datosCliente['codigoCanal']      ?? '',
                $datosCliente['codigoTipoCliente']?? '',
                $datosCliente['tipoDocumento'],
                $datosCliente['nit'],
                $datosCliente['detalle']          ?? '',
                $datosCliente['direccion']        ?? '',
                $datosCliente['telefono']         ?? '',
                $datosCliente['mobil']            ?? '',
                $datosCliente['email']            ?? '',
                $datosCliente['web']              ?? '',
                $datosCliente['pais']             ?? '',
                $datosCliente['ciudad']           ?? '',
                $datosCliente['zona']             ?? '',
                $datosCliente['contacto']         ?? '',
                $idmd5E,
                1
            );
            $res = $id_cliente_nuevo;
        }
        if(($factura == 2 || $factura == 1) && $datosCliente['tipoDocumento'] == 5 ){
            $validar = $this->factura->validarNIT($datosCliente['nit'],$token,$factura);
        }else{

        }

        return $res;
    }

   
    public function canal_venta($idmd5)
    {
        $lista = [];
        $idempresa = $this->verificar->verificarIDEMPRESAMD5($idmd5);
        if ($idempresa === "false") {
            echo json_encode(array("error" => "El id de empresa no existe"));
            return;
        }
        $consulta = $this->cm->query("SELECT * from canalventa where idempresa='$idempresa' and estado = 1 order by idcanalventa desc");
        while ($qwe = $this->cm->fetch($consulta)) {
            $res = array("codigo" => $qwe[0], "canal" => $qwe[1], "descripcion" => $qwe[2], "estado" => $qwe[3]);
            array_push($lista, $res);
        }
        echo json_encode($lista);
    }
    public function verificarRegistroCliente($data){

    }

    public function crearSucursal($idcliente){

    }

    public function obtenerUsuariVendedor($id_almacen){

    }

    public function obtenerPuntoVentaAlmace($id_almacen){

    }

    public function idProducto($idmd5P){
        $consulta = $this->cm->query("select id_productos_almacen from productos_almacen WHERE MD5(id_productos_almacen) = '$idmd5P'");
        if ($consulta->num_rows > 0) {
            $fila = $this->cm->fetch($consulta);
            $id = $fila[0];
            return $id;
        } else {
            return "false";
        }

    }

    public function OrdenarProductos($dataproductos){
        // [{
        //     "id": "b17c0907e67d868b4e0feb43dbbe6f11",
        //     "codigoProducto": "PH-001",
        //     "codigoProductoSin": "99100",
        //     "codigoActividadSin": "610000",
        //     "unidadSin": "17",
        //     "codigoNandina": null,
        //     "codigoPorcentaje": 211,
        //     "precioUnitario": 0,
        //      "cantidad": 1,
        // },.....]

        
            


    }
    public function getFormularioVenta(){
        $datos = [ 
            "jsonDetalles"=> [
                "listaProductos"=> [
                    [
                        "idproductoalmacen"=> "5036",
                        "cantidad"=> 1,
                        "precio"=> "90",
                        //"idstock"=> "61195",
                        "idporcentaje"=> "212",
                        "id"=> "5036",
                        "subtotal"=> 90,
                        "despachado"=> 1
                    ]
                ],
                "listaProductosFactura"=> [
                    [
                        "codigoProducto"=> "MV-001",
                        "codigoActividadSin"=> "620100",
                        "codigoProductoSin"=> "991009",
                        "unidadMedida"=> "4",
                        "precioUnitario"=> "90",
                        "subTotal"=> "90.00",
                        "cantidad"=> 1,
                        "numeroSerie"=> "",
                        "montoDescuento"=> 0,
                        "numeroImei"=> "",
                        "codigoNandina"=> ""
                    ]
                ],
                "listaFactura"=> [
                    "numeroFactura"=> "",
                    "nombreRazonSocial"=> "Cliente De Venta",
                    //"codigoPuntoVenta"=> "1",
                    "fechaEmision"=> "2025-08-22T16=>29=>05.799Z",
                    "cafc"=> "",
                    "codigoExcepcion"=> "",
                    "descuentoAdicional"=> 0,
                    "montoGiftCard"=> 0,
                    "codigoTipoDocumentoIdentidad"=> "1",
                    "numeroDocumento"=> "2352345",
                    "complemento"=> "",
                    //"codigoCliente"=> "CA-500016",
                    "periodoFacturado"=> "",
                    "codigoMetodoPago"=> "21",
                    "numeroTarjeta"=> "",
                    "montoTotal"=> "90.00",
                    //"codigoMoneda"=> 1,
                    "montoTotalMoneda"=> "90.00",
                    //"usuario"=> "richard50",
                    "emailCliente"=> "factura@yofinanciero.com",
                    "telefonoCliente"=> "1084234",
                    "extras"=> [
                        "facturaTicket"=> ""
                    ],
                    "montoTotalSujetoIva"=> "90.00",
                    "tipoCambio"=> 1,
                    "detalles"=> [
                        [
                            "codigoProducto"=> "MV-001",
                            "codigoActividadSin"=> "620100",
                            "codigoProductoSin"=> "991009",
                            "descripcion"=> "Producido con harina nacional.",
                            "unidadMedida"=> "4",
                            "precioUnitario"=> "90",
                            "subTotal"=> "90.00",
                            "cantidad"=> 1,
                            "numeroSerie"=> "",
                            "montoDescuento"=> 0,
                            "numeroImei"=> "",
                            "codigoNandina"=> ""
                        ]
                    ]
                ],
                "idalmacen"=> "93",
                "codigosinsucursal"=> "1",
                "token"=> "",
                "tipo"=> "1",
                "iddivisa"=> 8,
                "idcampana"=> 0,
                "ventatotal"=> "90.00",
                "subtotal"=> "90.00",
                "descuento"=> 0,
                "nropagos"=> 0,
                "valorpagos"=> 0,
                "dias"=> null,
                "fechalimite"=> "",
                "pagosDivididos"=> [
                    [
                        "metodoPago"=> [
                            "label"=> "Transferencia",
                            "id"=> null,
                            "value"=> "21"
                        ],
                        "monto"=> "90.00",
                        "porcentaje"=> 100
                    ]
                ],
                "variablePago"=> "dividido"
            ]
        ];


        return $datos;
    }
    public function registrarVenta($data){
        $datostoken = $this->token->autenticarPeticion();
        $id_empresa = $datostoken->data->id_empresa;
        $factura = $datostoken->data->tipo;
        $id_almacen = $this->getidAlmacen($data->codigoAlmacen);
        
        $tipoventa = "1";
        $idusuario = "eb160de1de89d9058fcb0b968dbbbd68";
        $idempresa = "c0c7c76d30bd3dcaefc96f40275bdc0a";
        $idcliente= "1714";
        $sucursal= "1437";
        $tipodoc= "1";
        $nrodoc= "2352345";
        $fecha= "2025-08-22";
        $puntoventa= "1";
        $metodoPago= "null";
        $canal= "37";
        $tipopago= "contado";
    
        if($factura == 2){

        }else{

        }
    }
    
    function tipo_documentos() {
        // Validar método permitido
        try {
            // Código que puede fallar
            $datostoken = $this->token->autenticarPeticion();
                if (!$datostoken || empty($datostoken->data->id_empresa)) {
                    http_response_code(401); // No autorizado
                    echo json_encode([
                        "estado" => "error",
                        "codigo" => 401,
                        "mensaje" => "Token inválido o no autorizado."
                    ], JSON_UNESCAPED_UNICODE);
                    return;
                }
                $documentos = [
                    ["documento" => "CI",  "codigo" => 1],
                    ["documento" => "CEX", "codigo" => 2],
                    ["documento" => "PAS", "codigo" => 3],
                    ["documento" => "OD",  "codigo" => 4],
                    ["documento" => "NIT", "codigo" => 5],
                ];

                echo json_encode([
                    "estado" => "success",
                    "resultado" => $documentos
                ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    public function verificarToken($token){
        try {
            

        
            $tokenEmizor = $this->token->obtenerverifcatoken($token);
             //echo json_encode(['tokeemizor'=>$tokenEmizor, 'idm5' =>$idmd5,'tipo'=>$factura]);
           // $this->configuracion->listaMetodoPagoFactura($idmd5,$tokenEmizor,$factura);
       
            
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }
    public function metodos_pago(){
        try {
            // Código que puede fallar
            $datostoken = $this->token->autenticarPeticion();
            $id_empresa = $datostoken->data->id_empresa;
            $factura = $datostoken->data->tipo;
            $idmd5 = $datostoken->data->md5;

            if($factura == 2 || $factura == 1){
                $tokenEmizor = $this->token->obtenerTokenEmizor($idmd5);
                //echo json_encode(['tokeemizor'=>$tokenEmizor, 'idm5' =>$idmd5,'tipo'=>$factura]);
                $this->configuracion->listaMetodoPagoFactura($idmd5,$tokenEmizor,$factura);
            }else{
                $this->configuracion->listaMetodoPagoFactura($idmd5,"",0);
            }
            
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function puntos_venta($idmd5){
        try {
            // Código que puede fallar encontrada
            $datostoken = $this->token->autenticarPeticion();
            $factura = $datostoken->data->tipo;
            if($factura == 2 || $factura == 1){
                $this->funcionesVenta->listaPuntoVentaFactura($idmd5);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "estado" => "error",
                "codigo" => 500,
                "mensaje" => "Error interno",
                "detalle" => $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    
}
