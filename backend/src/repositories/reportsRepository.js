import { FuelLog, ServiceRequest, PurchaseOrder } from '../models/index.js';

export const reportsRepository = {
  async costAnalysis({ fromDate, toDate, vehicleId }) {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const fuelMatch = {};
    if (from) fuelMatch.log_date = { ...fuelMatch.log_date, $gte: from };
    if (to) fuelMatch.log_date = { ...fuelMatch.log_date, $lte: to };
    if (vehicleId) fuelMatch.vehicle_id = Number(vehicleId);

    const serviceMatch = { sla_deadline: { $ne: null } };
    if (from) serviceMatch.sla_deadline = { ...serviceMatch.sla_deadline, $gte: from };
    if (to) serviceMatch.sla_deadline = { ...serviceMatch.sla_deadline, $lte: to };

    const poMatch = {};
    if (from) poMatch.order_date = { ...poMatch.order_date, $gte: from };
    if (to) poMatch.order_date = { ...poMatch.order_date, $lte: to };

    const [fuelRows, serviceRows, poRows] = await Promise.all([
      FuelLog.aggregate([
        { $match: fuelMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$log_date' } }, vehicle_id: { $first: '$vehicle_id' }, amount: { $sum: '$cost' } } },
        { $project: { _id: 0, module: { $literal: 'fuel' }, txDate: '$_id', vehicle_id: 1, amount: 1 } }
      ]),
      ServiceRequest.aggregate([
        { $match: serviceMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$sla_deadline' } }, amount: { $sum: '$total_cost' } } },
        { $project: { _id: 0, module: { $literal: 'service' }, txDate: '$_id', vehicle_id: { $literal: null }, amount: 1 } }
      ]),
      PurchaseOrder.aggregate([
        { $match: poMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$order_date' } }, amount: { $sum: '$total_amount' } } },
        { $project: { _id: 0, module: { $literal: 'purchase' }, txDate: '$_id', vehicle_id: { $literal: null }, amount: 1 } }
      ])
    ]);

    return [...fuelRows, ...serviceRows, ...poRows].sort((a, b) =>
      new Date(b.txDate) - new Date(a.txDate)
    );
  },

  async slaTrend({ fromDate, toDate }) {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const now = new Date();

    const match = { sla_deadline: { $ne: null } };
    if (from) match.sla_deadline = { ...match.sla_deadline, $gte: from };
    if (to) match.sla_deadline = { ...match.sla_deadline, $lte: to };

    return ServiceRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$sla_deadline' } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          breached: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'Completed'] }, { $lt: ['$sla_deadline', now] }] },
                1, 0
              ]
            }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, period: '$_id', completed: 1, breached: 1, total: 1 } }
    ]);
  }
};
