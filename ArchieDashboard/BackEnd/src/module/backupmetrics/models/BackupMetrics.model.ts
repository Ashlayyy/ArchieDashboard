import Sequelize from 'sequelize';
import { injectable, inject } from 'tsyringe';

@injectable()
export default class BackupMetrics {
  sequelize: any = null;

  private cachedModel: any = null;

  constructor(@inject('database') private database: any) {
    this.sequelize = database.sequelize;
  }

  schema: any = {
    id: {
      primaryKey: true,
      type: Sequelize.BIGINT,
      allowNull: false
    },
    Source: {
      type: Sequelize.STRING,
      allowNull: false
    },
    BackupDate: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    Type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    IntData: {
      type: Sequelize.BIGINT,
      allowNull: false
    }
  };

  name: String = 'BackupMetrics';

  schemaOptions: any = {
    freezeTableName: true,
    timestamps: false
  };

  model = () => {
    if (this.cachedModel) {
      return this.cachedModel;
    }

    this.cachedModel = this.sequelize.define(this.name, this.schema, {
      ...this.schemaOptions
    });

    return this.cachedModel;
  };
}
