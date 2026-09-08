import { MetricsFilter } from '@/types/MetricsFilter';
import IMetricsService from '../interfaces/IMetricsService';
import { ChartCoordinate } from '../types/chartCoordinate';
import { ApiResult } from '../types/ApiResult';
import roundToDecimals from '../utils/Transforming/roundToDecimals';
import {
  emptyChartData,
  normalizeMetricsPayload,
  normalizePredictionPayload,
  normalizeStatisticsPayload
} from '../utils/normalizeMetrics';
import apiService from './ApiService.service';

const emptyMetricsResult = (): ApiResult => ({
  status: 200,
  data: {
    metrics: [],
    chartData: emptyChartData()
  }
});

const emptyStatisticsResult = (): ApiResult => ({
  status: 200,
  data: normalizeStatisticsPayload(undefined)
});

export default class MetricsService implements IMetricsService {
  constructor(private ApiService: apiService = new apiService()) {}

  private async safeFetch(endpoint: string, fallback: ApiResult, filter?: MetricsFilter, options?: RequestInit) {
    try {
      const response = await this.ApiService.fetchApi(endpoint, options, filter);
      if (!response) {
        return fallback;
      }
      if (response.status && response.status >= 400) {
        return fallback;
      }
      return response;
    } catch {
      return fallback;
    }
  }

  statistics = async (filter?: MetricsFilter) => {
    const response = await this.safeFetch('/database/metrics/statistics', emptyStatisticsResult(), filter);
    return {
      ...response,
      data: normalizeStatisticsPayload(response.data)
    };
  };

  metrics = async (filter?: MetricsFilter) => {
    const response = await this.safeFetch('/database/metrics', emptyMetricsResult(), filter);
    return {
      ...response,
      data: normalizeMetricsPayload(response.data)
    };
  };

  weekMetrics = async (filter?: MetricsFilter) => {
    const response = await this.safeFetch('/database/metrics/week', { status: 200, data: [] }, filter);
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : []
    };
  };

  gridMetrics = async () => {
    const response = await this.safeFetch('/database/metrics/grid', { status: 200, data: [] });
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : []
    };
  };

  predictionMetrics = async (filter?: MetricsFilter) => {
    const response = await this.safeFetch('/predict', { status: 200, data: normalizePredictionPayload(undefined) }, filter);
    return {
      ...response,
      data: normalizePredictionPayload(response.data)
    };
  };

  averageMetrics = async (data: ChartCoordinate[], length: number) => {
    const average = [];
    for (const item of data) {
      const typedItem: ChartCoordinate = item;
      average.push({ x: typedItem.x, y: roundToDecimals(typedItem.y / length, 2) });
    }
    return average;
  };

  closeToLimit = async (): Promise<number> => {
    try {
      const response = await this.ApiService.fetchApi('/database/metrics', { cache: 'no-store' });
      if (!response) return 0;
      const remaining = Number(response.headers?.['x-ratelimit-remaining']);
      if (remaining < 25 && remaining > 5) {
        return 1;
      }
      if (remaining <= 5) {
        return 2;
      }
      return 0;
    } catch {
      return 0;
    }
  };
}
