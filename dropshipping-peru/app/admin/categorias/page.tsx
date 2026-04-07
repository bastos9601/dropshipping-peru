'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import IconoCategoria, { iconosMap } from '@/componentes/IconoCategoria';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  activo: boolean;
  orden: number;
  usuario_id: string | null;
  usuarios?: {
    email: string;
    nombre_tienda: string;
  };
}

const iconosDisponibles = Object.keys(iconosMap);

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    const { data } = await supabase
      .from('categorias')
      .select(`
        *,
        usuario:usuarios(email, nombre_tienda)
      `)
      .order('orden', { ascending: true });

    if (data) {
      setCategorias(data);
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
        .insert([formData]);

      if (error) {
        alert('Error al crear: ' + error.message);
        return;
      }
    }

    setEditando(null);
    setNuevaCategoria(false);
    setFormData({ nombre: '', descripcion: '', icono: 'Package', activo: true, orden: 0 });
    cargarCategorias();
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

    cargarCategorias();
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
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
        <button
          onClick={() => setNuevaCategoria(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Formulario de nueva categoría */}
      {(nuevaCategoria || editando) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-2 border-blue-500">
          <h2 className="text-xl font-bold mb-4">
            {editando ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
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
                placeholder="Ej: Electrónica"
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Vista de tabla para desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Icono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {categoria.orden}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">
                    <IconoCategoria icono={categoria.icono} className="h-6 w-6 text-gray-900" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {categoria.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {categoria.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categoria.usuario_id ? (
                      <div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Usuario
                        </span>
                        {categoria.usuario && (
                          <div className="text-xs text-gray-500 mt-1">
                            {categoria.usuario.nombre_tienda}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Global
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      categoria.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {categoria.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editarCategoria(categoria)}
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => eliminarCategoria(categoria.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas para móvil */}
        <div className="md:hidden divide-y divide-gray-200">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <IconoCategoria icono={categoria.icono} className="h-8 w-8 text-gray-900" />
                  <div>
                    <h3 className="font-bold text-gray-900">{categoria.nombre}</h3>
                    <p className="text-xs text-gray-500">Orden: {categoria.orden}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {categoria.usuario_id ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Usuario
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Global
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    categoria.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {categoria.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              {categoria.descripcion && (
                <p className="text-sm text-gray-600 mb-3">{categoria.descripcion}</p>
              )}
              
              {categoria.usuario && (
                <p className="text-xs text-gray-500 mb-3">
                  Tienda: {categoria.usuario.nombre_tienda}
                </p>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => editarCategoria(categoria)}
                  className="flex-1 p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Editar</span>
                </button>
                <button
                  onClick={() => eliminarCategoria(categoria.id)}
                  className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
