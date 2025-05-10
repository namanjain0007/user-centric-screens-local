
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Image, Upload, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

// Form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Product title must be at least 3 characters",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters",
  }),
  category: z.string({
    required_error: "Please select a category",
  }),
  availableFrom: z.date({
    required_error: "Please select a start date",
  }),
  availableUntil: z.date({
    required_error: "Please select an end date",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  "Electronic",
  "Gadget",
  "Plant",
  "Clothing",
  "Furniture",
  "Book",
  "Toy",
  "Art",
];

export default function AddListingPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      location: "",
      category: "",
      availableFrom: undefined,
      availableUntil: undefined,
    },
  });
  
  const onSubmit = (data: FormValues) => {
    toast.success("Product listing created successfully!");
    console.log("Form submitted:", { ...data, images });
    setTimeout(() => {
      navigate("/listings");
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Add New Product Listing</CardTitle>
          <CardDescription>
            Complete the form below to add a new product to your inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-6">
                  <div className="flex flex-col space-y-4">
                    <h3 className="text-lg font-medium">General Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter product description" 
                              className="min-h-[120px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-4">
                    <h3 className="text-lg font-medium">Pricing</h3>
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Price ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5">$</span>
                              <Input type="number" step="0.01" className="pl-7" placeholder="0.00" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-4">
                    <h3 className="text-lg font-medium">Inventory</h3>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              <option value="" disabled>Select a category</option>
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
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-6">
                  <div className="flex flex-col space-y-4">
                    <h3 className="text-lg font-medium">Product Media</h3>
                    
                    <div className="border rounded-md p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {images.map((imgSrc, idx) => (
                          <div key={idx} className="aspect-square rounded-md overflow-hidden bg-muted relative">
                            <img 
                              src={imgSrc} 
                              alt={`Product image ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        <label 
                          htmlFor="product-images" 
                          className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                        >
                          <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-sm text-muted-foreground">Add Image</span>
                        </label>
                      </div>
                      
                      <div className="flex justify-center">
                        <label
                          htmlFor="product-images"
                          className="inline-flex items-center gap-2 cursor-pointer text-primary hover:text-primary/90"
                        >
                          <Upload size={16} />
                          <span className="text-sm font-medium">Upload Product Images</span>
                          <input
                            id="product-images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                      
                      <FormDescription className="text-center mt-2">
                        Upload up to 5 images in JPG, PNG or GIF format.
                      </FormDescription>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <h3 className="text-lg font-medium">Availability</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="availableFrom"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Available From</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "text-left font-normal",
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
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="availableUntil"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Available Until</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "text-left font-normal",
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
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => 
                                    date < new Date() || 
                                    (form.getValues().availableFrom && date < form.getValues().availableFrom)
                                  }
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-8 space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/listings")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  Create Listing
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
