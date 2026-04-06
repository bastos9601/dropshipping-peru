'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Users, Package, TrendingUp, Store, 
  Plus, Edit, Trash2, Eye, EyeOff, Settings 
} from 'lucide-react';
import { formatearPrecio } from '@/lib/utils';
import Navbar from '@/componentes/Navbar';

export default function AdminPanel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'usuarios' | 'productos' | 'configuracion'>('dashboard');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    totalVentas: 0,
    gananciasTotal: 0
  });

  useEffect(() => {
    verificarAdmin();
  }, []);

  const verificarAdmin = async () => {
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

    if (!perfil?.es_admin) {
      router.push('/panel');
      return;
    }

    setUsuario(perfil);
    cargarDatos();
  };

  const cargarDatos = async () => {
    const [usuariosData, productosData, ventasData] = await Promise.all([
      supabase.from('usuarios').select('*').order('created_at', { ascending: false }),
      supabase.from('productos').select(`
        *,
        usuario:usuarios(email, nombre_tienda)
      `).order('created_at', { ascending: false }),
      supabase.from('ventas').select('*')
    ]);

    if (usuariosData.data) setUsuarios(usuariosData.data);
    if (productosData.data) setProductos(productosData.data);
    if (ventasData.data) {
      setVentas(ventasData.data);
      setEstadisticas({
        totalUsuarios: usuariosData.data?.length || 0,
        totalProductos: productosData.data?.length || 0,
        totalVentas: ventasData.data.length,
        gananciasTotal: ventasData.data.reduce((acc, v) => acc + Number(v.ganancia), 0)
      });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona todo el sistema desde aquí</p>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setVistaActual('dashboard')}
            className={`px-4 py-2 rounded-md ${
              vistaActual === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setVistaActual('usuarios')}
            className={`px-4 py-2 rounded-md ${
              vistaActual === 'usuarios'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setVistaActual('productos')}
            className={`px-4 py-2 rounded-md ${
              vistaActual === 'productos'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setVistaActual('configuracion')}
            className={`px-4 py-2 rounded-md ${
              vistaActual === 'configuracion'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Configuración
          </button>
        </div>

        {vistaActual === 'dashboard' && (
          <DashboardView estadisticas={estadisticas} />
        )}

        {vistaActual === 'usuarios' && (
          <UsuariosView usuarios={usuarios} onRecargar={cargarDatos} />
        )}

        {vistaActual === 'productos' && (
          <ProductosView productos={productos} onRecargar={cargarDatos} />
        )}

        {vistaActual === 'configuracion' && (
          <ConfiguracionView />
        )}
      </div>
    </div>
  );
}

function DashboardView({ estadisticas }: any) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Total Usuarios</h3>
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{estadisticas.totalUsuarios}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Total Productos</h3>
          <Package className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{estadisticas.totalProductos}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Total Ventas</h3>
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">{estadisticas.totalVentas}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Ganancias Total</h3>
          <Store className="h-5 w-5 text-yellow-600" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatearPrecio(estadisticas.gananciasTotal)}
        </p>
      </div>
    </div>
  );
}

