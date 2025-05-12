
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define the listing schema for form validation
const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  location: z.string().min(2, "Location is required"),
  category: z.string().min(1, "Category is required"),
  availableFrom: z.date({
    required_error: "Available from date is required",
  }),
  availableUntil: z.date({
    required_error: "Available until date is required",
  }),
  image: z.any().optional(),
  owner_id: z.number().optional(),
  listing_id: z.number().optional(),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

interface ListingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ListingFormValues) => void;
  initialValues?: Partial<ListingFormValues>;
  isEditing?: boolean;
  owners?: { id: number; name: string }[];
}

export function ListingFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  isEditing = false,
  owners = [],
}: ListingFormModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.image || null);

  // Categories from our mock data
  const categories = ["Plant", "Gadget", "Electronic", "Furniture", "Clothing", "Books", "Sports"];

  // Initialize the form with default values or editing values
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      price: initialValues?.price || 0,
      location: initialValues?.location || "",
      category: initialValues?.category || "",
      availableFrom: initialValues?.availableFrom || new Date(),
      availableUntil: initialValues?.availableUntil || new Date(),
      image: initialValues?.image || null,
      owner_id: initialValues?.owner_id || 1, // Default owner ID
      listing_id: initialValues?.listing_id,
    },
  });

  // Update form values and image preview when initialValues change
  useEffect(() => {
    if (open && initialValues) {
      // Reset the form with the new values
      form.reset(initialValues);

      // Set image preview if available
      setImagePreview(initialValues.image || null);
    }
  }, [open, initialValues, form]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission handler
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    toast.success(isEditing ? "Listing updated successfully" : "Listing added successfully");
    onOpenChange(false);
    form.reset();
    setImagePreview(null);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto" style={{ maxHeight: "90vh" }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your product listing"
              : "Enter the details of your new product listing"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-48 object-contain rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          form.setValue("image", null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
                    >
                      <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        Click to upload product image
                      </span>
                    </Label>
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Product title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        {...field}
                      >
                        <option key="select-category" value="" disabled>Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Owner ID */}
              <FormField
                control={form.control}
                name="owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Owner ID"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        readOnly={isEditing}
                        className={isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
                      />
                    </FormControl>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Owner ID cannot be changed when editing a listing
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Available From Date */}
              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Available Until Date */}
              <FormField
                control={form.control}
                name="availableUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Until</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 sticky bottom-0 pt-4 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-purple hover:bg-brand-purple/90">
                {isEditing ? "Update Listing" : "Add Listing"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
