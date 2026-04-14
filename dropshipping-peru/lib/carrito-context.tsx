'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string;
  cantidad: number;
  tienda_slug: string;
}

interface CarritoContextType {
  items: ProductoCarrito[];
  agregarAlCarrito: (producto: Omit<ProductoCarrito, 'cantidad'>) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  total: number;
  cantidadTotal: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductoCarrito[]>([]);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setItems(JSON.parse(carritoGuardado));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (producto: Omit<ProductoCarrito, 'cantidad'>) => {
    setItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === producto.id);
      
      if (itemExistente) {
        // Si ya existe, aumentar cantidad
        return prevItems.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si no existe, agregar nuevo
        return [...prevItems, { ...producto, cantidad: 1 }];
      }
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const cantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        total,
        cantidadTotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
}
