export {};
declare global {
  interface ClickedItemType {
    Company: string;
  }
  interface gridTypes {
    selectedItems: Array<any>;
    search: string;
    items: Array<any>;
    loadingDone: Boolean | null | undefined;
    clickedItem: ClickedItemType;
    disableCompareButton: any;
    headers: Array<object>;
  }

  interface dataObject {
    dataValues: {
      Id: string;
      Source: string;
      Type: string;
      IntData: number;
      BackupDate: number;
    };
  }

  interface totalDateObject {
    month: string;
    gb: number;
  }

  interface formattedDataObject {
    Id: string;
    Source: string;
    BackupDate: number;
    Sizes: {
      users: number;
      KB: {
        MFCP: number;
        database: number;
        correspondence: number;
      };
      GB: {
        MFCP: number;
        database: number;
        correspondence: number;
      };
    };
    GBArray?: number[];
    MFArray?: number[];
    COArray?: number[];
    USArray?: number[];
  }

  interface dataObjectForTotal {
    range: string | null;
    total: object | Array<number>;
    startDate: string;
    resultGB: {
      message: string;
      total: any;
    };
  }

  interface LimitUsersObject {
    on: boolean;
    maxUSers: number | null;
  }

  interface ChartData {
    datasets: [
      {
        data: Array<any>;
      }
    ];
  }

  interface ChartConfigData {
    labels?: Array<any>;
    DB?: Array<any>;
    MFCP?: Array<any>;
    CO?: Array<any>;
    users?: Array<any>;
  }
}
