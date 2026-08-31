import { ApiRequest } from '../../backupmetrics/types/Request/ApiRequest';
import { ApiRequestResult } from '../../backupmetrics/types/Request/ApiRequestResult';

export default interface ISettingsController {
  settingsById(req?: ApiRequest): Promise<ApiRequestResult>;
}
