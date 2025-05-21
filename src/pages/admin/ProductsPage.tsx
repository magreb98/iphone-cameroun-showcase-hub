
import AdminLayout from "@/components/admin/AdminLayout";
import ProductManager from "@/components/admin/products/ProductManager";

const AdminProductsPage = () => {
  return (
    <AdminLayout title="Gestion des Produits">
      <ProductManager />
    </AdminLayout>
  );
};

export default AdminProductsPage;
