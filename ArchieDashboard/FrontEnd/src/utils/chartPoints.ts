export type ChartPoint = { x: string; y: number };

export function sortChartPoints<T extends { x: string | number | Date }>(points: T[] | undefined | null): T[] {
  if (!Array.isArray(points)) {
    return [];
  }

  return [...points].sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
}

export function latestPoint<T extends { y: number }>(points: T[] | undefined | null): T | undefined {
  if (!Array.isArray(points) || points.length === 0) {
    return undefined;
  }
  return points[points.length - 1];
}
