
import AdminLayout from "@/components/admin/AdminLayout";
import ProductManager from "@/components/admin/products/ProductManager";
import { useAuth } from "@/hooks/useAuth";

const AdminProductsPage = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <AdminLayout title="Gestion des Produits">
        <div className="flex justify-center items-center h-64">
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    );
  }
  
  // Si l'utilisateur n'est pas un admin ou un superadmin, afficher un message d'erreur
  if (!user?.isAdmin && !user?.isSuperAdmin) {
    return (
      <AdminLayout title="Accès refusé">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Vous n'avez pas accès à cette page.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des Produits">
      <ProductManager />
    </AdminLayout>
  );
};

export default AdminProductsPage;
