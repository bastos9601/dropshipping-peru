import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState<any>({
    nombre_sistema: 'DropShip Perú',
    descripcion_sistema: 'Plataforma de dropshipping para emprendedores',
    email_contacto: 'contacto@dropshipperu.com'
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
    }
  };

  return configuracion;
}
