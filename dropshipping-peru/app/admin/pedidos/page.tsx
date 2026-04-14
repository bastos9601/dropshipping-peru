'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatearPrecio } from '@/lib/utils';
import { Package, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPedidos(data);
    setCargando(false);
  };

  const totalVentas = pedidos
    .filter(p => p.estado !== 'cancelado')
    .reduce((sum, p) => sum + p.total, 0);

  if (cargando) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Todos los Pedidos</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm text-blue-600 font-medium">Total Pedidos</p>
          <p className="text-3xl font-bold text-blue-900">{pedidos.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <p className="text-sm text-green-600 font-medium">Total Ventas</p>
          <p className="text-2xl font-bold text-green-900">{formatearPrecio(totalVentas)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td className="px-6 py-4">{pedido.numero_pedido}</td>
                <td className="px-6 py-4">{pedido.cliente_nombre}</td>
                <td className="px-6 py-4">{formatearPrecio(pedido.total)}</td>
                <td className="px-6 py-4">{pedido.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
