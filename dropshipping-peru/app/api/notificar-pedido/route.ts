import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pedido, tienda } = await request.json();

    // Generar mensaje de WhatsApp para el vendedor
    const mensaje = `🛒 *NUEVO PEDIDO*

📦 Pedido: ${pedido.numero_pedido}
👤 Cliente: ${pedido.cliente_nombre}
📱 Teléfono: ${pedido.cliente_telefono}
📍 Dirección: ${pedido.cliente_direccion}
🏙️ Ciudad: ${pedido.cliente_ciudad}

💰 Total: S/ ${pedido.total.toFixed(2)}
💳 Método de pago: ${pedido.metodo_pago}

📦 Productos:
${pedido.productos.map((p: any) => `- ${p.nombre} (x${p.cantidad}) - S/ ${(p.precio * p.cantidad).toFixed(2)}`).join('\n')}

✅ Revisa tu panel para gestionar el pedido`;

    // En producción, aquí integrarías con una API de WhatsApp Business
    // Por ahora, retornamos el mensaje para que se pueda enviar manualmente
    
    return NextResponse.json({
      success: true,
      mensaje,
      whatsappUrl: `https://wa.me/${tienda.whatsapp}?text=${encodeURIComponent(mensaje)}`
    });

  } catch (error: any) {
    console.error('Error al notificar pedido:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificación', message: error.message },
      { status: 500 }
    );
  }
}
