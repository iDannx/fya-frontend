export interface Credit {
  id: number;
  clientName: string;
  clientDocument: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  agentName: string;
  createdAt: string;
}

export type NewCredit = Omit<Credit, 'id' | 'createdAt'>;

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface CreditPage {
  content: Credit[];
  page: PageMetadata;
}

export type SortableField = 'createdAt' | 'amount';

export type CreditSort = `${SortableField},${'asc' | 'desc'}`;

export interface CreditQuery {
  clientName?: string;
  document?: string;
  agentName?: string;
  sort?: CreditSort;
  page?: number;
  size?: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  errors: string[];
}

export interface CreditFilters {
  clientName: string;
  document: string;
  agentName: string;
}
