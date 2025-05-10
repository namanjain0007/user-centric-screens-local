
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  articleNumber: string;
  sales: number;
  image?: string;
}

interface TopSellingProductsProps {
  products: Product[];
}

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
        <a href="#" className="text-sm font-medium text-primary hover:underline">
          Show All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 bg-gray-300 rounded" />
                  )}
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Art. {product.articleNumber}</p>
                </div>
              </div>
              <div className="text-right font-semibold">{product.sales}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
