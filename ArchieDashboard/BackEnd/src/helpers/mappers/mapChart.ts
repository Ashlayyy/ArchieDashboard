import { MetricsMapperResult } from '../../module/backupmetrics/types/Mappers/MetricsMapper';
import { ChartCoordinate } from '../../module/backupmetrics/types/Mappers/ChartCoordinate';

function sortPoints(points: ChartCoordinate[]): ChartCoordinate[] {
  return [...points].sort((a, b) => Date.parse(String(a.x)) - Date.parse(String(b.x)));
}

export default (data: MetricsMapperResult[]) => {
  const GB: ChartCoordinate[] = [];
  const MFCP: ChartCoordinate[] = [];
  const CO: ChartCoordinate[] = [];
  const US: ChartCoordinate[] = [];
  const ACT_US: ChartCoordinate[] = [];

  data.forEach((item: MetricsMapperResult) => {
    switch (item.Type) {
      case 'database_size':
        GB.push({
          x: new Date(String(item.BackupDate)).toISOString(),
          y: Number(item.IntData)
        });
        break;

      case 'mfcp_size':
        MFCP.push({
          x: new Date(String(item.BackupDate)).toISOString(),
          y: Number(item.IntData)
        });
        break;

      case 'corresp_size':
        CO.push({
          x: new Date(String(item.BackupDate)).toISOString(),
          y: Number(item.IntData)
        });
        break;
      case 'users':
        US.push({
          x: new Date(String(item.BackupDate)).toISOString(),
          y: Number(item.IntData)
        });
        break;
      case 'active_users':
        ACT_US.push({
          x: new Date(String(item.BackupDate)).toISOString(),
          y: Number(item.IntData)
        });
        break;

      default:
        break;
    }
  });

  const mfcpByDate = new Map(sortPoints(MFCP).map((point) => [point.x, point.y]));
  const totalGb = sortPoints(GB).map((point) => ({
    x: point.x,
    y: point.y + (mfcpByDate.get(point.x) ?? 0)
  }));

  return {
    GB: totalGb,
    MFCP: sortPoints(MFCP),
    CO: sortPoints(CO),
    US: sortPoints(US),
    ACT_US: sortPoints(ACT_US)
  };
};
