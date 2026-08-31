/* eslint-disable class-methods-use-this */
import { injectable } from 'tsyringe';

import ISettingsController from '../interfaces/ISettingsController';
import { ApiRequestResult } from '../../backupmetrics/types/Request/ApiRequestResult';

@injectable()
export default class SettingsController implements ISettingsController {
  async settingsById(): Promise<ApiRequestResult> {
    return {
      status: 501,
      data: {
        errorMessage: 'Settings are not implemented',
        success: false
      }
    };
  }
}
