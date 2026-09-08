IF DB_ID(N'CloudMetrics') IS NULL
BEGIN
  CREATE DATABASE CloudMetrics;
END
GO

USE CloudMetrics;
GO

IF OBJECT_ID(N'dbo.BackupMetrics', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.BackupMetrics (
    id BIGINT NOT NULL PRIMARY KEY,
    Source NVARCHAR(255) NOT NULL,
    BackupDate BIGINT NOT NULL,
    Type NVARCHAR(64) NOT NULL,
    IntData BIGINT NOT NULL
  );

  CREATE INDEX IX_BackupMetrics_Source_Date ON dbo.BackupMetrics (Source, BackupDate);
  CREATE INDEX IX_BackupMetrics_Date_Type ON dbo.BackupMetrics (BackupDate, Type);
END
GO
