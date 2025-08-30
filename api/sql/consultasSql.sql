





SELECT
    v.fecha_venta,
    v.nfactura,
    v.tipo_venta,
    p.descripcion,
    u.nombre,
    COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
    pb.precio,
    dv.precio_unitario,
    dv.cantidad,
    (dv.precio_unitario * dv.cantidad) AS importe, 
    0 AS descuento,
    (dv.precio_unitario * dv.cantidad) AS ventatotal,
    (pb.precio * dv.cantidad) AS costototal,
    (dv.precio_unitario * dv.cantidad)-(pb.precio * dv.cantidad) AS utilidad,
    v.tipo_pago,
    v.id_usuario,
    a.idsucursal,
    a.nombre,
    c.nombre,
    c.tipodocumento,
    c.nit,
    c.nombrecomercial,
    cv.canal,
    po.tipo,
    pa.almacen_id_almacen,
    v.estado,
    su.nombre,
    v.id_usuario,
    COALESCE(sca.nombre, '') AS nombre_subcategoria,
    p.codigo,
    p.cod_barras,
    v.idsucursal,
    v.cliente_id_cliente1
FROM detalle_venta dv
LEFT JOIN venta v ON dv.venta_id_venta = v.id_venta
LEFT JOIN sucursal su ON v.idsucursal = su.id_sucursal
LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
LEFT JOIN precio_base pb ON pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen
LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
LEFT JOIN canalventa cv ON v.idcanal = cv.idcanalventa
LEFT JOIN porcentajes po ON dv.categoria = po.id_porcentajes
LEFT JOIN unidad u ON p.unidad_id_unidad = u.id_unidad
LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
WHERE v.fecha_venta BETWEEN '2025-01-01' AND '2025-02-01' AND a.idempresa = 74 AND pb.estado = 1 AND v.estado = 1
ORDER BY
v.id_venta ASC,
v.fecha_venta ASC
































SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
            LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
            LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
            WHERE r.id_empresa=50
            ORDER BY ra.idresponsablealmacen desc
 select id_productos, nombre, descripcion from productos  where idempresa = 74 and descripcion like '%Molido%';




 Microsoft Windows [Versión 10.0.26100.4349]
(c) Microsoft Corporation. Todos los derechos reservados.

C:\Windows\System32>mysql -h 145.14.151.51 -u u335921272_vcomercial -p
Enter password: ***************
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 61799677
Server version: 5.5.5-10.11.10-MariaDB-log MariaDB Server

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> use u335921272_vcomercial
Database changed
mysql> update venta set nfactura =1535 where id_venta =1395
    -> ;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61815153
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.12 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1535 where id_venta =1395;
Query OK, 0 rows affected (0.20 sec)
Rows matched: 1  Changed: 0  Warnings: 0

mysql> update venta set nfactura =55 where id_venta =1266;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61826226
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.15 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1526 where id_venta =1391;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61830226
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.21 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1521 where id_venta =1390;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61833817
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.15 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1481 where id_venta =1364;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61840258
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.11 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1450 where id_venta =1361;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61848717
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.49 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1404 where id_venta =1352;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61853457
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.15 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1235 where id_venta =1319;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61856954
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.14 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1055 where id_venta =1302;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61861866
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.13 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1042 where id_venta =1299;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61865772
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.40 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =973 where id_venta =1294;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61872564
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.10 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =818 where id_venta =1286;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61876562
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.17 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =819 where id_venta =1287;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61880890
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.06 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 664 where id_venta =1278;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61885243
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.05 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 584 where id_venta =1274;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61889045
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.10 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 583 where id_venta =1276;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61893041
Current database: u335921272_vcomercial

Query OK, 1 row affected (4.63 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 470 where id_venta =1272;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61897557
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.09 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 471 where id_venta =1273;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61901843
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.07 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql>





CREATE TABLE
  `cierre_puntoVenta` (
    `id_cierre` int(11) NOT NULL AUTO_INCREMENT,
    `id_usuario` int(11) NOT NULL,
    `fecha_inicio` date NOT NULL,
    `fecha_fin` date NOT NULL,
    `observacion` text DEFAULT NULL,
    `creado_en` timestamp NOT NULL,
    `estado` int(11) NOT NULL,
    `autorizado` int(11) NOT NULL,
    `id_punto_venta` int(11) NOT NULL,
    PRIMARY KEY (`id_cierre`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci

CREATE TABLE
  `cierre_conceptos` (
    `id_concepto` int(11) NOT NULL AUTO_INCREMENT,
    `id_cierre` int(11) NOT NULL,
    `concepto` varchar(50) NOT NULL,
    `sistema` decimal(15, 2) NOT NULL,
    `contado` decimal(15, 2) NOT NULL,
    `diferencia` decimal(15, 2) NOT NULL,
    PRIMARY KEY (`id_concepto`),
    KEY `id_cierre` (`id_cierre`),
    CONSTRAINT `cierre_conceptos_ibfk_1` FOREIGN KEY (`id_cierre`) REFERENCES `cierre_puntoVenta` (`id_cierre`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 13 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci


CREATE TABLE
  `cierre_metodos_pago` (
    `id_cierre_metodos_pago` int(11) NOT NULL AUTO_INCREMENT,
    `id_cierre` int(11) NOT NULL,
    `id_metodo` int(11) NOT NULL,
    `metodo` varchar(50) NOT NULL,
    `total_sistema` decimal(15, 2) NOT NULL,
    `total_contado` decimal(15, 2) NOT NULL,
    `diferencia` decimal(15, 2) NOT NULL,
    `tipo` varchar(50) DEFAULT NULL,
    PRIMARY KEY (`id_cierre_metodos_pago`),
    KEY `id_cierre` (`id_cierre`),
    CONSTRAINT `cierre_metodos_pago_ibfk_1` FOREIGN KEY (`id_cierre`) REFERENCES `cierre_puntoVenta` (`id_cierre`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci

CREATE TABLE
  `cierre_arqueo_fisico` (
    `id_arqueo` int(11) NOT NULL AUTO_INCREMENT,
    `id_cierre` int(11) NOT NULL,
    `valor_moneda` decimal(10, 2) NOT NULL,
    `cantidad` int(11) NOT NULL,
    `label` varchar(50) NOT NULL,
    PRIMARY KEY (`id_arqueo`),
    KEY `id_cierre` (`id_cierre`),
    CONSTRAINT `cierre_arqueo_fisico_ibfk_1` FOREIGN KEY (`id_cierre`) REFERENCES `cierre_puntoVenta` (`id_cierre`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 23 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci




