export default interface IApiService {
  fetchApi(endpoint: string, options?: RequestInit, filter?: import('../types/MetricsFilter').MetricsFilter): Promise<
    import('../types/ApiResult').ApiResult
  >;
}
