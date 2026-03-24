import { reminderRepository } from '../repositories/reminderRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const reminderService = {
  list(filters) {
    return reminderRepository.findAll(filters);
  },

  upcoming(days) {
    return reminderRepository.findUpcoming(days);
  },

  create(payload, userId) {
    payload.created_by = userId;
    return reminderRepository.create(payload);
  },

  async getById(id) {
    const r = await reminderRepository.findById(id);
    if (!r) throw new ApiError(404, 'Reminder not found');
    return r;
  },

  async update(id, payload, userId) {
    const existing = await reminderRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Reminder not found');
    payload.updated_by = userId;
    await reminderRepository.updateById(id, payload);
    return reminderRepository.findById(id);
  },

  async complete(id) {
    const existing = await reminderRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Reminder not found');
    await reminderRepository.updateById(id, { is_completed: true, completed_at: new Date() });

    // If recurring, spawn the next occurrence
    if (existing.recurrence && existing.recurrence !== 'None') {
      const nextDue = computeNextDue(existing.due_date, existing.recurrence);
      if (!existing.recurrence_end || nextDue <= new Date(existing.recurrence_end)) {
        await reminderRepository.create({
          vehicle_id: existing.vehicle_id,
          reminder_type: existing.reminder_type,
          title: existing.title,
          description: existing.description,
          due_date: nextDue,
          recurrence: existing.recurrence,
          recurrence_end: existing.recurrence_end,
          notify_before_days: existing.notify_before_days,
          assigned_to: existing.assigned_to,
          created_by: existing.created_by
        });
      }
    }

    return reminderRepository.findById(id);
  },

  async remove(id) {
    const count = await reminderRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Reminder not found');
    return true;
  }
};

function computeNextDue(current, recurrence) {
  const d = new Date(current);
  switch (recurrence) {
    case 'Weekly':    d.setDate(d.getDate() + 7); break;
    case 'Monthly':   d.setMonth(d.getMonth() + 1); break;
    case 'Quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'Yearly':    d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}
