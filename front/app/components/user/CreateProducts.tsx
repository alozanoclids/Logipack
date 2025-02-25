import React, { useState, useEffect } from 'react';
import { getProduct, getProductId, createProduct, updateProduct, deleteProduct } from "../../services/userDash/productServices";
import Table from "../table/Table";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import { motion, AnimatePresence } from "framer-motion";

// Definición de la interfaz para un producto
interface Product {
  id: number;
  name: string;
}

function Products() {
  // Estado para almacenar la lista de productos
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para controlar la visibilidad del modal
  const [showModal, setShowModal] = useState(false);
  // Estado para manejar el nombre del producto en el formulario
  const [name, setName] = useState('');
  // Estado para manejar errores en el formulario
  const [error, setError] = useState('');
  // Estado para manejar el producto en edición
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Definición de las columnas de la tabla
  const columnLabels: { [key: string]: string } = {
    name: "Nombre",
  };
  const columns = ["name"];

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para obtener la lista de productos desde la API
  const fetchProducts = async () => {
    try {
      const data = await getProduct();
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener los productos:', err);
    }
  };

  // Abrir modal para crear un producto
  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setError('');
    setShowModal(true);
  };

  // Abrir modal para editar un producto existente
  const openEditModal = async (productId: number) => {
    try {
      const productData = await getProductId(productId);
      if (productData) {
        setEditingProduct(productData);
        setName(productData.name);
        setError('');
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      setError("No se pudo obtener el producto.");
    }
  };

  // Manejar el envío del formulario de creación o edición
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) {
      setError('El nombre es requerido');
      return;
    }
    try {
      if (editingProduct) {
        // Si hay un producto en edición, actualizamos
        await updateProduct(editingProduct.id, { name });
        setProducts(prev =>
          prev.map(p => (p.id === editingProduct.id ? { ...p, name } : p))
        );
        showSuccess("Producto actualizado correctamente"); // Notificación de éxito
      } else {
        // Si no hay producto en edición, creamos uno nuevo
        const newProduct: Product = await createProduct({ name });
        setProducts(prev => [...prev, newProduct]);
        showSuccess("Producto creado exitosamente");
      }
      setShowModal(false);
      setName('');
      setError('');
      setEditingProduct(null);
    } catch (err) {
      setError('Error al guardar el producto');
      console.error(err);
      showError("Ocurrió un error al guardar el producto");
    }
  };

  // Manejar la eliminación de un producto
  const handleDelete = async (id: number) => {
    try {
      showConfirm("¿Estás seguro de eliminar este producto?", async () => {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        showSuccess("Producto eliminado correctamente");
      });
    } catch (err) {
      console.error("Error al eliminar el producto", err);
      showError("No se pudo eliminar el producto");
    }
  };


  return (
    <div>
      <div className="mb-4">
        <motion.button
          onClick={openCreateModal}
          className="px-6 py-3 bg--green-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Crear Producto
        </motion.button>
      </div>

      {/* Modal para crear o editar producto */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl w-80"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-black mb-4">
                {editingProduct ? "Editar Producto" : "Crear Producto"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-1">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-black px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-end space-x-2">
                  <motion.button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingProduct ? "Actualizar" : "Crear"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla de productos */}
      <Table
        columns={columns}
        rows={products}
        columnLabels={columnLabels}
        onDelete={handleDelete}
        onEdit={openEditModal}
      />
    </div>
  );
}

export default Products;
