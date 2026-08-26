import { IonButton, IonContent, IonPage, IonSpinner, useIonViewWillEnter } from '@ionic/react';
import { useRef } from 'react';
import { AppHeader } from '../components/AppHeader';
import { FormField } from '../components/FormField';
import { StatusView } from '../components/StatusView';
import { formatCurrency, formatDate, formatRate, formatTerm } from '../format';
import { useCredits } from '../hooks/useCredits';
import type { CreditFilters, SortableField } from '../types/credit';
import './CreditList.css';

const SORT_FIELDS: ReadonlyArray<{ field: SortableField; label: string }> = [
  { field: 'createdAt', label: 'Fecha' },
  { field: 'amount', label: 'Valor' },
];

export default function CreditList() {
  const {
    credits,
    metadata,
    filters,
    setFilters,
    clearFilters,
    sort,
    changeSort,
    page,
    setPage,
    status,
    error,
    reload,
  } = useCredits();

  const alreadyEntered = useRef(false);

  useIonViewWillEnter(() => {
    if (!alreadyEntered.current) {
      alreadyEntered.current = true;
      return;
    }
    void reload();
  });

  const totalPages = metadata?.totalPages ?? 0;
  const hasFilters = Boolean(filters.clientName || filters.document || filters.agentName);

  const updateFilter = (field: keyof CreditFilters) => (value: string) =>
    setFilters((current) => ({ ...current, [field]: value }));

  const directionOf = (field: SortableField) => {
    if (sort === `${field},desc`) {
      return 'descending' as const;
    }
    return sort === `${field},asc` ? ('ascending' as const) : undefined;
  };

  const arrowFor = (field: SortableField) => {
    const direction = directionOf(field);
    if (direction === 'descending') {
      return '↓';
    }
    return direction === 'ascending' ? '↑' : '↕';
  };

  const toggleSort = (field: SortableField) => {
    if (sort === `${field},desc`) {
      changeSort(`${field},asc`);
      return;
    }
    changeSort(sort === `${field},asc` ? undefined : `${field},desc`);
  };

  const sortableHeader = (field: SortableField, label: string) => (
    <th aria-sort={directionOf(field) ?? 'none'}>
      <button type="button" className="credit-table__sort" onClick={() => toggleSort(field)}>
        {label}
        <span className="credit-table__sort-arrow" aria-hidden="true">
          {arrowFor(field)}
        </span>
      </button>
    </th>
  );

  return (
    <IonPage>
      <AppHeader title="Créditos" />
      <IonContent>
        <div className="credit-list">
          <div className="credit-list__filters">
            <FormField
              label="Cliente"
              value={filters.clientName}
              onChange={updateFilter('clientName')}
              placeholder="Buscar por nombre"
            />
            <FormField
              label="Identificación"
              value={filters.document}
              onChange={updateFilter('document')}
              placeholder="Buscar por cédula"
              inputMode="numeric"
            />
            <FormField
              label="Comercial"
              value={filters.agentName}
              onChange={updateFilter('agentName')}
              placeholder="Buscar por comercial"
            />
          </div>

          <div className="credit-list__toolbar">
            <p className="credit-list__count">
              {metadata ? `${metadata.totalElements} créditos encontrados` : ''}
            </p>
            <div className="credit-list__sort-group">
              <span className="credit-list__sort-label">Ordenar por</span>
              {SORT_FIELDS.map(({ field, label }) => (
                <button
                  key={field}
                  type="button"
                  className={
                    directionOf(field)
                      ? 'credit-list__sort-chip credit-list__sort-chip--active'
                      : 'credit-list__sort-chip'
                  }
                  aria-pressed={Boolean(directionOf(field))}
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  <span aria-hidden="true">{arrowFor(field)}</span>
                </button>
              ))}
            </div>
          </div>

          {status === 'loading' && (
            <div className="credit-list__loading">
              <IonSpinner name="crescent" />
            </div>
          )}

          {status === 'error' && (
            <StatusView
              title="No se pudieron cargar los créditos"
              description={error}
              action={
                <IonButton fill="outline" size="small" onClick={reload}>
                  Reintentar
                </IonButton>
              }
            />
          )}

          {status === 'ready' && credits.length === 0 && (
            <StatusView
              title="No hay créditos para mostrar"
              description={
                hasFilters
                  ? 'Ningún crédito coincide con los filtros aplicados.'
                  : 'Registra el primer crédito desde la pestaña Registrar.'
              }
              action={
                hasFilters ? (
                  <IonButton fill="outline" size="small" onClick={clearFilters}>
                    Limpiar filtros
                  </IonButton>
                ) : undefined
              }
            />
          )}

          {status === 'ready' && credits.length > 0 && (
            <div className="credit-table__wrapper">
              <table className="credit-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Identificación</th>
                    {sortableHeader('amount', 'Valor')}
                    <th>Tasa</th>
                    <th>Plazo</th>
                    <th>Comercial</th>
                    {sortableHeader('createdAt', 'Registro')}
                  </tr>
                </thead>
                <tbody>
                  {credits.map((credit) => (
                    <tr key={credit.id}>
                      <td data-label="Cliente">{credit.clientName}</td>
                      <td data-label="Identificación">{credit.clientDocument}</td>
                      <td data-label="Valor" className="credit-table__amount">
                        {formatCurrency(credit.amount)}
                      </td>
                      <td data-label="Tasa">{formatRate(credit.interestRate)}</td>
                      <td data-label="Plazo">{formatTerm(credit.termMonths)}</td>
                      <td data-label="Comercial">{credit.agentName}</td>
                      <td data-label="Registro">{formatDate(credit.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {status === 'ready' && totalPages > 1 && (
            <div className="credit-list__pagination">
              <IonButton
                fill="outline"
                size="small"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </IonButton>
              <p className="credit-list__page-label">
                Página {page + 1} de {totalPages}
              </p>
              <IonButton
                fill="outline"
                size="small"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
