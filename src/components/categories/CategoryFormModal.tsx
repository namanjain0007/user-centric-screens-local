import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const singleFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
});

const bulkFormSchema = z.object({
  categories: z.string().min(1, "Categories are required"),
});

type SingleFormValues = z.infer<typeof singleFormSchema>;
type BulkFormValues = z.infer<typeof bulkFormSchema>;

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<boolean | void>;
  onBulkSubmit?: (names: string[]) => Promise<boolean | void>;
  initialValue?: string;
  mode: "add" | "edit";
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "brand-purple";
}

export function CategoryFormModal({
  open,
  onOpenChange,
  onSubmit,
  onBulkSubmit,
  initialValue = "",
  mode = "add",
  buttonVariant = "default",
}: CategoryFormModalProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  const singleForm = useForm<SingleFormValues>({
    resolver: zodResolver(singleFormSchema),
    defaultValues: {
      name: initialValue,
    },
  });

  const bulkForm = useForm<BulkFormValues>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      categories: "",
    },
  });

  const handleSingleSubmit = async (values: SingleFormValues) => {
    try {
      const result = await onSubmit(values.name);
      if (result !== false) {
        toast.success(`Category ${mode === "add" ? "added" : "updated"} successfully`);
        singleForm.reset();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error(`Failed to ${mode} category`);
    }
  };

  const handleBulkSubmit = async (values: BulkFormValues) => {
    try {
      const categories = values.categories
        .split(/[,\n]/)
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);

      if (categories.length === 0) {
        toast.error("No valid categories found");
        return;
      }

      if (onBulkSubmit) {
        await onBulkSubmit(categories);
        toast.success(`${categories.length} categories added successfully`);
        bulkForm.reset();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to add categories");
    }
  };

  React.useEffect(() => {
    if (open && initialValue) {
      singleForm.setValue("name", initialValue);
    } else if (!open) {
      singleForm.reset();
      bulkForm.reset();
      setActiveTab("single");
    }
  }, [open, initialValue, singleForm, bulkForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add new categories to your store."
              : "Edit the category name."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Add</TabsTrigger>
            <TabsTrigger value="bulk" disabled={mode === "edit"}>Bulk Add</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(handleSingleSubmit)} className="space-y-4">
                <FormField
                  control={singleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant={buttonVariant}>
                    {mode === "add" ? "Add Category" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="bulk">
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(handleBulkSubmit)} className="space-y-4">
                <FormField
                  control={bulkForm.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter categories separated by commas or new lines&#10;Example:&#10;Electronics&#10;Books, Fashion&#10;Home & Kitchen"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant={buttonVariant}>
                    Add Categories
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
