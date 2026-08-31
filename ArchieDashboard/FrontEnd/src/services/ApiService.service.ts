import IApiService from '../interfaces/IApiService';
import Config from '../config/config';
import { ApiResult } from '../types/ApiResult';
import { MetricsFilter } from '../types/MetricsFilter';
import { getAccessToken } from './accessToken';

export default class ApiService implements IApiService {
  async fetchApi(endpoint: string, options?: RequestInit, filter?: MetricsFilter): Promise<ApiResult> {
    const apiUrl = Config.apiUrl;
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> | undefined)
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const requestInit: RequestInit =
      filter !== undefined
        ? {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
          }
        : {
            ...options,
            headers
          };

    const response = await fetch(`${apiUrl}${endpoint}`, requestInit);
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload !== null
          ? payload.data || payload.error || response.statusText
          : payload || response.statusText;
      throw new Error(`${response.status} - ${message}`);
    }

    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key] = value;
    });

    return {
      data: payload?.data ?? payload,
      status: payload?.status ?? response.status,
      headers: headerMap
    };
  }
}
