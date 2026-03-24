import { costLogRepository } from '../repositories/costLogRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const costLogService = {
  list(filters) {
    return costLogRepository.findAll(filters);
  },

  create(payload, userId) {
    payload.created_by = userId;
    return costLogRepository.create(payload);
  },

  async getById(id) {
    const log = await costLogRepository.findById(id);
    if (!log) throw new ApiError(404, 'Cost log not found');
    return log;
  },

  async update(id, payload, userId) {
    const existing = await costLogRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Cost log not found');
    payload.updated_by = userId;
    await costLogRepository.updateById(id, payload);
    return costLogRepository.findById(id);
  },

  async approve(id, userId, approved) {
    const existing = await costLogRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Cost log not found');

    const update = {
      status: approved ? 'Approved' : 'Rejected',
      approved_by: userId,
      approved_at: new Date()
    };
    await costLogRepository.updateById(id, update);
    return costLogRepository.findById(id);
  },

  async remove(id) {
    const count = await costLogRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Cost log not found');
    return true;
  }
};
