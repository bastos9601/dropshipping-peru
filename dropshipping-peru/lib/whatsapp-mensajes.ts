// Funciones para generar mensajes de WhatsApp para clientes

export function generarMensajePedidoConfirmado(pedido: any) {
  return `✅ *PEDIDO CONFIRMADO*

Hola ${pedido.cliente_nombre},

Tu pedido *${pedido.numero_pedido}* ha sido confirmado y está siendo procesado.

📦 *Detalles:*
${pedido.productos.map((p: any) => `• ${p.nombre} (x${p.cantidad})`).join('\n')}

💰 *Total:* S/ ${pedido.total.toFixed(2)}

Te notificaremos cuando tu pedido sea enviado.

¡Gracias por tu compra! 🎉`;
}

export function generarMensajePedidoEnviado(pedido: any, codigoSeguimiento: string) {
  return `📦 *PEDIDO ENVIADO*

Hola ${pedido.cliente_nombre},

¡Buenas noticias! Tu pedido *${pedido.numero_pedido}* ha sido enviado.

🚚 *Código de seguimiento:*
${codigoSeguimiento}

📍 *Dirección de entrega:*
${pedido.cliente_direccion}
${pedido.cliente_ciudad}

Recibirás tu pedido pronto.

¡Gracias por tu compra! 🎉`;
}

export function generarMensajePedidoEntregado(pedido: any) {
  return `✨ *PEDIDO ENTREGADO*

Hola ${pedido.cliente_nombre},

Tu pedido *${pedido.numero_pedido}* ha sido entregado exitosamente.

Esperamos que disfrutes tu compra. Si tienes alguna pregunta o problema, no dudes en contactarnos.

¡Gracias por confiar en nosotros! 💙`;
}

export function generarMensajePedidoCancelado(pedido: any) {
  return `❌ *PEDIDO CANCELADO*

Hola ${pedido.cliente_nombre},

Lamentamos informarte que tu pedido *${pedido.numero_pedido}* ha sido cancelado.

Si tienes alguna pregunta, por favor contáctanos.

Gracias por tu comprensión.`;
}

export function enviarWhatsApp(telefono: string, mensaje: string) {
  // Limpiar el número de teléfono
  const telefonoLimpio = telefono.replace(/\D/g, '');
  
  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);
  
  // Abrir WhatsApp
  const url = `https://wa.me/${telefonoLimpio}?text=${mensajeCodificado}`;
  window.open(url, '_blank');
}
