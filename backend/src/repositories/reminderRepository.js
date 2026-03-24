import { Reminder, Vehicle } from '../models/index.js';

export const reminderRepository = {
  async findAll(filters = {}) {
    const query = {};
    if (filters.vehicleId) query.vehicle_id = Number(filters.vehicleId);
    if (filters.assignedTo) query.assigned_to = filters.assignedTo;
    if (filters.isCompleted !== undefined) query.is_completed = filters.isCompleted === 'true';
    if (filters.reminderType) query.reminder_type = filters.reminderType;

    const reminders = await Reminder.find(query).sort({ due_date: 1 }).lean();
    const vehicleIds = [...new Set(reminders.map((r) => r.vehicle_id))];
    const vehicles = await Vehicle.find({ id: { $in: vehicleIds } }).lean();
    const vMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
    return reminders.map((r) => ({ ...r, vehicle: vMap[r.vehicle_id] || null }));
  },

  async findById(id) {
    const reminder = await Reminder.findOne({ id: Number(id) }).lean();
    if (!reminder) return null;
    const vehicle = await Vehicle.findOne({ id: reminder.vehicle_id }).lean();
    return { ...reminder, vehicle };
  },

  async findUpcoming(days = 7) {
    const now = new Date();
    const until = new Date(now.getTime() + days * 86400000);
    const reminders = await Reminder.find({
      is_completed: false,
      due_date: { $gte: now, $lte: until }
    }).sort({ due_date: 1 }).lean();

    const vehicleIds = [...new Set(reminders.map((r) => r.vehicle_id))];
    const vehicles = await Vehicle.find({ id: { $in: vehicleIds } }).lean();
    const vMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
    return reminders.map((r) => ({ ...r, vehicle: vMap[r.vehicle_id] || null }));
  },

  create(payload) {
    return new Reminder(payload).save();
  },

  async updateById(id, payload) {
    return Reminder.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async deleteById(id) {
    return Reminder.findOneAndDelete({ id: Number(id) });
  }
};
