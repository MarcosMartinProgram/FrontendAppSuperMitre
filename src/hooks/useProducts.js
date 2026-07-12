import { useState, useCallback } from 'react';
import { productosAPI } from '../services/api';

export const useProducts = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productosAPI.getAll();
      setProductos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProducto = useCallback(async (producto) => {
    setLoading(true);
    setError(null);
    try {
      await productosAPI.create(producto);
      await fetchProductos();
    } catch (err) {
      setError(err.message || 'Error al agregar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProductos]);

  const updateProducto = useCallback(async (codigo, producto) => {
    setLoading(true);
    setError(null);
    try {
      await productosAPI.update(codigo, producto);
      await fetchProductos();
    } catch (err) {
      setError(err.message || 'Error al actualizar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProductos]);

  const deleteProducto = useCallback(async (codigo) => {
    setLoading(true);
    setError(null);
    try {
      await productosAPI.delete(codigo);
      await fetchProductos();
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProductos]);

  return { productos, loading, error, fetchProductos, addProducto, updateProducto, deleteProducto };
};
