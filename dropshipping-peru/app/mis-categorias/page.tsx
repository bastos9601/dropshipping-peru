'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import IconoCategoria, { iconosMap } from '@/componentes/IconoCategoria';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  activo: boolean;
  orden: number;
  usuario_id?: string;
}

const iconosDisponibles = Object.keys(iconosMap);

export default function MisCategorias() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasGlobales, setCategoriasGlobales] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: 'Package',
    activo: true,
    orden: 0
  });

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
    cargarCategorias(user.id);
  };

  const cargarCategorias = async (userId: string) => {
    // Cargar categorías del usuario
    const { data: misCategorias } = await supabase
      .from('categorias')
      .select('*')
      .eq('usuario_id', userId)
      .order('orden', { ascending: true });

    // Cargar categorías globales
    const { data: globales } = await supabase
      .from('categorias')
      .select('*')
      .is('usuario_id', null)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (misCategorias) {
      setCategorias(misCategorias);
    }

    if (globales) {
      setCategoriasGlobales(globales);
    }

    setCargando(false);
  };

  const guardarCategoria = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (editando) {
      const { error } = await supabase
        .from('categorias')
        .update(formData)
        .eq('id', editando);

      if (error) {
        alert('Error al actualizar: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('categorias')
        .insert([{
          ...formData,
          usuario_id: usuario.id
        }]);

      if (error) {
        alert('Error al crear: ' + error.message);
        return;
      }
    }

    setEditando(null);
    setNuevaCategoria(false);
    setFormData({ nombre: '', descripcion: '', icono: 'Package', activo: true, orden: 0 });
    cargarCategorias(usuario.id);
  };

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }

    cargarCategorias(usuario.id);
  };

  const editarCategoria = (categoria: Categoria) => {
    setEditando(categoria.id);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      icono: categoria.icono || 'Package',
      activo: categoria.activo,
      orden: categoria.orden
    });
  };

  const cancelar = () => {
    setEditando(null);
    setNuevaCategoria(false);
    setFormData({ nombre: '', descripcion: '', icono: 'Package', activo: true, orden: 0 });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img src="/favicon.png" alt="Logo" className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Categorías</h1>
          <p className="text-gray-600">
            Crea categorías personalizadas para organizar tus productos
          </p>
        </div>

        {/* Categorías Globales */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías del Sistema</h2>
          <p className="text-sm text-gray-600 mb-4">
            Estas son las categorías predefinidas que puedes usar en tus productos
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoriasGlobales.map((cat) => (
              <div key={cat.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-2">
                <IconoCategoria icono={cat.icono} className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">{cat.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mis Categorías Personalizadas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Mis Categorías Personalizadas</h2>
            <button
              onClick={() => setNuevaCategoria(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva Categoría</span>
            </button>
          </div>

          {/* Formulario */}
          {(nuevaCategoria || editando) && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-blue-500">
              <h3 className="text-lg font-bold mb-4">
                {editando ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Tecnología"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono
                  </label>
                  <select
                    value={formData.icono}
                    onChange={(e) => setFormData({ ...formData, icono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {iconosDisponibles.map((nombreIcono) => (
                      <option key={nombreIcono} value={nombreIcono}>
                        {nombreIcono}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                    <span>Vista previa:</span>
                    <IconoCategoria icono={formData.icono} className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Descripción de la categoría"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={guardarCategoria}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={cancelar}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de categorías */}
          {categorias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tienes categorías personalizadas aún</p>
              <p className="text-sm text-gray-400 mt-2">Crea una para organizar mejor tus productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <IconoCategoria icono={categoria.icono} className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">{categoria.nombre}</h3>
                        <p className="text-xs text-gray-500">{categoria.descripcion}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      categoria.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editarCategoria(categoria)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => eliminarCategoria(categoria.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
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
  );
}
