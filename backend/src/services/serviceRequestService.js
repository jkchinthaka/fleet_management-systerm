import { serviceRequestRepository } from '../repositories/serviceRequestRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { auditLog } from '../utils/auditLogger.js';

const STATUS_FLOW = {
  Pending: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'On Hold', 'Cancelled'],
  'On Hold': ['In Progress', 'Cancelled'],
  Completed: [],
  Cancelled: []
};

const HIGH_COST_THRESHOLD = 50000;

export const serviceRequestService = {
  list() {
    return serviceRequestRepository.findAll();
  },
  create(payload) {
    return serviceRequestRepository.create(payload);
  },
  async update(id, payload) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) throw new ApiError(404, 'Service request not found');

    if (payload.status && payload.status !== request.status) {
      const nextAllowed = STATUS_FLOW[request.status] || [];
      if (!nextAllowed.includes(payload.status)) {
        throw new ApiError(400, `Invalid status transition from ${request.status} to ${payload.status}`);
      }
    }

    await serviceRequestRepository.updateById(id, payload);
    return serviceRequestRepository.findById(id);
  },

  async updateStatus(id, status, context) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) throw new ApiError(404, 'Service request not found');

    const nextAllowed = STATUS_FLOW[request.status] || [];
    if (!nextAllowed.includes(status)) {
      throw new ApiError(400, `Invalid status transition from ${request.status} to ${status}`);
    }

    if (status === 'Completed' && request.total_cost >= HIGH_COST_THRESHOLD && context.roleId !== 1 && context.roleId !== 7) {
      throw new ApiError(403, 'Supervisor/Admin approval required for high-cost closure');
    }

    await serviceRequestRepository.updateStatus(id, status);
    auditLog('SERVICE_STATUS_CHANGED', {
      requestId: id,
      previousStatus: request.status,
      newStatus: status,
      actorUserId: context.userId,
      actorRoleId: context.roleId
    });

    return serviceRequestRepository.findById(id);
  },

  listTasks(serviceRequestId) {
    return serviceRequestRepository.listTasks(serviceRequestId);
  },

  async addTask(payload, context) {
    const row = await serviceRequestRepository.createTask(payload);
    await serviceRequestRepository.recalculateRequestCost(payload.service_request_id);
    auditLog('SERVICE_TASK_CREATED', {
      requestId: payload.service_request_id,
      taskId: row.id,
      actorUserId: context.userId,
      actorRoleId: context.roleId
    });
    return row;
  },

  async addSparePart(payload, context) {
    const row = await serviceRequestRepository.createSparePart(payload);
    const tasks = await serviceRequestRepository.listTasks();
    const task = tasks.find((x) => x.id === payload.service_task_id);
    if (task) {
      await serviceRequestRepository.recalculateRequestCost(task.service_request_id);
      auditLog('SERVICE_SPARE_PART_ADDED', {
        requestId: task.service_request_id,
        taskId: payload.service_task_id,
        sparePartId: row.id,
        actorUserId: context.userId,
        actorRoleId: context.roleId
      });
    }
    return row;
  },

  async slaOverview() {
    const rows = await serviceRequestRepository.slaOverview();
    const now = Date.now();
    return rows.map((row) => {
      const deadline = row.sla_deadline ? new Date(row.sla_deadline).getTime() : null;
      const dueInHours = deadline ? Math.floor((deadline - now) / (1000 * 60 * 60)) : null;
      const breached = row.status !== 'Completed' && dueInHours !== null && dueInHours < 0;
      return {
        ...row.toJSON(),
        dueInHours,
        breached
      };
    });
  },

  async approveClosure(id, context) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) throw new ApiError(404, 'Service request not found');
    if (request.status !== 'In Progress' && request.status !== 'On Hold') {
      throw new ApiError(400, 'Only active tickets can be supervisor-closed');
    }

    await serviceRequestRepository.updateStatus(id, 'Completed');
    auditLog('SERVICE_CLOSURE_APPROVED', {
      requestId: id,
      totalCost: request.total_cost,
      actorUserId: context.userId,
      actorRoleId: context.roleId
    });

    return serviceRequestRepository.findById(id);
  },

  async remove(id) {
    const count = await serviceRequestRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Service request not found');
    return true;
  },
  async removeTask(id) {
    const count = await serviceRequestRepository.deleteTaskById(id);
    if (!count) throw new ApiError(404, 'Service task not found');
    return true;
  },
  async removeSparePart(id) {
    const count = await serviceRequestRepository.deleteSparePartById(id);
    if (!count) throw new ApiError(404, 'Spare part not found');
    return true;
  }
};
