import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../services/api/inventoryApi';
import { useToastStore } from '../store/toastStore';

export const useInventory = () => {
  const queryClient = useQueryClient();
  const push = useToastStore((s) => s.push);

  const products = useQuery({ queryKey: ['inventory-products'], queryFn: inventoryApi.listProducts });
  const suppliers = useQuery({ queryKey: ['inventory-suppliers'], queryFn: inventoryApi.listSuppliers });
  const purchaseOrders = useQuery({ queryKey: ['inventory-pos'], queryFn: inventoryApi.listPurchaseOrders });
  const stockMovements = useQuery({ queryKey: ['inventory-stock-movements'], queryFn: inventoryApi.listStockMovements });
  const grns = useQuery({ queryKey: ['inventory-grns'], queryFn: inventoryApi.listGrns });

  const createProduct = useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      push({ type: 'success', title: 'Product created' });
    }
  });

  const createSupplier = useMutation({
    mutationFn: inventoryApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-suppliers'] });
      push({ type: 'success', title: 'Supplier created' });
    }
  });

  const createPurchaseOrder = useMutation({
    mutationFn: inventoryApi.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-pos'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stock-movements'] });
      push({ type: 'success', title: 'Purchase order created' });
    }
  });

  const createGrn = useMutation({
    mutationFn: inventoryApi.createGrn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-grns'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stock-movements'] });
      push({ type: 'success', title: 'GRN posted and stock updated' });
    }
  });

  return {
    products,
    suppliers,
    purchaseOrders,
    stockMovements,
    grns,
    createProduct,
    createSupplier,
    createPurchaseOrder,
    createGrn
  };
};
