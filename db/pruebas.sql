SELECT de.id_devoluciones, de.autorizacion, de.fecha_devolucion, 
  de.motivo, de.venta_id_venta, cot.fecha_cotizacion, c.nombre, 
  c.nombrecomercial, c.nit, s.nombre, '' as numeroFactura, '' as cuf, 
  '' as shortLink, '' as urlSin, -1 as tipo_venta, pa.almacen_id_almacen, 
  c.ciudad, cot.num 
  FROM devoluciones de  
        LEFT JOIN cotizacion cot ON de.venta_id_venta=cot.id_cotizacion
        LEFT JOIN cliente c ON cot.cliente_id_cliente=c.id_cliente
        LEFT JOIN sucursal s ON cot.idsucursal=s.id_sucursal
        LEFT JOIN detalle_cotizacion dcot ON cot.id_cotizacion=dcot.cotizacion_id_cotizacion
        LEFT JOIN productos_almacen pa ON dcot.productos_almacen_id_productos_almacen=pa.id_productos_almacen
        WHERE c.idempresa = 50
        GROUP BY de.id_devoluciones
        ORDER BY de.id_devoluciones DESC
