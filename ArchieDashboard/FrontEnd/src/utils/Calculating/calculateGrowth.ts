import calculateDifferenceData from './calculateDifferenceData';

export default async function growth(data: any) {
  const list = Array.isArray(data) ? data : [];
  const GrowthGBArray: any = [];
  const GrowthMFCPArray: any = [];
  const GrowthCorrespArray: any = [];
  const GrowthUsersArray: any = [];

  if (list.length === 0) {
    return {
      GB: [],
      MFCP: [],
      Corresp: [],
      Users: []
    };
  }

  for (let i = 0; i < list.length; i++) {
    if (!list[i]) continue;
    if (list[i].Type === 'database_size') {
      GrowthGBArray.push(data[i]);
    } else if (data[i].Type === 'mfcp_size') {
      GrowthMFCPArray.push(data[i]);
    } else if (data[i].Type === 'corresp_size') {
      GrowthCorrespArray.push(data[i]);
    } else if (data[i].Type === 'active_users') {
      GrowthUsersArray.push(data[i]);
    } else {
      GrowthUsersArray.push(0);
      GrowthCorrespArray.push(0);
    }
  }

  const growth: any = {
    GB: [],
    MFCP: [],
    Corresp: [],
    Users: []
  };

  for (let i = 0; i < GrowthGBArray.length; i++) {
    if (i > 0) {
      growth.GB.push({
        x: new Date(String(GrowthGBArray[i].BackupDate)),
        y: GrowthGBArray[i] ? calculateDifferenceData(GrowthGBArray[i - 1].IntData, GrowthGBArray[i].IntData) : 0
      });
      growth.MFCP.push({
        x: new Date(String(GrowthMFCPArray[i].BackupDate)),
        y: GrowthMFCPArray[i] ? calculateDifferenceData(GrowthMFCPArray[i - 1].IntData, GrowthMFCPArray[i].IntData) : 0
      });
      growth.Corresp.push({
        x: GrowthCorrespArray[i]
          ? new Date(String(GrowthCorrespArray[i].BackupDate))
          : new Date(String(GrowthGBArray[i - 1].BackupDate)),
        y: GrowthCorrespArray[i]
          ? calculateDifferenceData(GrowthCorrespArray[i - 1].IntData, GrowthCorrespArray[i].IntData)
          : 0
      });
      growth.Users.push({
        x: GrowthUsersArray[i]
          ? new Date(String(GrowthUsersArray[i].BackupDate))
          : new Date(String(GrowthGBArray[i - 1].BackupDate)),
        y: GrowthUsersArray[i]
          ? calculateDifferenceData(GrowthUsersArray[i - 1].IntData, GrowthUsersArray[i].IntData)
          : 0
      });
    }
  }

  return growth;
}
