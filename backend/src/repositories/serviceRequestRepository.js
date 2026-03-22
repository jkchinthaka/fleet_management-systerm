import { ServiceRequest, ServiceTask, ServiceSparePart, Product } from '../models/index.js';
import mongoose from 'mongoose';

async function populateRequest(req) {
  if (!req) return null;
  const tasks = await ServiceTask.find({ service_request_id: req.id }).lean();
  for (const task of tasks) {
    const spareParts = await ServiceSparePart.find({ service_task_id: task.id }).lean();
    for (const sp of spareParts) {
      sp.product = await Product.findOne({ id: sp.product_id }).lean();
    }
    task.spareParts = spareParts;
  }
  return { ...req, tasks };
}

export const serviceRequestRepository = {
  async findAll() {
    const requests = await ServiceRequest.find().sort({ id: -1 }).lean();
    return Promise.all(requests.map(populateRequest));
  },

  create(payload) {
    return new ServiceRequest(payload).save();
  },

  async findById(id) {
    const req = await ServiceRequest.findOne({ id: Number(id) }).lean();
    return populateRequest(req);
  },

  async updateById(id, payload) {
    return ServiceRequest.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async updateStatus(id, status) {
    return ServiceRequest.findOneAndUpdate({ id: Number(id) }, { status }, { new: true });
  },

  createTask(payload) {
    return new ServiceTask(payload).save();
  },

  async listTasks(serviceRequestId) {
    const query = serviceRequestId ? { service_request_id: Number(serviceRequestId) } : {};
    const tasks = await ServiceTask.find(query).sort({ id: -1 }).lean();
    for (const task of tasks) {
      const spareParts = await ServiceSparePart.find({ service_task_id: task.id }).lean();
      for (const sp of spareParts) {
        sp.product = await Product.findOne({ id: sp.product_id }).lean();
      }
      task.spareParts = spareParts;
    }
    return tasks;
  },

  async createSparePart(payload) {
    const session = await mongoose.connection.startSession();
    return session.withTransaction(async () => {
      const row = await new ServiceSparePart({
        ...payload,
        total_cost: payload.quantity * payload.unit_cost
      }).save({ session });

      await Product.findOneAndUpdate(
        { id: payload.product_id },
        { $inc: { current_stock: -payload.quantity } },
        { session }
      );

      return row;
    }).finally(() => session.endSession());
  },

  async recalculateRequestCost(serviceRequestId) {
    const tasks = await ServiceTask.find({ service_request_id: Number(serviceRequestId) }).lean();
    let total = 0;
    for (const task of tasks) {
      total += Number(task.labor_cost || 0);
      const spareParts = await ServiceSparePart.find({ service_task_id: task.id }).lean();
      total += spareParts.reduce((s, x) => s + Number(x.total_cost || 0), 0);
    }
    await ServiceRequest.findOneAndUpdate({ id: Number(serviceRequestId) }, { total_cost: total });
    return total;
  },

  slaOverview() {
    return ServiceRequest.find({ sla_deadline: { $ne: null } }).sort({ sla_deadline: 1 }).lean();
  },

  async deleteById(id) {
    return ServiceRequest.findOneAndDelete({ id: Number(id) });
  },

  async deleteTaskById(id) {
    return ServiceTask.findOneAndDelete({ id: Number(id) });
  },

  async deleteSparePartById(id) {
    return ServiceSparePart.findOneAndDelete({ id: Number(id) });
  }
};
