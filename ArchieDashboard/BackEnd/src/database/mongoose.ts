import mongoose from 'mongoose';
import Logger from '../helpers/logger';

const connect = async (): Promise<void> => {
  const uri = process.env.MONGOOSE_URI || process.env.MONGO_URI;
  if (!uri) {
    return;
  }

  const logger = new Logger();
  try {
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${String(error)}`);
    throw error;
  }
};

export default connect;
