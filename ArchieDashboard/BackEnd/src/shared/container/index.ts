import 'reflect-metadata';
import { container } from 'tsyringe';

import database from '../../database/sequelize';

// BackupMetrics thing
import BackupSchema from '../../module/backupmetrics/models/BackupMetrics.model';
import SequelizeBackupMetricsService from '../../module/backupmetrics/services/SequelizeBackupMetricsService';
import { IBackupMetricsService } from '../../module/backupmetrics/interfaces/IBackupMetricsService';
import ExpressBackupMetricsController from '../../module/backupmetrics/controllers/BackupMetricsController';

// Predicting thing
import PredictingController from '../../module/predicting/controllers/PredictingController';
import PredictingService from '../../module/predicting/services/PredictingService';
import IPredictingService from '../../module/predicting/interfaces/IPredictingService';

// Logging thing
import Logger from '../../helpers/logger';
import ILogger from '../../interfaces/ILogger';

import IPredictingController from '../../module/predicting/interfaces/IPredictingController';
import IBackupMetricsController from '../../module/backupmetrics/interfaces/IBackupMetricsController';

import SettingsController from '../../module/settings/controllers/SettingsController';
import ISettingsController from '../../module/settings/interfaces/ISettingsController';
import ISettingsService from '../../module/settings/interfaces/ISettingsService';
import SettingsService from '../../module/settings/services/settingsService';

container.registerSingleton<ILogger>('Logger', Logger);
container.registerSingleton<database>('database', database);
container.registerSingleton<BackupSchema>('BackupMetricsModel', BackupSchema);
container.registerSingleton<IBackupMetricsService>('BackupMetricsService', SequelizeBackupMetricsService);
container.registerSingleton<IPredictingService>('PredictingService', PredictingService);
container.registerSingleton<ISettingsService>('SettingsService', SettingsService);
container.registerSingleton<IBackupMetricsController>('BackupMetricsController', ExpressBackupMetricsController);
container.registerSingleton<IPredictingController>('PredictingController', PredictingController);
container.registerSingleton<ISettingsController>('settingsController', SettingsController);

const backupMetricsController: IBackupMetricsController =
  container.resolve<IBackupMetricsController>('BackupMetricsController');
const predictingController: IPredictingController = container.resolve<IPredictingController>('PredictingController');
const settingsController: ISettingsController = container.resolve<ISettingsController>('settingsController');

const databaseContainer = container.resolve(database);

export { backupMetricsController, databaseContainer, predictingController, settingsController };
