import { client } from './client';
import type { Credit, CreditPage, CreditQuery, NewCredit } from '../types/credit';

export async function fetchCredits(query: CreditQuery): Promise<CreditPage> {
  const { data } = await client.get<CreditPage>('/api/credits', { params: query });
  return data;
}

export async function createCredit(credit: NewCredit): Promise<Credit> {
  const { data } = await client.post<Credit>('/api/credits', credit);
  return data;
}