function UsuariosView({ usuarios, onRecargar }: any) {
  const [editando, setEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre_tienda: '',
    whatsapp: '',
    es_admin: false
  });

  const abrirEdicion = (usuario: any) => {
    setEditando(usuario);
    setFormData({
      nombre_tienda: usuario.nombre_tienda,
      whatsapp: usuario.whatsapp,
      es_admin: usuario.es_admin
    });
  };

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await supabase
      .from('usuarios')
      .update({
        nombre_tienda: formData.nombre_tienda,
        whatsapp: formData.whatsapp,
        es_admin: formData.es_admin
      })
      .eq('id', editando.id);

    setEditando(null);
    onRecargar();
  };

  const toggleActivo = async (usuario: any) => {
    await supabase
      .from('usuarios')
      .update({ activo: !usuario.activo })
      .eq('id', usuario.id);
    onRecargar();
  };

  const eliminarUsuario = async (usuario: any) => {
    if (usuario.es_admin) {
      alert('No puedes eliminar un usuario administrador');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.email}?`)) {
      await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuario.id);
      onRecargar();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h2>
      </div>

      {editando && (
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
          <form onSubmit={guardarUsuario} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Tienda</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_tienda}
                  onChange={(e) => setFormData({ ...formData, nombre_tienda: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="es_admin"
                checked={formData.es_admin}
                onChange={(e) => setFormData({ ...formData, es_admin: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="es_admin" className="text-sm font-medium text-gray-700">
                Es Administrador
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tienda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((user: any) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.nombre_tienda}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.whatsapp}</td>
                <td className="px-6 py-4 text-sm">
                  {user.es_admin ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Admin</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Usuario</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.activo ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Activo</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inactivo</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => abrirEdicion(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleActivo(user)}
                      className={user.activo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                      title={user.activo ? 'Desactivar' : 'Activar'}
                    >
                      {user.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {!user.es_admin && (
                      <button
                        onClick={() => eliminarUsuario(user)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductosView({ productos, onRecargar }: any) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_base: '',
    imagen_url: '',
    categoria: ''
  });

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
      const nombreArchivo = `admin/${Date.now()}.${extension}`;

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
    
    const imagenUrl = await subirImagen();
    
    const datos = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio_base: parseFloat(formData.precio_base),
      imagen_url: imagenUrl || formData.imagen_url,
      categoria: formData.categoria,
      activo: true,
      es_catalogo: true
    };

    if (productoEditando) {
      await supabase
        .from('productos')
        .update(datos)
        .eq('id', productoEditando.id);
    } else {
      await supabase
        .from('productos')
        .insert([datos]);
    }

    setMostrarFormulario(false);
    onRecargar();
  };

  const toggleActivo = async (producto: any) => {
    await supabase
      .from('productos')
      .update({ activo: !producto.activo })
      .eq('id', producto.id);
    onRecargar();
  };

  const eliminarProducto = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await supabase
        .from('productos')
        .delete()
        .eq('id', id);
      onRecargar();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Productos</h2>
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precio_base}
                  onChange={(e) => setFormData({ ...formData, precio_base: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
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

      <div className="grid md:grid-cols-3 gap-6 p-6">
        {productos.map((producto: any) => (
          <div key={producto.id} className="border rounded-lg p-4">
            {producto.imagen_url && (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
            <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
            <p className="text-lg font-bold text-blue-600 mb-2">
              {formatearPrecio(producto.precio_base)}
            </p>
            {producto.usuario && (
              <div className="mb-3 p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Creado por:</p>
                <p className="text-sm font-medium text-gray-700">{producto.usuario.nombre_tienda}</p>
                <p className="text-xs text-gray-500">{producto.usuario.email}</p>
              </div>
            )}
            {!producto.es_catalogo && (
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mb-2">
                Producto personalizado
              </span>
            )}
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
                onClick={() => eliminarProducto(producto.id)}
                className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function ConfiguracionView() {
  const [configuracion, setConfiguracion] = useState<any>({});
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre_sistema: '',
    descripcion_sistema: '',
    email_contacto: '',
    whatsapp_admin: ''
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    const { data } = await supabase
      .from('configuracion')
      .select('*');

    if (data) {
      const config: any = {};
      data.forEach((item: any) => {
        config[item.clave] = item.valor;
      });
      setConfiguracion(config);
      setFormData({
        nombre_sistema: config.nombre_sistema || '',
        descripcion_sistema: config.descripcion_sistema || '',
        email_contacto: config.email_contacto || '',
        whatsapp_admin: config.whatsapp_admin || ''
      });
    }
  };

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();

    const actualizaciones = [
      { clave: 'nombre_sistema', valor: formData.nombre_sistema },
      { clave: 'descripcion_sistema', valor: formData.descripcion_sistema },
      { clave: 'email_contacto', valor: formData.email_contacto },
      { clave: 'whatsapp_admin', valor: formData.whatsapp_admin }
    ];

    for (const item of actualizaciones) {
      await supabase
        .from('configuracion')
        .update({ valor: item.valor, updated_at: new Date().toISOString() })
        .eq('clave', item.clave);
    }

    setEditando(false);
    cargarConfiguracion();
    alert('Configuración actualizada correctamente');
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Configuración del Sistema</h2>
          <p className="text-sm text-gray-600 mt-1">Personaliza el nombre y ajustes globales</p>
        </div>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Settings className="h-4 w-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      <div className="p-6">
        {editando ? (
          <form onSubmit={guardarConfiguracion} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Sistema
              </label>
              <input
                type="text"
                required
                value={formData.nombre_sistema}
                onChange={(e) => setFormData({ ...formData, nombre_sistema: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="DropShip Perú"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este nombre aparecerá en el navbar y en toda la plataforma
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Sistema
              </label>
              <textarea
                value={formData.descripcion_sistema}
                onChange={(e) => setFormData({ ...formData, descripcion_sistema: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Plataforma de dropshipping para emprendedores"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                value={formData.email_contacto}
                onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="contacto@dropshipperu.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp del Administrador
              </label>
              <input
                type="tel"
                value={formData.whatsapp_admin}
                onChange={(e) => setFormData({ ...formData, whatsapp_admin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="+51987654321"
              />
              <p className="text-xs text-gray-500 mt-1">
                Los usuarios desactivados podrán contactarte por este número
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre del Sistema</h3>
              <p className="text-lg font-semibold text-gray-900">{configuracion.nombre_sistema}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
              <p className="text-gray-900">{configuracion.descripcion_sistema}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email de Contacto</h3>
              <p className="text-gray-900">{configuracion.email_contacto}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">WhatsApp del Administrador</h3>
              <p className="text-gray-900">{configuracion.whatsapp_admin}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
