import { MetricsResultModel } from '../module/backupmetrics/types/Mappers/MetricsMapper';

export function emptyChartData() {
  return {
    GB: [],
    MFCP: [],
    CO: [],
    US: [],
    ACT_US: []
  };
}

export function emptyMetrics(): MetricsResultModel {
  return {
    metrics: [],
    chartData: emptyChartData()
  };
}

export function emptyStatistics() {
  return {
    Date: 0,
    Length: 0,
    Types: [
      { Type: 'No data available', Amount: 0 },
      { Type: 'No data available', Amount: 0 },
      { Type: 'No data available', Amount: 0 },
      { Type: 'No data available', Amount: 0 }
    ]
  };
}

export function emptyPrediction() {
  const emptySeries = { predictedData: [] as number[], dateArray: [] as string[] };
  return {
    predictedGB: emptySeries,
    predictedMFCP: emptySeries,
    predictedCO: emptySeries,
    predictedUS: emptySeries,
    predictedACTUS: emptySeries
  };
}
