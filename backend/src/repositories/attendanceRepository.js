import { Attendance } from '../models/index.js';

export const attendanceRepository = {
  list(filters = {}) {
    const query = {};
    if (filters.userId) query.user_id = filters.userId;
    if (filters.date) query.attendance_date = new Date(filters.date);
    return Attendance.find(query).sort({ attendance_date: -1 }).lean();
  },

  create(payload) {
    return new Attendance(payload).save();
  },

  findById(id) {
    return Attendance.findOne({ id: Number(id) }).lean();
  },

  updateById(id, payload) {
    return Attendance.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  deleteById(id) {
    return Attendance.findOneAndDelete({ id: Number(id) });
  },

  async monthlySummary(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return Attendance.aggregate([
      { $match: { attendance_date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: '$user_id',
          user_email: { $first: '$user_email' },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } }
        }
      },
      { $project: { _id: 0, user_id: '$_id', user_email: 1, presentDays: 1, absentDays: 1 } }
    ]);
  }
};
