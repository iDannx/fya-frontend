import axios from 'axios';
import { apiUrl } from '../config';
import type { ApiError } from '../types/credit';

export const client = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

let accessTokenProvider: (() => Promise<string>) | undefined;

export function setAccessTokenProvider(provider: () => Promise<string>): void {
  accessTokenProvider = provider;
}

client.interceptors.request.use(async (config) => {
  if (accessTokenProvider) {
    config.headers.Authorization = `Bearer ${await accessTokenProvider()}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(new Error(describe(error))),
);

function describe(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrió un error inesperado';
  }
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión.';
  }
  if (error.response.status === 401) {
    return 'La sesión expiró. Vuelve a iniciar sesión.';
  }
  const body = error.response.data as ApiError | undefined;
  if (body?.errors?.length) {
    return body.errors.join('. ');
  }
  return body?.message ?? 'Ocurrió un error inesperado';
}
