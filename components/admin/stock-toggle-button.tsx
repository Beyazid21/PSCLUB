'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toggleProductStock } from "@/app/actions";
import { toast } from "sonner";

interface StockToggleButtonProps {
  productId: string;
  inStock: boolean;
}

export function StockToggleButton({ productId, inStock }: StockToggleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    startTransition(async () => {
      const result = await toggleProductStock(productId, inStock);
      if (result.success) {
        toast.success(inStock ? "Məhsul stokda yoxdur olaraq qeyd edildi" : "Məhsul stokda var olaraq qeyd edildi");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onToggle} 
      disabled={isPending}
      className={inStock ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : inStock ? (
        <>
          <EyeOff className="h-4 w-4 mr-1" />
          Yoxdur et
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-1" />
          Var et
        </>
      )}
    </Button>
  );
}