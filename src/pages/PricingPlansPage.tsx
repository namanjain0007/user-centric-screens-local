
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingPlanTable } from "@/components/pricing/PricingPlanTable";
import { PricingPlanModal } from "@/components/pricing/PricingPlanModal";
import { PricingPlan } from "@/types/pricingPlan";
import { useToast } from "@/hooks/use-toast";
import {
  getPricingPlans,
  addPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  AuthError
} from "@/services/pricingPlansService";

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null);
  const { toast } = useToast();

  // Fetch pricing plans on component mount
  const fetchPricingPlans = async () => {
    setIsLoading(true);
    try {
      const data = await getPricingPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);

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
          description: error.message || "Failed to fetch pricing plans",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pricing plans",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPlan = () => {
    setCurrentPlan(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setCurrentPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (id: number) => {
    try {
      await deletePricingPlan(id);
      setPlans(plans.filter(plan => plan.plan_id !== id));
      toast({
        title: "Success",
        description: "Pricing plan deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting pricing plan:", error);

      if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete pricing plan",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete pricing plan",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitPlan = async (planData: {
    plan_id?: number;
    name: string;
    price: number;
    duration_in_days: number;
    available_listing: number;
  }) => {
    // console.log('Received plan data in PricingPlansPage:', planData);
    try {
      if (currentPlan) {
        // Edit existing plan
        const updatedPlan = await updatePricingPlan(
          currentPlan.plan_id,
          {
            name: planData.name,
            price: planData.price,
            duration_in_days: planData.duration_in_days,
            available_listing: planData.available_listing
          }
        );
        setPlans(plans.map(p => (p.plan_id === updatedPlan.plan_id ? updatedPlan : p)));
        toast({
          title: "Success",
          description: "Pricing plan updated successfully",
        });
      } else {
        // Add new plan
        const newPlan = await addPricingPlan({
          name: planData.name,
          price: planData.price,
          duration_in_days: planData.duration_in_days,
          available_listing: planData.available_listing
        });
        setPlans([...plans, newPlan]);
        toast({
          title: "Success",
          description: "Pricing plan added successfully",
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving pricing plan:", error);

      // Check for specific error messages
      if (error instanceof Error &&
          error.message.includes("already exists")) {
        toast({
          title: "Error",
          description: "A pricing plan with this name already exists",
          variant: "destructive",
        });
      } else if (error instanceof AuthError) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired or your token is invalid.",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to save pricing plan",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save pricing plan",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pricing Plan Management</h1>
        <Button
          onClick={handleAddPlan}
          variant="brand-purple"
          className="animate-fade-in"
        >
          <Plus size={16} className="mr-1" />
          Add Plan
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <p>Loading pricing plans...</p>
          </div>
        ) : (
          <PricingPlanTable
            plans={plans}
            onEdit={handleEditPlan}
            onDelete={handleDeletePlan}
          />
        )}
      </div>

      <PricingPlanModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={currentPlan}
        onSubmit={handleSubmitPlan}
        buttonVariant="brand-purple"
      />
    </div>
  );
}
