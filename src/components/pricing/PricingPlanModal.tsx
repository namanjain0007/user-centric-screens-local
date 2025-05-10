import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PricingPlan, durationToDays, formatDuration } from "@/types/pricingPlan";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PricingPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PricingPlan | null;
  onSubmit: (plan: {
    plan_id?: number;
    name: string;
    price: number;
    duration_in_days: number;
  }) => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "brand-purple";
}

export function PricingPlanModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  buttonVariant = "default"
}: PricingPlanModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [durationInDays, setDurationInDays] = useState<number>(initialData?.duration_in_days || 30);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || "");
      setPrice(initialData.price?.toString() || "");
      setDurationInDays(initialData.duration_in_days || 30);
    } else if (!open) {
      setName("");
      setPrice("");
      setDurationInDays(30);
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    const planData = {
      plan_id: initialData?.plan_id,
      name,
      price: parseFloat(price),
      duration_in_days: durationInDays,
    };
    onSubmit(planData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Pricing Plan</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basic Plan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <Select
              value={durationInDays.toString()}
              onValueChange={(value) => setDurationInDays(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Monthly (30 days)</SelectItem>
                <SelectItem value="90">Quarterly (90 days)</SelectItem>
                <SelectItem value="180">Six Month (180 days)</SelectItem>
                <SelectItem value="365">Yearly (365 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant={buttonVariant}
          >
            {initialData ? "Save Changes" : "Add Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
