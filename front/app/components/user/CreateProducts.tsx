import React, { useState, useEffect } from "react";
import {
  getProduct,
  getProductId,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/userDash/productServices";
import Table from "../table/Table";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../buttons/buttons"
// Definición de la interfaz para un producto
interface Product {
  id: number;
  name: string;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const columnLabels: { [key: string]: string } = {
    name: "Nombre",
  };
  const columns = ["name"];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Obtener la lista de productos
  const fetchProducts = async () => {
    try {
      const data = await getProduct();
      setProducts(data);
    } catch (err) {
      console.error("Error al obtener los productos:", err);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = async (productId: number) => {
    try {
      const productData = await getProductId(productId);
      if (productData) {
        setEditingProduct(productData);
        setName(productData.name);
        setError("");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      setError("No se pudo obtener el producto.");
    }
  };

  // Crear un producto
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) {
      setError("El nombre es requerido");
      return;
    }
    try {
      const newProduct = await createProduct({ name });

      if (!newProduct || !newProduct.id) {
        throw new Error("Error: Producto no creado correctamente");
      }

      setProducts((prev) => [...prev, newProduct]); // Actualiza la tabla con el nuevo producto
      await fetchProducts(); // Recargar la lista completa por seguridad
      showSuccess("Producto creado exitosamente");

      // Resetear estado
      setShowModal(false);
      setName("");
      setError("");
    } catch (err) {
      setError("Error al crear el producto");
      console.error(err);
      showError("Ocurrió un error al crear el producto");
    }
  };

  // Actualizar un producto
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !editingProduct) {
      setError("El nombre es requerido");
      return;
    }
    try {
      await updateProduct(editingProduct.id, { name });
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, name } : p))
      );
      showSuccess("Producto actualizado correctamente");

      // Resetear estado
      setShowModal(false);
      setName("");
      setError("");
      setEditingProduct(null);
    } catch (err) {
      setError("Error al actualizar el producto");
      console.error(err);
      showError("Ocurrió un error al actualizar el producto");
    }
  };

  // Eliminar un producto
  const handleDelete = async (id: number) => {
    try {
      showConfirm("¿Estás seguro de eliminar este producto?", async () => {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showSuccess("Producto eliminado correctamente");
      });
    } catch (err) {
      console.error("Error al eliminar el producto", err);
      showError("No se pudo eliminar el producto");
    }
  };


  return (
    <div>
      <div className="flex justify-center mb-2">
        <Button onClick={openCreateModal} variant="create" label="Crear Producto" />
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
              <h2 className="text-xl text-center font-semibold text-black mb-4">
                {editingProduct ? "Editar Producto" : "Crear Producto"}
              </h2>
              <form onSubmit={editingProduct ? handleUpdate : handleCreate}>
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
                <div className="flex justify-center gap-2 mt-2">
                  <Button onClick={() => setShowModal(false)} variant="cancel" />
                  <Button type="submit" variant="save" />
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
