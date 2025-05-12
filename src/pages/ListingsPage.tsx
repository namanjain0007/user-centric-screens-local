import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ListingFormModal, ListingFormValues } from "@/components/listings/ListingFormModal";
import { SearchAndFilterBar, FilterValues } from "@/components/listings/SearchAndFilterBar";
import { ListingsTable } from "@/components/listings/ListingsTable";
import { ListingsPagination } from "@/components/listings/ListingsPagination";
import { getListings, addListing, updateListing, deleteListing, AuthError } from "@/services/listingsService";
import { Listing, mapApiListingToFormData } from "@/types/listing";
import { useToast } from "@/hooks/use-toast";

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch listings on component mount
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const data = await getListings();
      setListings(data);
      setFilteredListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);

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
          description: error.message || "Failed to fetch listings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch listings",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get unique categories and locations for filters
  const categories = Array.from(new Set(listings.map(item => item.category)));
  const locations = Array.from(new Set(listings.map(item => item.location)));

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterListings(e.target.value, {}, sortOption);
  };

  // Handle sort
  const handleSort = (option: string) => {
    setSortOption(option);
    const sortedListings = [...filteredListings];

    switch (option) {
      case "price-asc":
        sortedListings.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedListings.sort((a, b) => b.price - a.price);
        break;
      case "date-desc":
        sortedListings.sort((a, b) => {
          const dateA = new Date(b.available_from).getTime();
          const dateB = new Date(a.available_from).getTime();
          return dateA - dateB;
        });
        break;
      case "available-soon":
        sortedListings.sort((a, b) => {
          const dateA = new Date(a.available_from).getTime();
          const dateB = new Date(b.available_from).getTime();
          return dateA - dateB;
        });
        break;
      default:
        break;
    }

    setFilteredListings(sortedListings);
  };

  // Handle filters
  const onFilterSubmit = (data: FilterValues) => {
    filterListings(searchQuery, data, sortOption);
  };

  const filterListings = (query: string, filters: FilterValues, sort: string) => {
    let filtered = listings.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    // Apply category filter
    if (filters.category && filters.category !== "all-categories") {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply location filter
    if (filters.location && filters.location !== "all-locations") {
      filtered = filtered.filter(item => item.location === filters.location);
    }

    // Apply owner_id filter
    if (filters.owner_id) {
      const ownerId = parseInt(filters.owner_id);
      if (!isNaN(ownerId)) {
        filtered = filtered.filter(item => item.owner_id === ownerId);
      }
    }

    // Apply date range filter
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      filtered = filtered.filter(item => {
        const { from, to } = filters.dateRange || {};
        const itemAvailableFrom = new Date(item.available_from);
        const itemAvailableUntil = new Date(item.available_until);

        if (from && to) {
          return itemAvailableFrom >= from && itemAvailableUntil <= to;
        } else if (from) {
          return itemAvailableFrom >= from;
        } else if (to) {
          return itemAvailableUntil <= to;
        }
        return true;
      });
    }

    // Apply sort
    if (sort) {
      setSortOption(sort);
      switch (sort) {
        case "price-asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "date-desc":
          filtered.sort((a, b) => {
            const dateA = new Date(b.available_from).getTime();
            const dateB = new Date(a.available_from).getTime();
            return dateA - dateB;
          });
          break;
        case "available-soon":
          filtered.sort((a, b) => {
            const dateA = new Date(a.available_from).getTime();
            const dateB = new Date(b.available_from).getTime();
            return dateA - dateB;
          });
          break;
      }
    }

    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await deleteListing(id);
      const updatedListings = listings.filter(item => item.listing_id !== id);
      setListings(updatedListings);
      setFilteredListings(filteredListings.filter(item => item.listing_id !== id));
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting listing:", error);

      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete listing",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete listing",
          variant: "destructive",
        });
      }
    }
  };

  // Handle adding a new listing
  const handleAddListing = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  // Handle editing a listing
  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  // Handle form submission (both add and edit)
  const handleSubmitForm = async (data: ListingFormValues) => {
    try {
      if (editingListing) {
        // Update existing listing - always use the original owner_id
        const updatedListing = await updateListing(
          editingListing.owner_id, // Always use the original owner_id when updating
          editingListing.listing_id,
          {
            title: data.title,
            description: data.description,
            category: data.category,
            location: data.location,
            price: data.price,
            availableFrom: data.availableFrom,
            availableUntil: data.availableUntil,
          }
        );

        // Update listings in state
        const updatedListings = listings.map(item =>
          item.listing_id === editingListing.listing_id
            ? updatedListing
            : item
        );
        setListings(updatedListings);
        setFilteredListings(filteredListings.map(item =>
          item.listing_id === editingListing.listing_id
            ? updatedListing
            : item
        ));

        toast({
          title: "Success",
          description: "Listing updated successfully",
        });
      } else {
        // Add new listing
        const newListing = await addListing({
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          price: data.price,
          availableFrom: data.availableFrom,
          availableUntil: data.availableUntil,
          owner_id: data.owner_id,
        });

        setListings([...listings, newListing]);
        setFilteredListings([...filteredListings, newListing]);

        toast({
          title: "Success",
          description: "Listing added successfully",
        });
      }
      setIsModalOpen(false);
      setEditingListing(null);
    } catch (error) {
      console.error("Error saving listing:", error);

      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to save listing",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save listing",
          variant: "destructive",
        });
      }
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  // Convert API listing to form values for editing
  const getInitialFormValues = () => {
    if (!editingListing) return undefined;

    return mapApiListingToFormData(editingListing);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <SearchAndFilterBar
            categories={categories}
            locations={locations}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            onFilterSubmit={onFilterSubmit}
            onSortChange={handleSort}
            sortOption={sortOption}
            onAddListing={handleAddListing}
          />

          <ListingsTable
            listings={currentItems}
            onEdit={handleEditListing}
            onDelete={handleDelete}
            isLoading={isLoading}
          />

          {filteredListings.length > 0 && !isLoading && (
            <ListingsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredListings.length}
              itemsPerPage={itemsPerPage}
              currentPageItemsStart={indexOfFirstItem + 1}
              currentPageItemsEnd={Math.min(indexOfLastItem, filteredListings.length)}
            />
          )}
        </CardContent>
      </Card>

      {/* Listing Form Modal */}
      <ListingFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmitForm}
        initialValues={getInitialFormValues()}
        isEditing={!!editingListing}
      />
    </div>
  );
}