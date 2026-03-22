import { apiClient } from './client';
import type {
  ApiResponse,
  Product,
  Supplier,
  PurchaseOrder,
  Grn,
  StockMovement,
  CreatePurchaseOrderPayload,
  CreateGrnPayload
} from '../../types';

export const inventoryApi = {
  async listProducts() {
    const response = await apiClient.get<ApiResponse<Product[]>>('/inventory/products');
    return response.data.data;
  },
  async createProduct(payload: Omit<Product, 'id'>) {
    const response = await apiClient.post<ApiResponse<Product>>('/inventory/products', payload);
    return response.data.data;
  },

  async listSuppliers() {
    const response = await apiClient.get<ApiResponse<Supplier[]>>('/inventory/suppliers');
    return response.data.data;
  },
  async createSupplier(payload: Omit<Supplier, 'id'>) {
    const response = await apiClient.post<ApiResponse<Supplier>>('/inventory/suppliers', payload);
    return response.data.data;
  },
  async updateSupplier(id: number, payload: Partial<Omit<Supplier, 'id'>>) {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/inventory/suppliers/${id}`, payload);
    return response.data.data;
  },

  async listPurchaseOrders() {
    const response = await apiClient.get<ApiResponse<PurchaseOrder[]>>('/inventory/purchase-orders');
    return response.data.data;
  },
  async createPurchaseOrder(payload: CreatePurchaseOrderPayload) {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>('/inventory/purchase-orders', payload);
    return response.data.data;
  },

  async listStockMovements() {
    const response = await apiClient.get<ApiResponse<StockMovement[]>>('/inventory/stock-movements');
    return response.data.data;
  },

  async listGrns() {
    const response = await apiClient.get<ApiResponse<Grn[]>>('/inventory/grns');
    return response.data.data;
  },
  async createGrn(payload: CreateGrnPayload) {
    const response = await apiClient.post<ApiResponse<Grn>>('/inventory/grns', payload);
    return response.data.data;
  }
};
