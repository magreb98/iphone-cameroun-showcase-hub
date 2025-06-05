
import AdminLayout from "@/components/admin/AdminLayout";
import ProductManager from "@/components/admin/products/ProductManager";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

const AdminProductsPage = () => {
  return (
    <ProtectedRoute>
      <AdminLayout title="Gestion des Produits">
        <ProductManager />
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AdminProductsPage;
