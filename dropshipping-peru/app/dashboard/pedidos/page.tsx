'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatearPrecio } from '@/lib/utils';
import { Package, Eye, CheckCircle, Truck, XCircle, Clock, Search, Filter, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/componentes/Navbar';
import { useRouter } from 'next/navigation';
import { 
  generarMensajePedidoConfirmado, 
  generarMensajePedidoEnviado, 
  generarMensajePedidoEntregado,
  enviarWhatsApp 
} from '@/lib/whatsapp-mensajes';

interface Pedido {
  id: string;
  numero_pedido: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  cliente_direccion: string;
  cliente_ciudad: string;
  cliente_referencia: string;
  productos: any[];
  subtotal: number;
  envio: number;
  total: number;
  estado: string;
  metodo_pago: string;
  pago_confirmado: boolean;
  codigo_seguimiento: string;
  notas: string;
  created_at: string;
}

export default function PedidosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    verificarUsuario();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [filtroEstado, busqueda, pedidos]);

  const verificarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      await supabase.auth.signOut();
      router.push('/login');
      return;
    }

    setUsuario(perfil);
    cargarPedidos(user.id);
  };

  const cargarPedidos = async (userId: string) => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setPedidos(data);
    }
    setCargando(false);
  };

  const filtrarPedidos = () => {
    let resultado = pedidos;

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.numero_pedido.toLowerCase().includes(termino) ||
        p.cliente_nombre.toLowerCase().includes(termino) ||
        p.cliente_telefono.includes(termino)
      );
    }

    setPedidosFiltrados(resultado);
  };

  const confirmarPago = async (pedidoId: string) => {
    const { error, data } = await supabase
      .from('pedidos')
      .update({ pago_confirmado: true, estado: 'confirmado' })
      .eq('id', pedidoId)
      .select()
      .single();

    if (!error && usuario) {
      // Actualizar la lista de pedidos
      cargarPedidos(usuario.id);
      
      // Actualizar el pedido seleccionado en el modal
      if (data && pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(data);
      }
      
      alert('Pago confirmado exitosamente');
    }
  };

  const marcarComoEnviado = async (pedidoId: string, codigoSeguimiento: string) => {
    if (!codigoSeguimiento.trim()) {
      alert('Por favor ingresa un código de seguimiento');
      return;
    }

    const { error, data } = await supabase
      .from('pedidos')
      .update({ 
        estado: 'enviado',
        codigo_seguimiento: codigoSeguimiento
      })
      .eq('id', pedidoId)
      .select()
      .single();

    if (!error && usuario) {
      // Actualizar la lista de pedidos
      cargarPedidos(usuario.id);
      
      // Actualizar el pedido seleccionado en el modal
      if (data && pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(data);
      }
      
      alert('Pedido marcado como enviado');
    }
  };

  const marcarComoEntregado = async (pedidoId: string) => {
    const { error, data } = await supabase
      .from('pedidos')
      .update({ estado: 'entregado' })
      .eq('id', pedidoId)
      .select()
      .single();

    if (!error && usuario) {
      // Actualizar la lista de pedidos
      cargarPedidos(usuario.id);
      
      // Actualizar el pedido seleccionado en el modal
      if (data && pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(data);
      }
      
      alert('Pedido marcado como entregado');
    }
  };

  const cancelarPedido = async (pedidoId: string) => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;

    const { error, data } = await supabase
      .from('pedidos')
      .update({ estado: 'cancelado' })
      .eq('id', pedidoId)
      .select()
      .single();

    if (!error && usuario) {
      // Actualizar la lista de pedidos
      cargarPedidos(usuario.id);
      
      // Actualizar el pedido seleccionado en el modal
      if (data && pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(data);
      }
      
      alert('Pedido cancelado');
    }
  };

  const eliminarPedido = async (pedidoId: string) => {
    if (!confirm('⚠️ ¿Estás seguro de ELIMINAR este pedido? Esta acción no se puede deshacer.')) return;

    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', pedidoId);

    if (!error && usuario) {
      // Actualizar la lista de pedidos
      cargarPedidos(usuario.id);
      
      // Cerrar el modal
      setPedidoSeleccionado(null);
      
      alert('Pedido eliminado exitosamente');
    } else if (error) {
      alert('Error al eliminar el pedido: ' + error.message);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };

    const iconos = {
      pendiente: Clock,
      confirmado: CheckCircle,
      enviado: Truck,
      entregado: Package,
      cancelado: XCircle,
    };

    const Icon = iconos[estado as keyof typeof iconos];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estilos[estado as keyof typeof estilos]}`}>
        <Icon className="h-4 w-4 mr-1" />
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600 mt-2">Gestiona los pedidos de tu tienda</p>
        </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
              <Search className="h-4 w-4" />
              <span>Buscar pedido</span>
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Número de pedido, cliente o teléfono..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              <span>Filtrar por estado</span>
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {pedidos.filter(p => p.estado === 'pendiente').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Confirmados</p>
              <p className="text-2xl font-bold text-blue-900">
                {pedidos.filter(p => p.estado === 'confirmado').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Enviados</p>
              <p className="text-2xl font-bold text-purple-900">
                {pedidos.filter(p => p.estado === 'enviado').length}
              </p>
            </div>
            <Truck className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Entregados</p>
              <p className="text-2xl font-bold text-green-900">
                {pedidos.filter(p => p.estado === 'entregado').length}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay pedidos
          </h3>
          <p className="text-gray-600">
            {busqueda || filtroEstado !== 'todos' 
              ? 'No se encontraron pedidos con los filtros aplicados'
              : 'Aún no has recibido ningún pedido'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{pedido.numero_pedido}</div>
                      <div className="text-sm text-gray-500">{pedido.productos.length} producto(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pedido.cliente_nombre}</div>
                      <div className="text-sm text-gray-500">{pedido.cliente_telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatearPrecio(pedido.total)}</div>
                      <div className="text-xs text-gray-500">{pedido.metodo_pago}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(pedido.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.created_at).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPedidoSeleccionado(pedido)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalles
                        </button>
                        <button
                          onClick={() => eliminarPedido(pedido.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
                          title="Eliminar pedido"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Modal de detalles del pedido */}
        {pedidoSeleccionado && (
          <DetallesPedidoModal
            pedido={pedidoSeleccionado}
            onClose={() => setPedidoSeleccionado(null)}
            onConfirmarPago={confirmarPago}
            onMarcarEnviado={marcarComoEnviado}
            onMarcarEntregado={marcarComoEntregado}
            onCancelar={cancelarPedido}
            onEliminar={eliminarPedido}
          />
        )}
      </div>
    </div>
  );
}

// Modal de detalles
function DetallesPedidoModal({
  pedido,
  onClose,
  onConfirmarPago,
  onMarcarEnviado,
  onMarcarEntregado,
  onCancelar,
  onEliminar,
}: any) {
  const [codigoSeguimiento, setCodigoSeguimiento] = useState(pedido.codigo_seguimiento || '');

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Pedido {pedido.numero_pedido}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Cerrar</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y pago */}
          <div className="flex items-center justify-between">
            <div>
              {getEstadoBadge(pedido.estado)}
            </div>
            <div>
              {pedido.pago_confirmado ? (
                <span className="text-green-600 font-medium">✓ Pago confirmado</span>
              ) : (
                <span className="text-yellow-600 font-medium">⏳ Esperando pago</span>
              )}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Información del cliente</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <p className="font-medium">{pedido.cliente_nombre}</p>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <p className="font-medium">{pedido.cliente_telefono}</p>
              </div>
              {pedido.cliente_email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{pedido.cliente_email}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Ciudad:</span>
                <p className="font-medium">{pedido.cliente_ciudad}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">Dirección:</span>
                <p className="font-medium">{pedido.cliente_direccion}</p>
              </div>
              {pedido.cliente_referencia && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">Referencia:</span>
                  <p className="font-medium">{pedido.cliente_referencia}</p>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
            <div className="space-y-3">
              {pedido.productos.map((producto: any, index: number) => (
                <div key={index} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{producto.nombre}</p>
                    <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {formatearPrecio(producto.precio * producto.cantidad)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatearPrecio(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="font-semibold">{formatearPrecio(pedido.envio)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">{formatearPrecio(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Código de seguimiento */}
          {pedido.estado === 'enviado' && pedido.codigo_seguimiento && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium mb-1">Código de seguimiento:</p>
              <p className="text-lg font-bold text-purple-900">{pedido.codigo_seguimiento}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {pedido.estado === 'pendiente' && !pedido.pago_confirmado && (
              <>
                <button
                  onClick={() => onConfirmarPago(pedido.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Confirmar pago recibido
                </button>
                <button
                  onClick={() => {
                    const mensaje = generarMensajePedidoConfirmado(pedido);
                    enviarWhatsApp(pedido.cliente_telefono, mensaje);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Notificar confirmación por WhatsApp</span>
                </button>
              </>
            )}

            {(pedido.estado === 'confirmado' || (pedido.estado === 'pendiente' && pedido.pago_confirmado)) && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={codigoSeguimiento}
                  onChange={(e) => setCodigoSeguimiento(e.target.value)}
                  placeholder="Código de seguimiento"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => onMarcarEnviado(pedido.id, codigoSeguimiento)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Marcar como enviado
                </button>
                <button
                  onClick={() => {
                    if (!codigoSeguimiento.trim()) {
                      alert('Por favor ingresa un código de seguimiento primero');
                      return;
                    }
                    const mensaje = generarMensajePedidoEnviado(pedido, codigoSeguimiento);
                    enviarWhatsApp(pedido.cliente_telefono, mensaje);
                  }}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Notificar envío por WhatsApp</span>
                </button>
              </div>
            )}

            {pedido.estado === 'enviado' && (
              <>
                <button
                  onClick={() => onMarcarEntregado(pedido.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Marcar como entregado
                </button>
                <button
                  onClick={() => {
                    const mensaje = generarMensajePedidoEntregado(pedido);
                    enviarWhatsApp(pedido.cliente_telefono, mensaje);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Notificar entrega por WhatsApp</span>
                </button>
              </>
            )}

            {pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
              <button
                onClick={() => onCancelar(pedido.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancelar pedido
              </button>
            )}

            {/* Separador */}
            <div className="border-t pt-3"></div>

            {/* Botón para eliminar pedido */}
            <button
              onClick={() => onEliminar(pedido.id)}
              className="w-full bg-red-800 hover:bg-red-900 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 border-2 border-red-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Eliminar pedido permanentemente</span>
            </button>

            {/* Botón para cerrar el modal */}
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <XCircle className="h-5 w-5" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getEstadoBadge(estado: string) {
  const estilos = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmado: 'bg-blue-100 text-blue-800',
    enviado: 'bg-purple-100 text-purple-800',
    entregado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  };

  const iconos = {
    pendiente: Clock,
    confirmado: CheckCircle,
    enviado: Truck,
    entregado: Package,
    cancelado: XCircle,
  };

  const Icon = iconos[estado as keyof typeof iconos];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estilos[estado as keyof typeof estilos]}`}>
      <Icon className="h-4 w-4 mr-1" />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}
