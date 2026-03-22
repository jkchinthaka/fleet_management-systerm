import {
  Notification, AlertThreshold, Product,
  MachineMaintenanceSchedule, Vehicle, VehicleDocument,
  FuelLog, PurchaseOrder, ServiceRequest
} from '../models/index.js';

const compare = (operator, left, right) => {
  if (operator === '<=') return left <= right;
  if (operator === '>=') return left >= right;
  if (operator === '<') return left < right;
  if (operator === '>') return left > right;
  if (operator === '=') return left === right;
  return false;
};

export const notificationRepository = {
  list() {
    return Notification.find().sort({ created_at: -1 }).lean();
  },

  findById(id) {
    return Notification.findOne({ id: Number(id) }).lean();
  },

  create(payload) {
    return new Notification(payload).save();
  },

  async updateById(id, payload) {
    return Notification.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async markRead(id) {
    return Notification.findOneAndUpdate({ id: Number(id) }, { is_read: true }, { new: true });
  },

  async deleteById(id) {
    return Notification.findOneAndDelete({ id: Number(id) });
  },

  listThresholds() {
    return AlertThreshold.find({ is_active: true }).lean();
  },

  async runThresholdEngine() {
    const thresholds = await AlertThreshold.find({ is_active: true }).lean();
    const created = [];

    for (const threshold of thresholds) {
      if (threshold.module === 'inventory' && threshold.metric_key === 'low_stock') {
        const products = await Product.find().lean();
        for (const product of products) {
          if (compare(threshold.comparison_operator, product.current_stock, threshold.threshold_value)) {
            created.push(await new Notification({
              module: 'inventory',
              title: `Low stock: ${product.product_name}`,
              message: `Current stock (${product.current_stock}) is below threshold (${threshold.threshold_value}).`,
              severity: 'High'
            }).save());
          }
        }
      }

      if (threshold.module === 'machines' && threshold.metric_key === 'maintenance_due_days') {
        const today = new Date();
        const schedules = await MachineMaintenanceSchedule.find({ status: { $ne: 'Completed' } }).lean();
        for (const schedule of schedules) {
          const due = new Date(schedule.due_date);
          const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (compare(threshold.comparison_operator, diffDays, threshold.threshold_value)) {
            created.push(await new Notification({
              module: 'machines',
              title: `Maintenance due soon for machine #${schedule.machine_id}`,
              message: `Maintenance due in ${diffDays} day(s).`,
              severity: 'Medium'
            }).save());
          }
        }
      }

      if (threshold.module === 'vehicles' && threshold.metric_key === 'service_due_days') {
        const today = new Date();
        const vehicles = await Vehicle.find().lean();
        for (const vehicle of vehicles) {
          if (!vehicle.last_service_date) continue;
          const elapsedDays = Math.floor((today.getTime() - new Date(vehicle.last_service_date).getTime()) / (1000 * 60 * 60 * 24));
          if (compare(threshold.comparison_operator, elapsedDays, threshold.threshold_value)) {
            created.push(await new Notification({
              module: 'vehicles',
              title: `Service reminder: ${vehicle.registration_number}`,
              message: `Last service was ${elapsedDays} day(s) ago.`,
              severity: 'Medium'
            }).save());
          }
        }
      }

      if (threshold.module === 'vehicles' && threshold.metric_key === 'document_expiry_days') {
        const today = new Date();
        const docs = await VehicleDocument.find().lean();
        for (const doc of docs) {
          if (!doc.expiry_date) continue;
          const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (compare(threshold.comparison_operator, daysLeft, threshold.threshold_value)) {
            const vehicle = await Vehicle.findOne({ id: doc.vehicle_id }).lean();
            created.push(await new Notification({
              module: 'vehicles',
              title: `Document expiry soon: ${doc.document_type}`,
              message: `${vehicle?.registration_number || 'Vehicle'} document expires in ${daysLeft} day(s).`,
              severity: 'High'
            }).save());
          }
        }
      }

      if (threshold.module === 'finance' && threshold.metric_key === 'high_spend') {
        const monthStart = new Date();
        monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
        const [fuelRows, poRows] = await Promise.all([
          FuelLog.find({ log_date: { $gte: monthStart } }).lean(),
          PurchaseOrder.find({ order_date: { $gte: monthStart } }).lean()
        ]);
        const total = fuelRows.reduce((s, x) => s + Number(x.cost || 0), 0)
                    + poRows.reduce((s, x) => s + Number(x.total_amount || 0), 0);
        if (compare(threshold.comparison_operator, total, threshold.threshold_value)) {
          created.push(await new Notification({
            module: 'finance',
            title: 'High spend anomaly detected',
            message: `Current month combined spend is ${total}, threshold is ${threshold.threshold_value}.`,
            severity: 'High'
          }).save());
        }
      }

      if (threshold.module === 'service' && threshold.metric_key === 'sla_breach_hours') {
        const now = Date.now();
        const requests = await ServiceRequest.find().lean();
        for (const request of requests) {
          if (!request.sla_deadline || request.status === 'Completed') continue;
          const dueInHours = Math.floor((new Date(request.sla_deadline).getTime() - now) / (1000 * 60 * 60));
          if (compare(threshold.comparison_operator, dueInHours, threshold.threshold_value)) {
            created.push(await new Notification({
              module: 'service',
              title: `SLA risk for request #${request.id}`,
              message: `Request has ${dueInHours} hour(s) remaining before SLA breach.`,
              severity: dueInHours < 0 ? 'High' : 'Medium'
            }).save());
          }
        }
      }
    }

    return created;
  }
};
