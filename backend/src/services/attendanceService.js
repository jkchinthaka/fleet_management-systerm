import { attendanceRepository } from '../repositories/attendanceRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const attendanceService = {
  list(filters) {
    return attendanceRepository.list(filters);
  },
  mark(payload) {
    return attendanceRepository.create(payload);
  },
  async update(id, payload) {
    const updated = await attendanceRepository.updateById(id, payload);
    if (!updated) throw new ApiError(404, 'Attendance record not found');
    return updated;
  },
  async remove(id) {
    const count = await attendanceRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Attendance record not found');
    return true;
  },
  monthlySummary(yearMonth) {
    return attendanceRepository.monthlySummary(yearMonth);
  }
};
