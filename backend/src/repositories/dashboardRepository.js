import { Vehicle, FuelLog, ServiceRequest, PurchaseOrder, ElectricityData, WaterMeterData } from '../models/index.js';

export const dashboardRepository = {
  async getOverview() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalVehicles,
      [fuelAgg],
      [monthlyAgg],
      activeServiceRequests
    ] = await Promise.all([
      Vehicle.countDocuments(),
      FuelLog.aggregate([{ $group: { _id: null, total: { $sum: '$fuel_quantity' } } }]),
      FuelLog.aggregate([
        { $match: { log_date: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]),
      ServiceRequest.countDocuments({ status: { $in: ['Pending', 'In Progress'] } })
    ]);

    return {
      totalVehicles,
      totalFuelConsumption: fuelAgg?.total || 0,
      monthlyExpenses: monthlyAgg?.total || 0,
      activeServiceRequests
    };
  },

  async getFuelTrend() {
    return FuelLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$log_date' } },
          fuelQuantity: { $sum: '$fuel_quantity' },
          fuelCost: { $sum: '$cost' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: '$_id', fuelQuantity: 1, fuelCost: 1 } }
    ]);
  },

  async getElectricityWaterTrend() {
    const [elec, water] = await Promise.all([
      ElectricityData.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$reading_date' } },
            electricity: { $sum: '$units_consumed' },
            electricityCost: { $sum: '$cost' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      WaterMeterData.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$reading_date' } },
            water: { $sum: '$units_consumed' },
            waterCost: { $sum: '$cost' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const map = {};
    for (const r of elec) {
      map[r._id] = { month: r._id, electricity: r.electricity || 0, electricityCost: r.electricityCost || 0, water: 0, waterCost: 0 };
    }
    for (const r of water) {
      if (map[r._id]) {
        map[r._id].water = r.water || 0;
        map[r._id].waterCost = r.waterCost || 0;
      } else {
        map[r._id] = { month: r._id, electricity: 0, electricityCost: 0, water: r.water || 0, waterCost: r.waterCost || 0 };
      }
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  },

  async getMaintenanceCostTrend() {
    return ServiceRequest.aggregate([
      { $match: { sla_deadline: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$sla_deadline' } },
          cost: { $sum: '$total_cost' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: '$_id', cost: 1 } }
    ]);
  },

  async getRecentActivities() {
    const [fuel, service, po] = await Promise.all([
      FuelLog.find().sort({ id: -1 }).limit(3).lean(),
      ServiceRequest.find().sort({ id: -1 }).limit(3).lean(),
      PurchaseOrder.find().sort({ id: -1 }).limit(3).lean()
    ]);

    const Vehicle = (await import('../models/index.js')).Vehicle;
    const activities = [];

    for (const fl of fuel) {
      const v = await Vehicle.findOne({ id: fl.vehicle_id }).lean();
      activities.push({ text: `Fuel entry logged: ${v?.registration_number || 'Unknown'}`, at: fl.log_date || null });
    }
    for (const sr of service) {
      activities.push({ text: `Service request updated: ${sr.title}`, at: sr.updated_at || sr.created_at || null });
    }
    for (const p of po) {
      activities.push({ text: `Purchase order ${p.id}: ${p.status}`, at: p.created_at || null });
    }

    return activities
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 10)
      .map((r, i) => ({ id: i + 1, text: r.text, at: r.at ? new Date(r.at).toISOString() : null }));
  }
};
