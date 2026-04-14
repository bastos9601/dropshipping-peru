'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatearPrecio } from '@/lib/utils';
import Image from 'next/image';
import { ShoppingCart, User, MapPin, Phone, Mail, CreditCard, CheckCircle } from 'lucide-react';

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
}

export default function Checkout() {
  const params = useParams();
  const router = useRouter();
  const slugTienda = params.tienda as string;
  
  const [tienda, setTienda] = useState<any>(null);
  const [items, setItems] = useState<ProductoCarrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState('');
  
  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [referencia, setReferencia] = useState('');
  const [metodoPago, setMetodoPago] = useState('yape');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // Cargar tienda
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('slug_tienda', slugTienda)
      .single();

    if (!usuario) {
      router.push('/');
      return;
    }

    setTienda(usuario);

    // Cargar carrito del localStorage
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setItems(JSON.parse(carritoGuardado));
    } else {
      router.push(`/${slugTienda}`);
    }

    setCargando(false);
  };

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const envio = 10; // Costo fijo de envío
  const total = subtotal + envio;

  const realizarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setProcesando(true);

    try {
      // Crear pedido
      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert([{
          usuario_id: tienda.id,
          tienda_slug: slugTienda,
          cliente_nombre: nombre,
          cliente_email: email,
          cliente_telefono: telefono,
          cliente_direccion: direccion,
          cliente_ciudad: ciudad,
          cliente_referencia: referencia,
          productos: items,
          subtotal: subtotal,
          envio: envio,
          total: total,
          metodo_pago: metodoPago,
          estado: 'pendiente',
        }])
        .select()
        .single();

      if (error) throw error;

      // Enviar notificación al vendedor
      try {
        await fetch('/api/notificar-pedido', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedido, tienda })
        });
      } catch (notifError) {
        console.error('Error al enviar notificación:', notifError);
      }

      // Limpiar carrito
      localStorage.removeItem('carrito');
      
      // Mostrar confirmación
      setNumeroPedido(pedido.numero_pedido);
      setPedidoCreado(true);

    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (pedidoCreado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pedido realizado!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu pedido ha sido registrado exitosamente
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Número de pedido:</p>
            <p className="text-2xl font-bold text-blue-600">{numeroPedido}</p>
          </div>
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p>✓ Recibirás un mensaje de WhatsApp con los detalles</p>
            <p>✓ El vendedor confirmará tu pedido pronto</p>
            <p>✓ Te enviaremos el código de seguimiento</p>
          </div>
          {metodoPago === 'transferencia' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Realiza la transferencia y envía el comprobante por WhatsApp al {tienda.whatsapp}
              </p>
            </div>
          )}
          <button
            onClick={() => router.push(`/${slugTienda}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar compra</h1>
          <p className="text-gray-600">Completa tus datos para recibir tu pedido</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={realizarPedido} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Información personal */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información personal
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="999 999 999"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Dirección de envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección completa *
                    </label>
                    <input
                      type="text"
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Av. Principal 123, Dpto 456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Lima, Perú"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia (opcional)
                    </label>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Frente al parque, casa azul"
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Método de pago
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="yape"
                      checked={metodoPago === 'yape'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 font-medium">Yape / Plin</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="contraentrega"
                      checked={metodoPago === 'contraentrega'}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 font-medium">Contra Entrega</span>
                  </label>
                </div>

                {/* Mostrar QR de Yape si está seleccionado y existe */}
                {metodoPago === 'yape' && tienda.yape_qr_url && (
                  <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3 text-center">
                      Escanea el QR para pagar
                    </h3>
                    <div className="flex justify-center">
                      <img 
                        src={tienda.yape_qr_url} 
                        alt="QR Yape/Plin" 
                        className="w-64 h-64 object-contain border-4 border-white rounded-lg shadow-lg"
                      />
                    </div>
                    <p className="text-sm text-purple-700 text-center mt-3">
                      Después de pagar, envía tu comprobante por WhatsApp
                    </p>
                  </div>
                )}

                {metodoPago === 'yape' && !tienda.yape_qr_url && (
                  <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 text-center">
                      El vendedor te enviará los datos de pago por WhatsApp
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={procesando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors"
              >
                {procesando ? 'Procesando...' : 'Realizar pedido'}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Resumen del pedido
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.imagen_url}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.cantidad}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatearPrecio(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">{formatearPrecio(envio)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatearPrecio(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
