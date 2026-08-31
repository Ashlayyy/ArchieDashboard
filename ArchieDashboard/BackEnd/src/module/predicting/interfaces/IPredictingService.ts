export default interface IPredictingService {
  predict(data: any[], months?: number): Promise<{ predictedData: number[]; dateArray: number[] | string[] }>;
  calculatePerformanceMetrics(): { mse: number; rmse: number; rSquared: number };
}
