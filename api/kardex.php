<?php
require_once "../db/conexion.php";
require_once "funciones.php";
class Kardex
{
    private $conexion;
    private $verificar;
    private $factura;
    private $cm;
    private $rh;
    private $ad;
    private $em;
    private $numceros;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->verificar = new Funciones();
        $this->factura = new Facturacion();
        $this->cm = $this->conexion->cm;
        $this->rh = $this->conexion->rh;
        $this->numceros = 4;
        //$this->ad = $this->conexion->ad; reportecreditos detalleVenta
        $this->em = $this->conexion->em;
    }

    public function arrayIDalmacen($idmd5)
    {
        $lista = array();
        $idusuario = $this->verificar->verificarIDUSERMD5($idmd5);
        $consulta = $this->cm->query("SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
            LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
            LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
            WHERE r.id_usuario='$idusuario'");

        while ($qwe = $this->cm->fetch($consulta)) {
            $idalmacen = $qwe[2]; 
            $lista[] = $idalmacen;
        }
        $resultado = implode(',', $lista);
        return $resultado;
    }

    public function kardex($fechainicio, $fechafinal, $idalmacen, $idproducto)
    {
        $lista = [];
        $lis =[];

        // Obtenemos el último registro antes del rango de fechas
        $rep1 = $this->cm->query("
            SELECT 
                s.productos_almacen_id_productos_almacen AS idproducto, 
                s.cantidad, 
                s.codigo, 
                s.fecha,
                s.idorigen,
                pa.almacen_id_almacen AS idalmacen
            FROM productos_almacen pa
            LEFT JOIN stock s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen
            WHERE
                s.productos_almacen_id_productos_almacen = '$idproducto' 
                AND s.fecha BETWEEN (DATE_ADD('$fechainicio', INTERVAL -1 MONTH)) AND (DATE_ADD('$fechainicio', INTERVAL -1 DAY))
                AND pa.almacen_id_almacen = '$idalmacen'
            ORDER BY s.id_stock DESC 
            LIMIT 1
        ");

        while ($qwe = $this->cm->fetch($rep1)) {
            // Caso 1: tiene idorigen → buscar precio exacto
            if (!empty($qwe['idorigen'])) {
                $p = $this->cm->query("
                    SELECT precio_unitario 
                    FROM detalle_ingreso 
                    WHERE id_detalle_ingreso = '{$qwe['idorigen']}'
                    LIMIT 1
                ");
                $pr = $this->cm->fetch($p);
                $precio = $pr ? $pr['precio_unitario'] : 0;
            }

            // Caso 2: es "MIC" y no tiene idorigen → usar última compra
            elseif (strtoupper(trim($qwe['codigo'])) == 'MIC') {
                $p = $this->cm->query("
                    SELECT precio_unitario 
                    FROM detalle_ingreso 
                    WHERE productos_almacen_id_productos_almacen = '$idproducto'
                    ORDER BY id_detalle_ingreso DESC 
                    LIMIT 1
                ");
                $pr = $this->cm->fetch($p);
                $precio = $pr ? $pr['precio_unitario'] : 0;
            }

            // Caso 3: sin precio conocido
            else {
                $precio = 0;
            }

            $lista[] = [
                "idproducto" => $qwe['idproducto'],
                "stock"      => $qwe['cantidad'],
                "codigo"     => $qwe['codigo'],
                "fecha"      => $qwe['fecha'],
                "precio"     => $precio,
                "idalmacen"  => $qwe['idalmacen']
            ];
        }

        // Ahora obtenemos el stock dentro del rango principal
       $sql = "
            SELECT 
                s.id_stock,
                s.productos_almacen_id_productos_almacen AS idproducto,
                s.cantidad, 
                s.codigo, 
                s.fecha,
                s.idorigen,
                pa.almacen_id_almacen AS idalmacen
            FROM productos_almacen pa
            LEFT JOIN stock s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen
            WHERE 
                s.productos_almacen_id_productos_almacen = ?
                AND s.fecha >= ? AND s.fecha <= ?
                AND pa.almacen_id_almacen = ?
            ORDER BY s.id_stock
        ";

        $stmt = $this->cm->prepare($sql);

        $stmt->bind_param("sssi", $idproducto, $fechainicio, $fechafinal, $idalmacen);

        $stmt->execute();
        $result = $stmt->get_result();
        
        $limit = 0;
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
            if ($row['codigo'] === 'MIC') {
                $limit++; // ajustamos según cantidad de MIC en el rango
            }
        }

        // Ahora procesamos cada registro
        foreach ($rows as $row) {
            $precio = $this->obtenerPrecioSeguro($this->cm, $row, $idproducto, $limit, $fechainicio, $fechafinal);

            $lista[] = [
                "idproducto" => $row['idproducto'],
                "stock"      => $row['cantidad'],
                "codigo"     => $row['codigo'],
                "fecha"      => $row['fecha'],
                "precio"     => $precio,
                "idalmacen"  => $row['idalmacen']
            ];

            // Si el registro es MIC, vamos disminuyendo el limit mientras avanzamos
            if ($row['codigo'] === 'MIC') {
                $limit--;
            }
        }
        echo json_encode($lista);
    }

    function obtenerPrecioSeguro($cm, $row, $idproducto, $limit, $fechainicio, $fechafinal)
    {
        $idorigen = $row['idorigen'] ?? null;
        $codigo = strtoupper(trim($row['codigo'] ?? ''));
        $precio = 0;
        if (!empty($idorigen)) {
            $sql = "SELECT precio_unitario FROM detalle_ingreso WHERE id_detalle_ingreso = ? LIMIT 1";
            if ($stmt = $cm->prepare($sql)) {
                $stmt->bind_param("i", $idorigen);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($data = $result->fetch_assoc()) {
                    $precio = $data['precio_unitario'];
                }
                $stmt->close();
            }
        }
        
        elseif ($codigo === 'MIC') {
            $offset = intval($limit) - 1;
            $sql = "SELECT di.precio_unitario 
                FROM detalle_ingreso di
                LEFT JOIN ingreso i ON di.ingreso_id_ingreso = i.id_ingreso
                WHERE di.productos_almacen_id_productos_almacen = ?
                AND i.fecha_ingreso BETWEEN ? AND ?
                ORDER BY i.fecha_ingreso DESC, di.id_detalle_ingreso DESC
                LIMIT 1 OFFSET $offset";

            if ($stmt = $cm->prepare($sql)) {
                $stmt->bind_param("iss", $idproducto, $fechainicio, $fechafinal);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($data = $result->fetch_assoc()) {
                    $precio = $data['precio_unitario'];
                }
                $stmt->close();
            }
        }

        return $precio;
    }


    
}



//kardex