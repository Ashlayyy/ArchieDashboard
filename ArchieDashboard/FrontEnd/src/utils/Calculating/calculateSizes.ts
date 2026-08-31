export default function calculateSizes(data: Array<any>): any {
  let DatabaseSize = 0;
  let MFCPSize = 0;
  let CorrespSize = 0;
  let users = 0;

  try {
    if (data[0] == undefined || data[1] == undefined || data[2] == undefined || data[3] == undefined) {
      throw new Error('Data is undefined');
    }
  } catch (err) {
    return {
      DatabaseSize,
      MFCPSize,
      CorrespSize,
      users
    };
  }
  //Database
  if (
    data[0]?.Sizes.GB.database != undefined &&
    data[0]?.Sizes.GB.database >= 0 &&
    (data[1]?.Sizes.GB.database == 0 || data[1]?.Sizes.GB.database == undefined) &&
    (data[2]?.Sizes.GB.database == 0 || data[2]?.Sizes.GB.database == undefined) &&
    (data[3]?.Sizes.GB.database == 0 || data[3]?.Sizes.GB.database == undefined) &&
    (data[4]?.Sizes.GB.database == 0 || data[4]?.Sizes.GB.database == undefined)
  ) {
    DatabaseSize = data[0]?.Sizes.GB.database;
  } else if (
    (data[0]?.Sizes.GB.database == 0 || data[0]?.Sizes.GB.database == undefined) &&
    data[1]?.Sizes.GB.database != undefined &&
    data[1]?.Sizes.GB.database >= 0 &&
    (data[2]?.Sizes.GB.database == 0 || data[2]?.Sizes.GB.database == undefined) &&
    (data[3]?.Sizes.GB.database == 0 || data[3]?.Sizes.GB.database == undefined) &&
    (data[4]?.Sizes.GB.database == 0 || data[4]?.Sizes.GB.database == undefined)
  ) {
    DatabaseSize = data[1]?.Sizes.GB.database;
  } else if (
    (data[0]?.Sizes.GB.database == 0 || data[0]?.Sizes.GB.database == undefined) &&
    (data[1]?.Sizes.GB.database == 0 || data[1]?.Sizes.GB.database == undefined) &&
    data[2]?.Sizes.GB.database != undefined &&
    data[2]?.Sizes.GB.database >= 0 &&
    (data[3]?.Sizes.GB.database == 0 || data[3]?.Sizes.GB.database == undefined) &&
    (data[4]?.Sizes.GB.database == 0 || data[4]?.Sizes.GB.database == undefined)
  ) {
    DatabaseSize = data[2]?.Sizes.GB.database;
  } else if (
    (data[0]?.Sizes.GB.database == 0 || data[0]?.Sizes.GB.database == undefined) &&
    (data[1]?.Sizes.GB.database == 0 || data[1]?.Sizes.GB.database == undefined) &&
    (data[2]?.Sizes.GB.database == 0 || data[2]?.Sizes.GB.database == undefined) &&
    data[3]?.Sizes.GB.database != undefined &&
    data[3]?.Sizes.GB.database >= 0 &&
    (data[4]?.Sizes.GB.database == 0 || data[4]?.Sizes.GB.database == undefined)
  ) {
    DatabaseSize = data[3]?.Sizes.GB.database;
  } else if (
    (data[0]?.Sizes.GB.database == 0 || data[0]?.Sizes.GB.database == undefined) &&
    (data[1]?.Sizes.GB.database == 0 || data[1]?.Sizes.GB.database == undefined) &&
    (data[2]?.Sizes.GB.database == 0 || data[2]?.Sizes.GB.database == undefined) &&
    (data[3]?.Sizes.GB.database == 0 || data[3]?.Sizes.GB.database == undefined) &&
    data[4]?.Sizes.GB.database != undefined &&
    data[4]?.Sizes.GB.database >= 0
  ) {
    DatabaseSize = data[4]?.Sizes.GB.database;
  }

  //MFCP
  if (
    data[0]?.Sizes.GB.MFCP != undefined &&
    data[0]?.Sizes.GB.MFCP >= 0 &&
    (data[1]?.Sizes.GB.MFCP == 0 || data[1]?.Sizes.GB.MFCP == undefined) &&
    (data[2]?.Sizes.GB.MFCP == 0 || data[2]?.Sizes.GB.MFCP == undefined) &&
    (data[3]?.Sizes.GB.MFCP == 0 || data[3]?.Sizes.GB.MFCP == undefined) &&
    (data[4]?.Sizes.GB.MFCP == 0 || data[4]?.Sizes.GB.MFCP == undefined)
  ) {
    MFCPSize = data[0]?.Sizes.GB.MFCP;
  } else if (
    (data[0]?.Sizes.GB.MFCP == 0 || data[0]?.Sizes.GB.MFCP == undefined) &&
    data[1]?.Sizes.GB.MFCP != undefined &&
    data[1]?.Sizes.GB.MFCP >= 0 &&
    (data[2]?.Sizes.GB.MFCP == 0 || data[2]?.Sizes.GB.MFCP == undefined) &&
    (data[3]?.Sizes.GB.MFCP == 0 || data[3]?.Sizes.GB.MFCP == undefined) &&
    (data[4]?.Sizes.GB.MFCP == 0 || data[4]?.Sizes.GB.MFCP == undefined)
  ) {
    MFCPSize = data[1]?.Sizes.GB.MFCP;
  } else if (
    (data[0]?.Sizes.GB.MFCP == 0 || data[0]?.Sizes.GB.MFCP == undefined) &&
    (data[1]?.Sizes.GB.MFCP == 0 || data[1]?.Sizes.GB.MFCP == undefined) &&
    data[2]?.Sizes.GB.MFCP != undefined &&
    data[2]?.Sizes.GB.MFCP >= 0 &&
    (data[3]?.Sizes.GB.MFCP == 0 || data[3]?.Sizes.GB.MFCP == undefined) &&
    (data[4]?.Sizes.GB.MFCP == 0 || data[4]?.Sizes.GB.MFCP == undefined)
  ) {
    MFCPSize = data[2]?.Sizes.GB.MFCP;
  } else if (
    (data[0]?.Sizes.GB.MFCP == 0 || data[0]?.Sizes.GB.MFCP == undefined) &&
    (data[1]?.Sizes.GB.MFCP == 0 || data[1]?.Sizes.GB.MFCP == undefined) &&
    (data[2]?.Sizes.GB.MFCP == 0 || data[2]?.Sizes.GB.MFCP == undefined) &&
    data[3]?.Sizes.GB.MFCP != undefined &&
    data[3]?.Sizes.GB.MFCP >= 0 &&
    (data[4]?.Sizes.GB.MFCP == 0 || data[4]?.Sizes.GB.MFCP == undefined)
  ) {
    MFCPSize = data[3]?.Sizes.GB.MFCP;
  } else if (
    (data[0]?.Sizes.GB.MFCP == 0 || data[0]?.Sizes.GB.MFCP == undefined) &&
    (data[1]?.Sizes.GB.MFCP == 0 || data[1]?.Sizes.GB.MFCP == undefined) &&
    (data[2]?.Sizes.GB.MFCP == 0 || data[2]?.Sizes.GB.MFCP == undefined) &&
    (data[3]?.Sizes.GB.MFCP == 0 || data[3]?.Sizes.GB.MFCP == undefined) &&
    data[4]?.Sizes.GB.MFCP != undefined &&
    data[4]?.Sizes.GB.MFCP >= 0
  ) {
    MFCPSize = data[4]?.Sizes.GB.MFCP;
  }
  //Correspondence
  if (
    data[0]?.Sizes.GB.correspondence != undefined &&
    data[0]?.Sizes.GB.correspondence >= 0 &&
    (data[1]?.Sizes.GB.correspondence == 0 || data[1]?.Sizes.GB.correspondence == undefined) &&
    (data[2]?.Sizes.GB.correspondence == 0 || data[2]?.Sizes.GB.correspondence == undefined) &&
    (data[3]?.Sizes.GB.correspondence == 0 || data[3]?.Sizes.GB.correspondence == undefined) &&
    (data[4]?.Sizes.GB.correspondence == 0 || data[4]?.Sizes.GB.correspondence == undefined)
  ) {
    CorrespSize = data[0]?.Sizes.GB.correspondence;
  } else if (
    (data[0]?.Sizes.GB.correspondence == 0 || data[0]?.Sizes.GB.correspondence == undefined) &&
    data[1]?.Sizes.GB.correspondence != undefined &&
    data[1]?.Sizes.GB.correspondence >= 0 &&
    (data[2]?.Sizes.GB.correspondence == 0 || data[2]?.Sizes.GB.correspondence == undefined) &&
    (data[3]?.Sizes.GB.correspondence == 0 || data[3]?.Sizes.GB.correspondence == undefined) &&
    (data[4]?.Sizes.GB.correspondence == 0 || data[4]?.Sizes.GB.correspondence == undefined)
  ) {
    CorrespSize = data[1]?.Sizes.GB.correspondence;
  } else if (
    (data[0]?.Sizes.GB.correspondence == 0 || data[0]?.Sizes.GB.correspondence == undefined) &&
    (data[1]?.Sizes.GB.correspondence == 0 || data[1]?.Sizes.GB.correspondence == undefined) &&
    data[2]?.Sizes.GB.correspondence != undefined &&
    data[2]?.Sizes.GB.correspondence >= 0 &&
    (data[3]?.Sizes.GB.correspondence == 0 || data[3]?.Sizes.GB.correspondence == undefined) &&
    (data[4]?.Sizes.GB.correspondence == 0 || data[4]?.Sizes.GB.correspondence == undefined)
  ) {
    CorrespSize = data[2]?.Sizes.GB.correspondence;
  } else if (
    (data[0]?.Sizes.GB.correspondence == 0 || data[0]?.Sizes.GB.correspondence == undefined) &&
    (data[1]?.Sizes.GB.correspondence == 0 || data[1]?.Sizes.GB.correspondence == undefined) &&
    (data[2]?.Sizes.GB.correspondence == 0 || data[2]?.Sizes.GB.correspondence == undefined) &&
    data[3]?.Sizes.GB.correspondence != undefined &&
    data[3]?.Sizes.GB.correspondence >= 0 &&
    (data[4]?.Sizes.GB.correspondence == 0 || data[4]?.Sizes.GB.correspondence == undefined)
  ) {
    CorrespSize = data[3]?.Sizes.GB.correspondence;
  } else if (
    (data[0]?.Sizes.GB.correspondence == 0 || data[0]?.Sizes.GB.correspondence == undefined) &&
    (data[1]?.Sizes.GB.correspondence == 0 || data[1]?.Sizes.GB.correspondence == undefined) &&
    (data[2]?.Sizes.GB.correspondence == 0 || data[2]?.Sizes.GB.correspondence == undefined) &&
    (data[3]?.Sizes.GB.correspondence == 0 || data[3]?.Sizes.GB.correspondence == undefined) &&
    data[4]?.Sizes.GB.correspondence != undefined &&
    data[4]?.Sizes.GB.correspondence >= 0
  ) {
    CorrespSize = data[4]?.Sizes.GB.correspondence;
  }

  //Users
  if (
    data[0]?.Sizes.users != undefined &&
    data[0]?.Sizes.users >= 0 &&
    (data[1]?.Sizes.users == 0 || data[1]?.Sizes.users == undefined) &&
    (data[2]?.Sizes.users == 0 || data[2]?.Sizes.users == undefined) &&
    (data[3]?.Sizes.users == 0 || data[3]?.Sizes.users == undefined) &&
    (data[4]?.Sizes.users == 0 || data[4]?.Sizes.users == undefined)
  ) {
    users = data[0]?.Sizes.users;
  } else if (
    (data[0]?.Sizes.users == 0 || data[0]?.Sizes.users == undefined) &&
    data[1]?.Sizes.users != undefined &&
    data[1]?.Sizes.users >= 0 &&
    (data[2]?.Sizes.users == 0 || data[2]?.Sizes.users == undefined) &&
    (data[3]?.Sizes.users == 0 || data[3]?.Sizes.users == undefined) &&
    (data[4]?.Sizes.users == 0 || data[4]?.Sizes.users == undefined)
  ) {
    users = data[1]?.Sizes.users;
  } else if (
    (data[0]?.Sizes.users == 0 || data[0]?.Sizes.users == undefined) &&
    (data[1]?.Sizes.users == 0 || data[1]?.Sizes.users == undefined) &&
    data[2]?.Sizes.users != undefined &&
    data[2]?.Sizes.users >= 0 &&
    (data[3]?.Sizes.users == 0 || data[3]?.Sizes.users == undefined) &&
    (data[4]?.Sizes.users == 0 || data[4]?.Sizes.users == undefined)
  ) {
    users = data[2]?.Sizes.users;
  } else if (
    (data[0]?.Sizes.users == 0 || data[0]?.Sizes.users == undefined) &&
    (data[1]?.Sizes.users == 0 || data[1]?.Sizes.users == undefined) &&
    (data[2]?.Sizes.users == 0 || data[2]?.Sizes.users == undefined) &&
    data[3]?.Sizes.users != undefined &&
    data[3]?.Sizes.users >= 0 &&
    (data[4]?.Sizes.users == 0 || data[4]?.Sizes.users == undefined)
  ) {
    users = data[3]?.Sizes.users;
  } else if (
    (data[0]?.Sizes.users == 0 || data[0]?.Sizes.users == undefined) &&
    (data[1]?.Sizes.users == 0 || data[1]?.Sizes.users == undefined) &&
    (data[2]?.Sizes.users == 0 || data[2]?.Sizes.users == undefined) &&
    (data[3]?.Sizes.users == 0 || data[3]?.Sizes.users == undefined) &&
    data[4]?.Sizes.users != undefined &&
    data[4]?.Sizes.users >= 0
  ) {
    users = data[4]?.Sizes.users;
  }

  return {
    DatabaseSize,
    MFCPSize,
    CorrespSize,
    users
  };
}
