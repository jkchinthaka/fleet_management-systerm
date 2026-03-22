import { WaterMeterData, ElectricityData } from '../models/index.js';

export const utilityRepository = {
  listWater() {
    return WaterMeterData.find().sort({ reading_date: -1 }).lean();
  },

  findWaterById(id) {
    return WaterMeterData.findOne({ id: Number(id) }).lean();
  },

  findWaterByDateAndLocation(readingDate, meterLocation) {
    return WaterMeterData.findOne({ reading_date: new Date(readingDate), meter_location: meterLocation }).lean();
  },

  createWater(payload) {
    return new WaterMeterData(payload).save();
  },

  updateWater(id, payload) {
    return WaterMeterData.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  listElectricity() {
    return ElectricityData.find().sort({ reading_date: -1 }).lean();
  },

  findElectricityById(id) {
    return ElectricityData.findOne({ id: Number(id) }).lean();
  },

  findElectricityByDateAndLocation(readingDate, meterLocation) {
    return ElectricityData.findOne({ reading_date: new Date(readingDate), meter_location: meterLocation }).lean();
  },

  createElectricity(payload) {
    return new ElectricityData(payload).save();
  },

  updateElectricity(id, payload) {
    return ElectricityData.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async getMonthlyComparison() {
    const [waterRows, elecRows] = await Promise.all([
      WaterMeterData.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$reading_date' } },
            waterUnits: { $sum: '$units_consumed' },
            waterCost: { $sum: '$cost' }
          }
        }
      ]),
      ElectricityData.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$reading_date' } },
            electricityUnits: { $sum: '$units_consumed' },
            electricityCost: { $sum: '$cost' }
          }
        }
      ])
    ]);

    const map = {};
    for (const r of waterRows) {
      map[r._id] = { month: r._id, waterUnits: r.waterUnits || 0, waterCost: r.waterCost || 0, electricityUnits: 0, electricityCost: 0 };
    }
    for (const r of elecRows) {
      if (map[r._id]) {
        map[r._id].electricityUnits = r.electricityUnits || 0;
        map[r._id].electricityCost = r.electricityCost || 0;
      } else {
        map[r._id] = { month: r._id, waterUnits: 0, waterCost: 0, electricityUnits: r.electricityUnits || 0, electricityCost: r.electricityCost || 0 };
      }
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }
};
