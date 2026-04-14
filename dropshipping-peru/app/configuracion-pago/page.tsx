'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/componentes/Navbar';
import { Upload, Image as ImageIcon, Check, X } from 'lucide-react';
import Image from 'next/image';

export default function ConfiguracionPagoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState('');

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

    if (perfil) {
      setUsuario(perfil);
      setQrUrl(perfil.yape_qr_url || '');
      setVistaPrevia(perfil.yape_qr_url || '');
    }

    setCargando(false);
  };

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar que sea una imagen
    if (!archivo.type.startsWith('image/')) {
      setMensaje('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje('La imagen no debe superar los 5MB');
      return;
    }

    setArchivoSeleccionado(archivo);
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setVistaPrevia(reader.result as string);
    };
    reader.readAsDataURL(archivo);
    
    setMensaje('');
  };

  const subirImagen = async () => {
    if (!archivoSeleccionado) {
      setMensaje('Por favor selecciona una imagen');
      return;
    }

    setSubiendo(true);
    setMensaje('');

    try {
      // Crear nombre único para el archivo
      const extension = archivoSeleccionado.name.split('.').pop();
      const nombreArchivo = `qr-yape-${usuario.id}-${Date.now()}.${extension}`;

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('qr-pagos')
        .upload(nombreArchivo, archivoSeleccionado, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('qr-pagos')
        .getPublicUrl(nombreArchivo);

      // Guardar URL en la base de datos
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ yape_qr_url: publicUrl })
        .eq('id', usuario.id);

      if (updateError) throw updateError;

      setQrUrl(publicUrl);
      setMensaje('¡QR subido y guardado exitosamente!');
      setArchivoSeleccionado(null);
      
      setTimeout(() => setMensaje(''), 3000);

    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      setMensaje('Error al subir la imagen: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const guardarURL = async () => {
    if (!qrUrl.trim()) {
      setMensaje('Por favor ingresa una URL válida');
      return;
    }

    setGuardando(true);
    setMensaje('');

    const { error } = await supabase
      .from('usuarios')
      .update({ yape_qr_url: qrUrl })
      .eq('id', usuario.id);

    if (error) {
      setMensaje('Error al guardar: ' + error.message);
    } else {
      setVistaPrevia(qrUrl);
      setMensaje('¡URL guardada exitosamente!');
      setTimeout(() => setMensaje(''), 3000);
    }

    setGuardando(false);
  };

  const eliminarQR = async () => {
    if (!confirm('¿Estás seguro de eliminar el QR de Yape?')) return;

    setGuardando(true);
    
    // Si la URL es de Supabase Storage, eliminar el archivo
    if (usuario.yape_qr_url?.includes('supabase')) {
      try {
        const nombreArchivo = usuario.yape_qr_url.split('/').pop();
        await supabase.storage
          .from('qr-pagos')
          .remove([nombreArchivo]);
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
      }
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ yape_qr_url: null })
      .eq('id', usuario.id);

    if (!error) {
      setQrUrl('');
      setVistaPrevia('');
      setArchivoSeleccionado(null);
      setMensaje('QR eliminado');
      setTimeout(() => setMensaje(''), 3000);
    }

    setGuardando(false);
  };

  if (cargando || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={usuario} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Pagos</h1>
          <p className="text-gray-600 mt-2">Configura tu QR de Yape/Plin para recibir pagos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Instrucciones */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📱 Cómo obtener tu QR de Yape/Plin:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Abre tu app de Yape o Plin</li>
                <li>Ve a "Mi QR" o "Recibir dinero"</li>
                <li>Toma una captura de pantalla de tu QR</li>
                <li>Sube la imagen usando el botón de abajo</li>
              </ol>
            </div>

            {/* Opción 1: Subir archivo */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Opción 1: Subir imagen desde tu computadora
              </h3>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarSeleccionArchivo}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
                
                {archivoSeleccionado && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {archivoSeleccionado.name}
                    </span>
                    <button
                      onClick={subirImagen}
                      disabled={subiendo}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{subiendo ? 'Subiendo...' : 'Subir'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            {/* Opción 2: URL */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Opción 2: Pegar URL de imagen
              </h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={qrUrl}
                  onChange={(e) => {
                    setQrUrl(e.target.value);
                    setVistaPrevia(e.target.value);
                  }}
                  placeholder="https://ejemplo.com/mi-qr-yape.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={guardarURL}
                  disabled={guardando || !qrUrl.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {guardando ? 'Guardando...' : 'Guardar URL'}
                </button>
              </div>
            </div>

            {/* Vista previa */}
            {vistaPrevia && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista previa
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-center">
                    <div className="relative w-64 h-64">
                      <Image
                        src={vistaPrevia}
                        alt="QR Preview"
                        fill
                        className="object-contain"
                        onError={() => setMensaje('Error al cargar la imagen. Verifica la URL.')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje */}
            {mensaje && (
              <div className={`p-4 rounded-lg ${
                mensaje.includes('Error') || mensaje.includes('error')
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}>
                {mensaje}
              </div>
            )}

            {/* Botón eliminar */}
            {usuario.yape_qr_url && (
              <button
                onClick={eliminarQR}
                disabled={guardando}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <X className="h-5 w-5" />
                <span>Eliminar QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Servicios recomendados */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🌐 Servicios alternativos para subir imágenes:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://imgur.com/upload"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <h4 className="font-semibold text-gray-900">Imgur</h4>
              <p className="text-sm text-gray-600">Gratis, sin registro</p>
            </a>
            <a
              href="https://imgbb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <h4 className="font-semibold text-gray-900">ImgBB</h4>
              <p className="text-sm text-gray-600">Gratis, fácil de usar</p>
            </a>
            <a
              href="https://postimages.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <h4 className="font-semibold text-gray-900">PostImages</h4>
              <p className="text-sm text-gray-600">Sin límites</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
