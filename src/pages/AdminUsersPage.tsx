import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PenLine, Trash2, UserPlus, Loader2, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Admin } from "@/types/admin";
import { getAdmins, addAdmin, updateAdmin, deleteAdmin, AuthError, getCurrentAdminInfo } from "@/services/adminService";

// Local interface to map API Admin type to UI needs
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Form schema
const adminFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  admin_user_type: z.enum(["super_admin", "sub_admin", "manager", "accountant"]),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current admin info from token
  const currentLoggedInAdmin = getCurrentAdminInfo();

  // Initialize the form
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      admin_user_type: "sub_admin",
    },
  });

  // Fetch admin users on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const adminData = await getAdmins();

        // Map API response to our UI model
        const mappedAdmins: AdminUser[] = adminData.map(admin => ({
          id: admin.admin_id,
          name: admin.name,
          email: admin.email,
          role: admin.admin_user_type
        }));

        setAdmins(mappedAdmins);
      } catch (error) {
        console.error('Error fetching admin users:', error);
        if (error instanceof AuthError) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('Failed to load admin users. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Filter admins based on search term and role filter
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle add admin modal
  const handleAddAdminClick = () => {
    form.reset();
    setIsAddModalOpen(true);
  };

  // Handle edit admin
  const handleEditAdmin = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    form.setValue("name", admin.name);
    form.setValue("email", admin.email);
    form.setValue("password", "");
    form.setValue("admin_user_type", admin.role);
    setIsEditModalOpen(true);
  };

  // Handle delete admin
  const handleDeleteAdmin = (adminId: number) => {
    // Prevent super_admin from deleting themselves
    if (currentLoggedInAdmin &&
        currentLoggedInAdmin.admin_id === adminId &&
        currentLoggedInAdmin.admin_user_type === 'super_admin') {
      toast.error("Super admin cannot delete themselves");
      return;
    }

    setAdminToDelete(adminId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (adminToDelete) {
      // Double-check to prevent super_admin from deleting themselves
      if (currentLoggedInAdmin &&
          currentLoggedInAdmin.admin_id === adminToDelete &&
          currentLoggedInAdmin.admin_user_type === 'super_admin') {
        toast.error("Super admin cannot delete themselves");
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
        return;
      }

      try {
        setIsSubmitting(true);
        await deleteAdmin(adminToDelete);
        setAdmins(admins.filter(admin => admin.id !== adminToDelete));
        toast.success("Admin user deleted successfully");
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Error deleting admin:', error);
        if (error instanceof AuthError) {
          toast.error('Authentication failed. Please log in again.');
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to delete admin user');
        }
      } finally {
        setIsSubmitting(false);
        setAdminToDelete(null);
      }
    }
  };

  // Form submit handler
  const onSubmit = async (data: AdminFormValues) => {
    try {
      setIsSubmitting(true);

      if (isEditModalOpen && currentAdmin) {
        // Update existing admin
        // Only include password if it was provided
        const updateData = {
          name: data.name,
          email: data.email,
          admin_user_type: data.admin_user_type,
          ...(data.password ? { password: data.password } : {})
        };

        const updatedAdmin = await updateAdmin(currentAdmin.id, updateData);

        // Update the local state
        setAdmins(admins.map(admin =>
          admin.id === currentAdmin.id
            ? {
                id: updatedAdmin.admin_id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                role: updatedAdmin.admin_user_type
              }
            : admin
        ));

        toast.success("Admin user updated successfully");
        setIsEditModalOpen(false);
      } else {
        // Add new admin
        const newAdminData = await addAdmin({
          name: data.name,
          email: data.email,
          password: data.password,
          admin_user_type: data.admin_user_type
        });

        const newAdmin: AdminUser = {
          id: newAdminData.admin_id,
          name: newAdminData.name,
          email: newAdminData.email,
          role: newAdminData.admin_user_type,
        };

        setAdmins([...admins, newAdmin]);
        toast.success("Admin user added successfully");
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      if (error instanceof AuthError) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save admin user');
      }
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin User</h1>
        <Button
          onClick={handleAddAdminClick}
          variant="brand-purple"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="sub_admin">Sub Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="accountant">Accountant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading admin users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No admin users found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    {admin.name}
                    {currentLoggedInAdmin &&
                     currentLoggedInAdmin.admin_id === admin.id &&
                     currentLoggedInAdmin.admin_user_type === 'super_admin' && (
                      <span className="ml-2 inline-flex items-center">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        <span className="ml-1 text-xs text-amber-500">(You)</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        admin.role === "super_admin" ? "destructive" :
                        admin.role === "sub_admin" ? "default" :
                        admin.role === "manager" ? "secondary" : "outline"
                      }
                    >
                      {admin.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditAdmin(admin)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      disabled={isSubmitting}
                    >
                      <PenLine className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={isSubmitting || (
                        currentLoggedInAdmin &&
                        currentLoggedInAdmin.admin_id === admin.id &&
                        currentLoggedInAdmin.admin_user_type === 'super_admin'
                      )}
                      title={
                        currentLoggedInAdmin &&
                        currentLoggedInAdmin.admin_id === admin.id &&
                        currentLoggedInAdmin.admin_user_type === 'super_admin'
                          ? "Super admin cannot delete themselves"
                          : "Delete admin"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Admin User</DialogTitle>
            <DialogDescription>
              Create a new admin user with appropriate permissions.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admin_user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin User Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sub_admin">Sub Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand-purple"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Admin"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
            <DialogDescription>
              Update the admin user details.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admin_user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin User Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sub_admin">Sub Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand-purple"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Admin"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm to delete this admin user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
