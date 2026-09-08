import { sortChartPoints } from './chartPoints';

export const emptyChartData = () => ({
  GB: [] as { x: string; y: number }[],
  MFCP: [] as { x: string; y: number }[],
  CO: [] as { x: string; y: number }[],
  US: [] as { x: string; y: number }[],
  ACT_US: [] as { x: string; y: number }[]
});

export function normalizeMetricsPayload(payload: unknown) {
  const data = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const chartData = data.chartData && typeof data.chartData === 'object' ? (data.chartData as Record<string, unknown>) : {};

  return {
    metrics: Array.isArray(data.metrics) ? data.metrics : [],
    chartData: {
      GB: sortChartPoints((Array.isArray(chartData.GB) ? chartData.GB : []) as { x: string; y: number }[]),
      MFCP: sortChartPoints((Array.isArray(chartData.MFCP) ? chartData.MFCP : []) as { x: string; y: number }[]),
      CO: sortChartPoints((Array.isArray(chartData.CO) ? chartData.CO : []) as { x: string; y: number }[]),
      US: sortChartPoints((Array.isArray(chartData.US) ? chartData.US : []) as { x: string; y: number }[]),
      ACT_US: sortChartPoints((Array.isArray(chartData.ACT_US) ? chartData.ACT_US : []) as { x: string; y: number }[])
    }
  };
}

export function normalizeStatisticsPayload(payload: unknown) {
  const data = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  return {
    Date: Number(data.Date) || 0,
    Length: Number(data.Length) || 0,
    Types: Array.isArray(data.Types) ? data.Types : []
  };
}

export function normalizePredictionPayload(payload: unknown) {
  const emptySeries = { predictedData: [] as number[], dateArray: [] as string[] };
  const data = payload && typeof payload === 'object' ? (payload as Record<string, any>) : {};
  return {
    predictedGB: data.predictedGB ?? emptySeries,
    predictedMFCP: data.predictedMFCP ?? emptySeries,
    predictedCO: data.predictedCO ?? emptySeries,
    predictedUS: data.predictedUS ?? emptySeries,
    predictedACTUS: data.predictedACTUS ?? emptySeries
  };
}

export function isEmptyMetrics(metrics: { metrics: unknown[]; chartData: { GB: unknown[] } }) {
  return metrics.metrics.length === 0 && metrics.chartData.GB.length === 0;
}
