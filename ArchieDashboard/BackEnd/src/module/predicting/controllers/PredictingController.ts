/* eslint-disable class-methods-use-this */
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import ILogger from '../../../interfaces/ILogger';
import IPredictingService from '../interfaces/IPredictingService';
import IPredictingController from '../interfaces/IPredictingController';
import mapSizes from '../../../helpers/mappers/mapSizes';
import { ApiRequest } from '../../backupmetrics/types/Request/ApiRequest';
import { ApiRequestResult } from '../../backupmetrics/types/Request/ApiRequestResult';
import { IBackupMetricsService } from '../../backupmetrics/interfaces/IBackupMetricsService';
import validateMetricsBody from '../../../helpers/validateMetricsBody';
import { emptyPrediction } from '../../../helpers/emptyMetrics';

@injectable()
export default class PredictingController implements IPredictingController {
  constructor(
    @inject('PredictingService')
    private predictingService: IPredictingService,
    @inject('BackupMetricsService')
    private backupMetricsService: IBackupMetricsService,
    @inject('Logger') private readonly Logger: ILogger
  ) {}

  async predict(request: ApiRequest): Promise<ApiRequestResult> {
    try {
      const parsed = validateMetricsBody(request.body);
      if (!parsed.ok) {
        return { status: 400, data: parsed.error };
      }

      const companies = parsed.value.companies ?? [];
      const months = parsed.value.months ?? 6;
      const metrics = await this.backupMetricsService.metrics({ companies });
      const mappedData = mapSizes(metrics.metrics);
      const predictedGB = await this.predictingService.predict(mappedData.GB, months);
      const predictedMFCP = await this.predictingService.predict(mappedData.MFCP, months);
      const predictedCO = await this.predictingService.predict(mappedData.CO, months);
      const predictedUS = await this.predictingService.predict(mappedData.US, months);
      const predictedACTUS = await this.predictingService.predict(mappedData.ACT_US, months);

      return {
        status: 200,
        data: {
          predictedGB,
          predictedMFCP,
          predictedCO,
          predictedUS,
          predictedACTUS
        }
      };
    } catch (error) {
      this.Logger.error(String(error));
      return {
        status: 200,
        data: emptyPrediction()
      };
    }
  }
}
