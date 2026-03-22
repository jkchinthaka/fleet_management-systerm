import { notificationRepository } from '../repositories/notificationRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const notificationService = {
  list() {
    return notificationRepository.list();
  },
  create(payload) {
    return notificationRepository.create(payload);
  },
  async update(id, payload) {
    const updated = await notificationRepository.updateById(id, payload);
    if (!updated) throw new ApiError(404, 'Notification not found');
    return updated;
  },
  async remove(id) {
    const count = await notificationRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Notification not found');
    return true;
  },
  async markRead(id) {
    const updated = await notificationRepository.markRead(id);
    if (!updated) throw new ApiError(404, 'Notification not found');
    return updated;
  },
  listThresholds() {
    return notificationRepository.listThresholds();
  },
  runThresholdEngine() {
    return notificationRepository.runThresholdEngine();
  }
};
