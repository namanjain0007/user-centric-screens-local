import { useState, useEffect } from "react";
import { User } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trash2, Users as UsersIcon, UserPlus } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getUsers, createUser, deleteUser, AuthError } from "@/services/userService";

// Form schema for adding new user
const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  user_type: z.enum(["Owner", "Renter"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      user_type: "Renter",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);

      // Check if it's an authentication error
      if (error instanceof AuthError) {
        toast.error("Authentication error: Your session has expired or your token is invalid.");
      } else if (error instanceof Error) {
        toast.error(`Failed to fetch users: ${error.message}`);
      } else {
        toast.error("Failed to fetch users due to an unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users?.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete user
  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      // Store the ID to use after state updates
      const idToDelete = userToDelete;

      // Close the dialog immediately for better UX
      setIsDeleteDialogOpen(false);

      // Show a loading toast
      const loadingToast = toast.loading("Deleting user...");

      try {
        console.log("Deleting user with ID:", idToDelete);

        // Call the API to delete the user
        await deleteUser(idToDelete);

        // Update the UI after successful deletion
        setUsers(prevUsers => prevUsers.filter(user => user.id !== idToDelete));

        // Show success message
        toast.dismiss(loadingToast);
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);

        // Show error message
        toast.dismiss(loadingToast);

        // Check if it's an authentication error
        if (error instanceof AuthError) {
          toast.error("Authentication error: Your session has expired or your token is invalid.");
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to delete user due to an unknown error");
        }
      } finally {
        setUserToDelete(null);
      }
    }
  };

  // Handle add user
  const onSubmit = async (data: UserFormValues) => {
    // Check if user with the same email already exists
    const emailAlreadyExists = users.some(user =>
      user.email.toLowerCase() === data.email.toLowerCase()
    );

    // Update the state for UI feedback
    setEmailExists(emailAlreadyExists);

    if (emailAlreadyExists) {
      toast.error("A user with this email already exists");
      return;
    }

    // Show a loading toast
    const loadingToast = toast.loading("Adding user...");

    try {
      // Ensure all required fields are present and have the correct types
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        user_type: data.user_type as "Owner" | "Renter"
      };

      console.log("Creating user with data:", userData);

      // Create the user
      const newUser = await createUser(userData);
      console.log("New user created:", newUser);

      // Update the users state with the new user
      // Use the functional update form to ensure we're working with the latest state
      setUsers(prevUsers => [...prevUsers, newUser]);

      // Close the modal and reset the form
      setIsAddUserModalOpen(false);
      form.reset();

      // Show success message
      toast.dismiss(loadingToast);
      toast.success("User added successfully");

      // Refresh the user list to ensure we have the latest data
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      // Check if it's an authentication error
      if (error instanceof AuthError) {
        toast.error("Authentication error: Your session has expired or your token is invalid.");
      }
      // Check if the error message indicates a duplicate user
      else if (error instanceof Error) {
        if (error.message.includes("duplicate") || error.message.includes("already exists")) {
          toast.error("A user with this email already exists");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to add user due to an unknown error");
      }
    }
  };

  // Statistics
  const totalUsers = users?.length;
  const activeUsers = users?.length; // All users are considered active
  const newUsers = users?.filter(user => {
    if (!user.lastActive) return false;
    try {
      const userDate = new Date(user.lastActive);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate >= weekAgo;
    } catch (error) {
      return false;
    }
  }).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            variant="brand-purple"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStatCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={<UsersIcon className="h-full w-full text-current" />}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <DashboardStatCard
          title="New Users"
          value={newUsers.toString()}
          change={{ value: "Last 7 days", isPositive: true }}
          icon={<UsersIcon className="h-full w-full text-current" />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <DashboardStatCard
          title="Active Users"
          value={activeUsers.toString()}
          change={{ value: `${totalUsers > 0 ? Math.round((activeUsers/totalUsers)*100) : 0}% of total`, isPositive: true }}
          icon={<UsersIcon className="h-full w-full text-current" />}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name || ''} />
                      <AvatarFallback>
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || 'Unnamed User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email || 'No email'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Owner" ? "default" : "secondary"}>
                      {user.role || 'Renter'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(user.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Modal */}
      <Dialog
        open={isAddUserModalOpen}
        onOpenChange={(open) => {
          setIsAddUserModalOpen(open);
          if (!open) {
            setEmailExists(false);
            form.reset();
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account by filling in the details below.
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
                      <Input placeholder="Enter user's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => {
                  // Check if email already exists when value changes
                  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    field.onChange(value);

                    // Only check if there's a valid email
                    if (value && value.includes('@')) {
                      const exists = users.some(user =>
                        user.email.toLowerCase() === value.toLowerCase()
                      );
                      setEmailExists(exists);
                    } else {
                      setEmailExists(false);
                    }
                  };

                  return (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                          onChange={handleEmailChange}
                          className={emailExists ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </FormControl>
                      {emailExists && (
                        <p className="text-sm font-medium text-red-500">
                          This email is already in use
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Renter">Renter</SelectItem>
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
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand-purple"
                  disabled={emailExists}
                >
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
