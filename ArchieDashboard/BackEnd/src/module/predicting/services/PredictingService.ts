/* eslint-disable class-methods-use-this */
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { DateTime } from 'luxon';
import IPredictingService from '../interfaces/IPredictingService';
import LinearRegressionService from './LinearRegressionService';
import ILogger from '../../../interfaces/ILogger';
import calculateAmountOfDays from '../../../helpers/calculateMonths';

@injectable()
export default class PredictingService implements IPredictingService {
  constructor(@inject('Logger') private readonly Logger: ILogger) {}

  async predict(data: any[], months: number): Promise<{ predictedData: number[]; dateArray: number[] | string[] }> {
    if (!Array.isArray(data) || data.length === 0) {
      return { predictedData: [], dateArray: [] };
    }

    const predictedData = [];
    const dateArray = [];
    const trainingData: [number, number][] = [];
    const reversedData = [...data];
    reversedData.reverse();
    const skipDays = calculateAmountOfDays(months) / 12.5;
    const trainingDays = data.map((_, index) => index + 1);
    for (let i = 0; i < reversedData.length; i += 1) {
      trainingData.push([trainingDays[i], reversedData[i]]);
    }

    const linearRegression = new LinearRegressionService(this.Logger);
    linearRegression.data = trainingData;
    linearRegression.train();

    let today = DateTime.local()
      .plus({ days: Math.round(skipDays) })
      .startOf('day');
    let currentDate = DateTime.local().startOf('day');

    for (let i = 0; i < calculateAmountOfDays(months); i += 1) {
      currentDate = currentDate.plus({ days: 1 });
      if (currentDate.toISODate() === today.toISODate()) {
        predictedData.push(Math.round(linearRegression.predict(i + skipDays)));
        dateArray.push(currentDate.toISODate());
        today = today.plus({ month: 1 });
      }
    }
    return {
      predictedData,
      dateArray
    };
  }

  calculatePerformanceMetrics() {
    const linearRegression = new LinearRegressionService(this.Logger);
    return linearRegression.calculatePerformanceMetrics();
  }
}
