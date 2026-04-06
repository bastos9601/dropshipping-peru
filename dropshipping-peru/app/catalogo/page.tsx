'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import TarjetaProducto from '@/componentes/TarjetaProducto';
import { Producto } from '@/lib/tipos';

export default function Catalogo() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosAgregados, setProductosAgregados] = useState<Set<string>>(new Set());
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    verificarUsuario();
  }, []);

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

    if (!perfil.activo) {
      await supabase.auth.signOut();
      alert('Tu cuenta ha sido desactivada. Contacta al administrador.');
      router.push('/login');
      return;
    }

    setUsuario(perfil);
    cargarProductos(user.id);
  };

  const cargarProductos = async (userId: string) => {
    const { data: todosProductos } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true);

    const { data: misProductos } = await supabase
      .from('tienda_productos')
      .select('producto_id')
      .eq('usuario_id', userId);

    if (todosProductos) {
      setProductos(todosProductos);
    }

    if (misProductos) {
      setProductosAgregados(new Set(misProductos.map(p => p.producto_id)));
    }
  };

  const agregarProducto = async (productoId: string) => {
    if (!usuario) return;

    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const precioVenta = producto.precio_base * 1.3;

    const { error } = await supabase
      .from('tienda_productos')
      .insert([
        {
          usuario_id: usuario.id,
          producto_id: productoId,
          precio_venta: precioVenta,
          activo: true
        }
      ]);

    if (!error) {
      setProductosAgregados(new Set([...productosAgregados, productoId]));
      setMensaje('¡Producto agregado a tu tienda!');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catálogo de productos
          </h1>
          <p className="text-gray-600">
            Selecciona los productos que quieres vender en tu tienda
          </p>
        </div>

        {mensaje && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
            {mensaje}
          </div>
        )}

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              agregado={productosAgregados.has(producto.id)}
              onAgregar={agregarProducto}
            />
          ))}
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay productos disponibles en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
