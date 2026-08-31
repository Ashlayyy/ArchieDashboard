import { Op } from 'sequelize';

export function normalizeCompanies(companies?: string[]): string[] {
  if (!companies?.length) {
    return [];
  }

  return companies
    .filter((company): company is string => typeof company === 'string')
    .map((company) => company.trim())
    .filter((company) => company.length > 0 && company.length <= 128)
    .slice(0, 200);
}

export default function sourceFilter(companies?: string[]): { [Op.in]: string[] } | { [Op.not]: null } {
  const normalized = normalizeCompanies(companies);
  if (normalized.length > 0) {
    return { [Op.in]: normalized };
  }
  return { [Op.not]: null };
}
