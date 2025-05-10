import { useState, useEffect } from "react";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { CategoriesTable } from "@/components/categories/CategoriesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Category } from "@/types/category";
import { useToast } from "@/hooks/use-toast";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  AuthError
} from "@/services/categoriesService";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);

      // Check if it's an authentication error
      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch categories",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = async (name: string) => {
    try {
      const newCategory = await addCategory(name);
      setCategories([...categories, newCategory]);
      return true;
    } catch (error) {
      console.error("Error adding category:", error);

      // Check for specific error messages
      if (error instanceof Error &&
          error.message.includes("already exists")) {
        toast({
          title: "Error",
          description: "A category with this name already exists",
          variant: "destructive",
        });
      } else if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add category",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add category",
          variant: "destructive",
        });
      }

      throw error;
    }
  };

  const handleBulkAddCategories = async (names: string[]) => {
    try {
      const newCategories = await Promise.all(
        names.map(name => addCategory(name).catch(error => {
          // Log individual errors but continue with other categories
          console.error(`Error adding category "${name}":`, error);
          throw error;
        }))
      );
      setCategories([...categories, ...newCategories]);
      toast({
        title: "Success",
        description: `Added ${names.length} categories successfully`,
      });
      return true;
    } catch (error) {
      console.error("Error adding categories:", error);

      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add categories",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add categories",
          variant: "destructive",
        });
      }

      throw error;
    }
  };

  const handleEditCategory = async (name: string) => {
    if (!categoryToEdit) return;

    try {
      const updated = await updateCategory(categoryToEdit.category_id, name);
      setCategories(
        categories.map((cat) => (cat.category_id === updated.category_id ? updated : cat))
      );
      return true;
    } catch (error) {
      console.error("Error updating category:", error);

      // Check for specific error messages
      if (error instanceof Error &&
          error.message.includes("already exists")) {
        toast({
          title: "Error",
          description: "A category with this name already exists",
          variant: "destructive",
        });
      } else if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update category",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update category",
          variant: "destructive",
        });
      }

      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((cat) => cat.category_id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);

      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete category",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const openEditModal = (category: Category) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="brand-purple"
          className="animate-fade-in"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoriesTable
        categories={categories}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <CategoryFormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddCategory}
        onBulkSubmit={handleBulkAddCategories}
        mode="add"
        buttonVariant="brand-purple"
      />

      {categoryToEdit && (
        <CategoryFormModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={handleEditCategory}
          initialValue={categoryToEdit.name}
          mode="edit"
          buttonVariant="brand-purple"
        />
      )}
    </div>
  );
}
