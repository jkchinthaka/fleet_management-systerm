import { dashboardRepository } from '../repositories/dashboardRepository.js';

export const dashboardService = {
  async getSummary() {
    const [overview, fuelTrend, electricityWaterTrend, maintenanceCostTrend, recentActivities] = await Promise.all([
      dashboardRepository.getOverview(),
      dashboardRepository.getFuelTrend(),
      dashboardRepository.getElectricityWaterTrend(),
      dashboardRepository.getMaintenanceCostTrend(),
      dashboardRepository.getRecentActivities()
    ]);

    return {
      overview,
      charts: {
        fuelTrend,
        electricityWaterTrend,
        maintenanceCostTrend
      },
      recentActivities
    };
  }
};
