
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ListingFormModal, ListingFormValues } from "@/components/listings/ListingFormModal";
import { SearchAndFilterBar, FilterValues } from "@/components/listings/SearchAndFilterBar";
import { ListingsTable, Listing } from "@/components/listings/ListingsTable";
import { ListingsPagination } from "@/components/listings/ListingsPagination";
import { mockListings } from "@/services/listingsService";

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Get unique categories and locations for filters
  const categories = Array.from(new Set(mockListings.map(item => item.category)));
  const locations = Array.from(new Set(mockListings.map(item => item.location)));

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterListings(e.target.value, {}, sortOption);
  };

  // Handle sort
  const handleSort = (option: string) => {
    setSortOption(option);
    let sortedListings = [...listings];
    
    switch (option) {
      case "price-asc":
        sortedListings.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedListings.sort((a, b) => b.price - a.price);
        break;
      case "date-desc":
        sortedListings.sort((a, b) => b.availableFrom.getTime() - a.availableFrom.getTime());
        break;
      case "available-soon":
        sortedListings.sort((a, b) => a.availableFrom.getTime() - b.availableFrom.getTime());
        break;
      default:
        break;
    }
    
    setListings(sortedListings);
  };

  // Handle filters
  const onFilterSubmit = (data: FilterValues) => {
    filterListings(searchQuery, data, sortOption);
  };

  const filterListings = (query: string, filters: FilterValues, sort: string) => {
    let filtered = mockListings.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }

    // Apply date range filter
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      filtered = filtered.filter(item => {
        const { from, to } = filters.dateRange || {};
        
        if (from && to) {
          return item.availableFrom >= from && item.availableUntil <= to;
        } else if (from) {
          return item.availableFrom >= from;
        } else if (to) {
          return item.availableUntil <= to;
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
          filtered.sort((a, b) => b.availableFrom.getTime() - a.availableFrom.getTime());
          break;
        case "available-soon":
          filtered.sort((a, b) => a.availableFrom.getTime() - b.availableFrom.getTime());
          break;
      }
    }

    setListings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle delete
  const handleDelete = (id: number) => {
    const updatedListings = listings.filter(item => item.id !== id);
    setListings(updatedListings);
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
  const handleSubmitForm = (data: ListingFormValues) => {
    if (editingListing) {
      // Update existing listing
      const updatedListings = listings.map(item => 
        item.id === editingListing.id 
          ? { ...item, ...data } 
          : item
      );
      setListings(updatedListings);
    } else {
      // Add new listing
      const newListing: Listing = {
        id: Math.max(...listings.map(item => item.id)) + 1,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        price: data.price,
        availableFrom: data.availableFrom,
        availableUntil: data.availableUntil,
        vendorEmail: "new@example.com", // Default vendor email
        status: "in-stock", // Default status
        image: data.image,
      };
      setListings([...listings, newListing]);
    }
    setIsModalOpen(false);
    setEditingListing(null);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = listings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(listings.length / itemsPerPage);

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
          />

          {listings.length > 0 && (
            <ListingsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={listings.length}
              itemsPerPage={itemsPerPage}
              currentPageItemsStart={indexOfFirstItem + 1}
              currentPageItemsEnd={Math.min(indexOfLastItem, listings.length)}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Listing Form Modal */}
      <ListingFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmitForm}
        initialValues={editingListing || undefined}
        isEditing={!!editingListing}
      />
    </div>
  );
}
