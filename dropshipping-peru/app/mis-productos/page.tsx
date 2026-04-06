'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import Image from 'next/image';

export default function MisProductos() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_base: '',
    imagen_url: '',
    categoria: ''
  });
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

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

    if (!perfil || !perfil.activo) {
      await supabase.auth.signOut();
      router.push('/login');
      return;
    }

    setUsuario(perfil);
    cargarProductos(user.id);
  };

  const cargarProductos = async (userId: string) => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('usuario_id', userId)
      .eq('es_catalogo', false)
      .order('created_at', { ascending: false });

    if (data) {
      setProductos(data);
    }
  };

  const abrirFormulario = (producto?: any) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio_base: producto.precio_base.toString(),
        imagen_url: producto.imagen_url || '',
        categoria: producto.categoria || ''
      });
    } else {
      setProductoEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio_base: '',
        imagen_url: '',
        categoria: ''
      });
    }
    setArchivoImagen(null);
    setMostrarFormulario(true);
  };

  const manejarArchivoImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      setArchivoImagen(archivo);
      setFormData({ ...formData, imagen_url: '' });
    }
  };

  const subirImagen = async (): Promise<string | null> => {
    if (!archivoImagen) return formData.imagen_url || null;

    setSubiendoImagen(true);
    try {
      const extension = archivoImagen.name.split('.').pop();
      const nombreArchivo = `${usuario.id}/${Date.now()}.${extension}`;

      const { data, error } = await supabase.storage
        .from('productos')
        .upload(nombreArchivo, archivoImagen);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(nombreArchivo);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al subir la imagen');
      return null;
    } finally {
      setSubiendoImagen(false);
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Subir imagen si hay un archivo seleccionado
    const imagenUrl = await subirImagen();
    
    const datos = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio_base: parseFloat(formData.precio_base),
      imagen_url: imagenUrl || formData.imagen_url,
      categoria: formData.categoria,
      activo: true,
      es_catalogo: false,
      usuario_id: usuario.id
    };

    if (productoEditando) {
      await supabase
        .from('productos')
        .update(datos)
        .eq('id', productoEditando.id);
    } else {
      const { data: nuevoProducto } = await supabase
        .from('productos')
        .insert([datos])
        .select()
        .single();

      // Agregar automáticamente a la tienda del usuario
      if (nuevoProducto) {
        await supabase
          .from('tienda_productos')
          .insert([{
            usuario_id: usuario.id,
            producto_id: nuevoProducto.id,
            precio_venta: parseFloat(formData.precio_base),
            activo: true
          }]);
      }
    }

    setMostrarFormulario(false);
    cargarProductos(usuario.id);
  };

  const toggleActivo = async (producto: any) => {
    await supabase
      .from('productos')
      .update({ activo: !producto.activo })
      .eq('id', producto.id);
    cargarProductos(usuario.id);
  };

  const eliminarProducto = async (producto: any) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await supabase
        .from('productos')
        .delete()
        .eq('id', producto.id);
      cargarProductos(usuario.id);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Productos Personalizados</h1>
          <p className="text-gray-600">Crea y gestiona tus propios productos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Productos</h2>
            <button
              onClick={() => abrirFormulario()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          {mostrarFormulario && (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <form onSubmit={guardarProducto} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precio_base}
                      onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Describe tu producto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Opción 1: Subir archivo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={manejarArchivoImagen}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                      {archivoImagen && (
                        <p className="text-xs text-green-600 mt-1">
                          Archivo seleccionado: {archivoImagen.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-xs text-gray-500">O</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Opción 2: URL de imagen</label>
                      <input
                        type="url"
                        value={formData.imagen_url}
                        onChange={(e) => {
                          setFormData({ ...formData, imagen_url: e.target.value });
                          setArchivoImagen(null);
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        disabled={!!archivoImagen}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Electrónica, Ropa, etc."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={subiendoImagen}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {subiendoImagen ? 'Subiendo imagen...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {productos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Aún no tienes productos personalizados</p>
                <button
                  onClick={() => abrirFormulario()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Crear mi primer producto
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {productos.map((producto: any) => (
                  <div key={producto.id} className="border rounded-lg p-4">
                    {producto.imagen_url && (
                      <div className="relative h-40 mb-3">
                        <Image
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                    <p className="text-lg font-bold text-blue-600 mb-3">
                      {formatearPrecio(producto.precio_base)}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirFormulario(producto)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => toggleActivo(producto)}
                        className={`flex items-center justify-center px-3 py-2 rounded ${
                          producto.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {producto.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto)}
                        className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
