'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notificacion {
  id: string;
  numero_pedido: string;
  cliente_nombre: string;
  total: number;
  created_at: string;
}

export default function NotificacionesPedidos({ usuarioId }: { usuarioId: string }) {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mostrar, setMostrar] = useState(false);
  const [nuevaNotificacion, setNuevaNotificacion] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Cargar notificaciones recientes (últimas 24 horas)
    cargarNotificaciones();

    // Evitar suscripciones duplicadas
    if (channelRef.current) {
      return;
    }

    // Crear un ID único para este componente
    const componentId = Math.random().toString(36).substring(7);
    const channelName = `pedidos-nuevos-${usuarioId}-${componentId}`;

    // Suscribirse a nuevos pedidos en tiempo real
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pedidos',
          filter: `usuario_id=eq.${usuarioId}`
        },
        (payload) => {
          const nuevoPedido = payload.new as Notificacion;
          setNotificaciones(prev => [nuevoPedido, ...prev]);
          setNuevaNotificacion(true);
          
          // Mostrar notificación del navegador
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🛒 Nuevo Pedido', {
              body: `${nuevoPedido.cliente_nombre} - S/ ${nuevoPedido.total}`,
              icon: '/favicon.png'
            });
          }
          
          // Reproducir sonido (opcional)
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [usuarioId]);

  const cargarNotificaciones = async () => {
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);

    const { data } = await supabase
      .from('pedidos')
      .select('id, numero_pedido, cliente_nombre, total, created_at')
      .eq('usuario_id', usuarioId)
      .gte('created_at', hace24Horas.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotificaciones(data);
    }
  };

  const irAPedido = (pedidoId: string) => {
    setMostrar(false);
    router.push('/dashboard/pedidos');
  };

  const limpiarNotificaciones = () => {
    setNotificaciones([]);
    setNuevaNotificacion(false);
  };

  return (
    <>
      {/* Botón de notificaciones */}
      <button
        onClick={() => {
          setMostrar(!mostrar);
          setNuevaNotificacion(false);
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6" />
        {(nuevaNotificacion || notificaciones.length > 0) && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {notificaciones.length}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrar && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              {notificaciones.length > 0 && (
                <button
                  onClick={limpiarNotificaciones}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Limpiar
                </button>
              )}
              <button
                onClick={() => setMostrar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay notificaciones nuevas</p>
              </div>
            ) : (
              <div className="divide-y">
                {notificaciones.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => irAPedido(notif.id)}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          Nuevo pedido: {notif.numero_pedido}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notif.cliente_nombre}
                        </p>
                        <p className="text-sm font-semibold text-blue-600">
                          S/ {notif.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.created_at).toLocaleString('es-PE')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-gray-50">
            <button
              onClick={() => {
                setMostrar(false);
                router.push('/dashboard/pedidos');
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos los pedidos
            </button>
          </div>
        </div>
      )}
    </>
  );
}
