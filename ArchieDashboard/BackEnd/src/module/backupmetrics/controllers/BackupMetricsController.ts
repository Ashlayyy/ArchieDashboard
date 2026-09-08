import { inject, injectable } from 'tsyringe';
import { IBackupMetricsService } from '../interfaces/IBackupMetricsService';
import IBackupMetricsController from '../interfaces/IBackupMetricsController';
import { ApiRequest } from '../types/Request/ApiRequest';
import { ApiRequestResult } from '../types/Request/ApiRequestResult';
import validateMetricsBody from '../../../helpers/validateMetricsBody';
import { emptyMetrics, emptyStatistics } from '../../../helpers/emptyMetrics';

@injectable()
export default class BackupMetricsController implements IBackupMetricsController {
  constructor(@inject('BackupMetricsService') private readonly backupMetricsService: IBackupMetricsService) {}

  async metrics(request: ApiRequest): Promise<ApiRequestResult> {
    try {
      const parsed = validateMetricsBody(request.body);
      if (!parsed.ok) return { status: 400, data: parsed.error };

      const companies = parsed.value.companies ?? [];
      let fromDate: number | undefined;
      let toDate: number | undefined;
      let dates: number[] | undefined;

      if (parsed.value.fromDate !== undefined && parsed.value.toDate !== undefined && !parsed.value.dates) {
        fromDate = parsed.value.fromDate;
        toDate = parsed.value.toDate;
      } else {
        const lastDate = await this.backupMetricsService.lastDate({
          companies
        });
        dates = [];
        for (let i = 0; i < 7; i += 1) {
          dates.push(Number(lastDate) - i * 30);
        }
      }

      if (parsed.value.dates) {
        dates = parsed.value.dates;
      }

      const metrics = await this.backupMetricsService.metrics({
        companies,
        fromDate,
        toDate,
        dates
      });

      return {
        status: 200,
        data: metrics
      };
    } catch (error) {
      return {
        status: 200,
        data: emptyMetrics()
      };
    }
  }

  async statistics(request: ApiRequest): Promise<ApiRequestResult> {
    try {
      const parsed = validateMetricsBody(request.body);
      if (!parsed.ok) return { status: 400, data: parsed.error };

      const companies = parsed.value.companies ?? [];
      let fromDate: number;
      let toDate: number;
      let dates: number[] | undefined;

      if (parsed.value.dates) {
        dates = parsed.value.dates;
      }

      if (parsed.value.fromDate !== undefined && parsed.value.toDate !== undefined && !parsed.value.dates) {
        fromDate = parsed.value.fromDate;
        toDate = parsed.value.toDate;
      } else {
        const lastDate = await this.backupMetricsService.lastDate({
          companies
        });
        fromDate = Number(lastDate) - 7;
        toDate = Number(lastDate);
      }

      const lastDate = await this.backupMetricsService.lastDate({
        companies
      });

      const length = await this.backupMetricsService.getLength({
        companies
      });

      const types = await this.backupMetricsService.getTypes({
        fromDate,
        toDate,
        companies,
        dates
      });

      return {
        status: 200,
        data: {
          Date: lastDate,
          Length: length,
          Types: types
        }
      };
    } catch (error) {
      return {
        status: 200,
        data: emptyStatistics()
      };
    }
  }

  async weekMetrics(request: ApiRequest): Promise<ApiRequestResult> {
    try {
      const parsed = validateMetricsBody(request.body);
      if (!parsed.ok) return { status: 400, data: parsed.error };

      const companies = parsed.value.companies ?? [];
      let fromDate: number;
      let toDate: number;
      let dates: number[] | undefined;

      if (parsed.value.dates) {
        dates = parsed.value.dates;
      }

      if (parsed.value.fromDate !== undefined && parsed.value.toDate !== undefined && !parsed.value.dates) {
        fromDate = parsed.value.fromDate;
        toDate = parsed.value.toDate;
      } else {
        const lastDate = await this.backupMetricsService.lastDate({
          companies
        });
        fromDate = Number(lastDate) - 7;
        toDate = Number(lastDate);
      }

      const weekData = await this.backupMetricsService.weekMetrics({
        fromDate,
        toDate,
        companies,
        dates
      });

      return {
        status: 200,
        data: weekData
      };
    } catch (error) {
      return {
        status: 200,
        data: []
      };
    }
  }

  async gridMetrics(): Promise<ApiRequestResult> {
    try {
      const grid = await this.backupMetricsService.gridMetrics();
      return {
        status: 200,
        data: grid
      };
    } catch (error) {
      return {
        status: 200,
        data: []
      };
    }
  }

  async list(): Promise<ApiRequestResult> {
    try {
      const list = await this.backupMetricsService.list();
      return {
        status: 200,
        data: list
      };
    } catch (error) {
      return {
        status: 200,
        data: []
      };
    }
  }
}
