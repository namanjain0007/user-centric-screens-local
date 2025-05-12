import { PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Listing } from "@/types/listing";

interface ListingsTableProps {
  listings: Listing[];
  onEdit: (listing: Listing) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function ListingsTable({ listings, onEdit, onDelete, isLoading = false }: ListingsTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border">
        <div className="flex justify-center items-center p-8">
          <p>Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Owner ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No listings found.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => (
              <TableRow key={listing.listing_id}>
                <TableCell className="font-medium flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="truncate font-medium max-w-[260px]">{listing.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{listing.location}</div>
                  </div>
                </TableCell>
                <TableCell>${listing.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      listing.status === "in-stock"
                        ? "default"
                        : listing.status === "low-stock"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {listing.status === "in-stock"
                      ? "In Stock"
                      : listing.status === "low-stock"
                        ? "Low Stock"
                        : "Out of Stock"}
                  </Badge>
                </TableCell>
                <TableCell>{listing.category}</TableCell>
                <TableCell>{listing.owner_id}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => onEdit(listing)}
                    size="icon"
                    variant="ghost"
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <PenLine className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    onClick={() => onDelete(listing.listing_id)}
                    size="icon"
                    variant="ghost"
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
    </div>
  );
}