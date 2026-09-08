/* eslint-disable class-methods-use-this */
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { FindOptions, Op, Sequelize } from 'sequelize';
import mapData from '../../../helpers/mappers/mapData';
import mapGridData from '../../../helpers/mappers/mapGridData';
import calculatePercentage from '../../../helpers/calculatePercentage';
import ILogger from '../../../interfaces/ILogger';
import sourceFilter from '../../../helpers/sourceFilter';
import { buildWeekMetricsQuery } from '../../../helpers/weekMetricsQuery';
import { IBackupMetricsService } from '../interfaces/IBackupMetricsService';
import { BackupMetricsServiceFilter } from '../types/BackupMetricsServiceFilter';
import {
  MetricsResultModel,
  MetricsFormat,
  MetricsTypeResultModel,
  WeekMetricsResultModel
} from '../types/Mappers/MetricsMapper';
import { GridItem } from '../types/GridItem';
import { emptyMetrics, emptyStatistics } from '../../../helpers/emptyMetrics';

@injectable()
export default class SequelizeBackupMetricsService implements IBackupMetricsService {
  constructor(
    @inject('BackupMetricsModel') private backupMetricsModel: any,
    @inject('Logger') private readonly Logger: ILogger
  ) {}

  private async withFallback<T>(operation: string, fallback: T, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.Logger.error(`${operation} failed, returning empty data: ${String(error)}`);
      return fallback;
    }
  }

  public async metrics(filter: BackupMetricsServiceFilter): Promise<MetricsResultModel> {
    let backupDateOptions = {};

    if (filter.dates && filter.dates.length > 0) {
      backupDateOptions = { [Op.in]: filter.dates };
    } else if (filter.fromDate !== undefined && filter.toDate !== undefined) {
      backupDateOptions = { [Op.between]: [filter.fromDate, filter.toDate] };
    } else {
      backupDateOptions = { [Op.not]: null };
    }

    const options: FindOptions = {
      attributes: ['BackupDate', 'Type', [Sequelize.fn('SUM', Sequelize.col('IntData')), 'IntData']],
      where: {
        BackupDate: backupDateOptions,
        Source: sourceFilter(filter.companies),
        IntData: { [Op.not]: null }
      },
      group: ['BackupDate', 'Type'],
      order: [
        ['Type', 'ASC'],
        ['BackupDate', 'ASC']
      ]
    };

    return this.withFallback('metrics', emptyMetrics(), async () => {
      const data: MetricsFormat[] = await this.backupMetricsModel.model().findAll(options);
      return mapData(data ?? []);
    });
  }

  public async lastDate(filter?: BackupMetricsServiceFilter): Promise<number> {
    return this.withFallback('lastDate', 0, async () => {
      const result: MetricsFormat | null = await this.backupMetricsModel.model().findOne({
        attributes: ['BackupDate'],
        where: {
          Source: sourceFilter(filter?.companies)
        },
        order: [['BackupDate', 'DESC']]
      });
      return Number(result?.dataValues?.BackupDate) || 0;
    });
  }

  public async getLength(filter: BackupMetricsServiceFilter): Promise<number> {
    return this.withFallback('getLength', 0, async () => {
      const data: MetricsFormat[] = await this.backupMetricsModel.model().findAll({
        attributes: ['Source'],
        where: {
          Source: sourceFilter(filter.companies),
          BackupDate: await this.lastDate(filter),
          Type: 'database_size'
        }
      });
      return data.length;
    });
  }

  public async getTypes(filter: BackupMetricsServiceFilter): Promise<MetricsTypeResultModel[]> {
    let backupDateOptions;

    if (filter.dates && filter.dates.length > 0) {
      backupDateOptions = { [Op.in]: filter.dates };
    } else if (filter.fromDate !== undefined && filter.toDate !== undefined) {
      backupDateOptions = { [Op.between]: [filter.fromDate, filter.toDate] };
    } else {
      backupDateOptions = { [Op.not]: null };
    }

    const options: FindOptions = {
      attributes: ['Type', [Sequelize.fn('SUM', Sequelize.col('IntData')), 'IntData']],
      where: {
        Source: sourceFilter(filter.companies),
        BackupDate: backupDateOptions,
        IntData: { [Op.not]: null }
      },
      group: ['Type'],
      order: [['Type', 'DESC']]
    };
    return this.withFallback('getTypes', emptyStatistics().Types, async () => {
    const data: MetricsFormat[] = await this.backupMetricsModel.model().findAll(options);
    let totalSize: number = 0;
    const typesArray: MetricsTypeResultModel[] = [];
    if (data.length === 0) {
      return [
        { Type: 'No data available', Amount: 0 },
        { Type: 'No data available', Amount: 0 },
        { Type: 'No data available', Amount: 0 },
        { Type: 'No data available', Amount: 0 }
      ];
    }

    data.forEach((item: MetricsFormat) => {
      if (item.dataValues.Type === 'database_size' || item.dataValues.Type === 'mfcp_size') {
        totalSize += Number(item.dataValues.IntData);
      }
    });

    data.forEach((item: MetricsFormat) => {
      if (
        (item.dataValues.Type === 'corresp_size' && item.dataValues.IntData) ||
        (item.dataValues.Type === 'mfcp_size' && item.dataValues.IntData)
      ) {
        typesArray.push({
          Type: item.dataValues.Type,
          Amount: calculatePercentage(totalSize, item.dataValues.IntData)
        });
      }
    });

    typesArray.push({
      Type: 'Overig',
      Amount: 100 - (typesArray[0]?.Amount ?? 0) - (typesArray[1]?.Amount ?? 0)
    });

    return typesArray;
    });
  }

  public async weekMetrics(filter: BackupMetricsServiceFilter): Promise<WeekMetricsResultModel[]> {
    return this.withFallback('weekMetrics', [], async () => {
      const lastDate = await this.lastDate(filter);
      const { sql, replacements } = buildWeekMetricsQuery(filter, lastDate);
      const data = await this.backupMetricsModel.sequelize.query(sql, { replacements });

      return data[0] ?? [];
    });
  }

  public async gridMetrics(): Promise<GridItem[]> {
    return this.withFallback('gridMetrics', [], async () => {
    const companySearchOptions: FindOptions = {
      attributes: ['Source'],
      where: {
        BackupDate: await this.lastDate(),
        IntData: { [Op.not]: null }
      },
      order: [['BackupDate', 'DESC']]
    };

    const companies: string[] = await this.backupMetricsModel
      .model()
      .findAll(companySearchOptions)
      .then((data: MetricsFormat[]) => data.map((item: MetricsFormat) => item.dataValues.Source))
      .then((data: string[]) =>
        data.filter((item: string, index: number) => !['', null, data[index - 1]].includes(item))
      );

    const options: FindOptions = {
      attributes: ['BackupDate', 'Type', 'IntData', 'Source'],
      where: {
        Source: companies,
        BackupDate: await this.lastDate({
          companies
        }),
        IntData: { [Op.not]: null }
      },
      order: [
        ['Type', 'DESC'],
        ['BackupDate', 'DESC']
      ]
    };

    const companyData: MetricsFormat[] = await this.backupMetricsModel.model().findAll(options);

    return mapGridData(companies, companyData);
    });
  }

  async list(): Promise<string[]> {
    return this.withFallback('list', [], async () => {
      const query = `SELECT DISTINCT Source FROM dbo.BackupMetrics WHERE BackupDate = $1 ORDER BY Source ASC`;
      const bindOptions = {
        bind: [await this.lastDate()]
      };

      let list = await this.backupMetricsModel.sequelize.query(query, bindOptions);

      list = list[0].map((item: { Source: string }) => item.Source);

      return list;
    });
  }
}
