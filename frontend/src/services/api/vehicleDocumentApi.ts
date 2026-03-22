import { apiClient } from './client';
import type { ApiResponse, VehicleDocument } from '../../types';

export const vehicleDocumentApi = {
  async list(vehicleId: number) {
    const response = await apiClient.get<ApiResponse<VehicleDocument[]>>(
      `/vehicles/${vehicleId}/documents`
    );
    return response.data.data;
  },
  async create(vehicleId: number, payload: { document_type: string; document_number?: string; expiry_date?: string }) {
    const response = await apiClient.post<ApiResponse<VehicleDocument>>(
      `/vehicles/${vehicleId}/documents`,
      payload
    );
    return response.data.data;
  },
  async update(id: number, payload: Partial<Pick<VehicleDocument, 'document_type' | 'document_number' | 'expiry_date'>>) {
    const response = await apiClient.put<ApiResponse<VehicleDocument>>(
      `/vehicles/documents/${id}`,
      payload
    );
    return response.data.data;
  },
  async remove(id: number) {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/vehicles/documents/${id}`
    );
    return response.data;
  }
};
