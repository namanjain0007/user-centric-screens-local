import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Popover as DatePopover,
  PopoverContent as DatePopoverContent,
  PopoverTrigger as DatePopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export interface FilterValues {
  category?: string;
  location?: string;
  owner_id?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

interface SearchAndFilterBarProps {
  categories: string[];
  locations: string[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterSubmit: (data: FilterValues) => void;
  onSortChange: (option: string) => void;
  sortOption: string;
  onAddListing: () => void;
}

const formSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  owner_id: z.string().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});

export function SearchAndFilterBar({
  categories,
  locations,
  searchQuery,
  onSearchChange,
  onFilterSubmit,
  onSortChange,
  sortOption,
  onAddListing
}: SearchAndFilterBarProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  const form = useForm<FilterValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "all-categories",
      location: "all-locations",
      owner_id: "",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  });

  const onSubmit = (data: FilterValues) => {
    onFilterSubmit(data);
    setFilterOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              className="pl-10"
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key="all-categories" value="all-categories">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key="all-locations" value="all-locations">All Locations</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="owner_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter owner ID"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date Range</FormLabel>
                        <DatePopover>
                          <DatePopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value?.from && !field.value?.to && "text-muted-foreground"
                                )}
                              >
                                {field.value?.from ? (
                                  field.value?.to ? (
                                    <>
                                      {format(field.value.from, "MMM dd, yyyy")} -{" "}
                                      {format(field.value.to, "MMM dd, yyyy")}
                                    </>
                                  ) : (
                                    format(field.value.from, "MMM dd, yyyy")
                                  )
                                ) : (
                                  "Select date range"
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </DatePopoverTrigger>
                          <DatePopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={{
                                from: field.value?.from,
                                to: field.value?.to,
                              }}
                              onSelect={(selected) => {
                                field.onChange({
                                  from: selected?.from,
                                  to: selected?.to,
                                });
                              }}
                              initialFocus
                              numberOfMonths={2}
                            />
                          </DatePopoverContent>
                        </DatePopover>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        onFilterSubmit({});
                      }}
                    >
                      Reset
                    </Button>
                    <Button type="submit">Apply Filters</Button>
                  </div>
                </form>
              </Form>
            </PopoverContent>
          </Popover>

          <Select value={sortOption} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="date-desc">Date: Newest First</SelectItem>
              <SelectItem value="available-soon">Available Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAddListing}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Listing
        </Button>
      </div>
    </div>
  );
}