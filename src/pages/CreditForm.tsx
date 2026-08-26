import { IonButton, IonContent, IonPage, IonToast } from '@ionic/react';
import { useState } from 'react';
import { createCredit } from '../api/credits';
import { AppHeader } from '../components/AppHeader';
import { FormField } from '../components/FormField';
import './CreditForm.css';

interface FormValues {
  clientName: string;
  clientDocument: string;
  amount: string;
  interestRate: string;
  termMonths: string;
  agentName: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  clientName: '',
  clientDocument: '',
  amount: '',
  interestRate: '',
  termMonths: '',
  agentName: '',
};

const DOCUMENT_PATTERN = /^[0-9]{6,20}$/;
const DECIMAL_PATTERN = /^[0-9]+([.][0-9]{1,2})?$/;
const INTEGER_PATTERN = /^[0-9]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_AMOUNT = 9999999999999.99;
const MAX_RATE = 999.99;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.clientName.trim()) {
    errors.clientName = 'El nombre del cliente es obligatorio';
  } else if (values.clientName.trim().length > MAX_NAME_LENGTH) {
    errors.clientName = `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres`;
  }

  if (!values.clientDocument.trim()) {
    errors.clientDocument = 'La cédula o identificación es obligatoria';
  } else if (!DOCUMENT_PATTERN.test(values.clientDocument.trim())) {
    errors.clientDocument = 'Debe tener entre 6 y 20 dígitos, sin puntos ni espacios';
  }

  if (!values.amount.trim()) {
    errors.amount = 'El valor del crédito es obligatorio';
  } else if (!DECIMAL_PATTERN.test(values.amount.trim())) {
    errors.amount = 'Usa solo números, con máximo 2 decimales';
  } else if (Number(values.amount) <= 0) {
    errors.amount = 'El valor debe ser mayor que cero';
  } else if (Number(values.amount) > MAX_AMOUNT) {
    errors.amount = 'El valor supera el máximo permitido';
  }

  if (!values.interestRate.trim()) {
    errors.interestRate = 'La tasa de interés es obligatoria';
  } else if (!DECIMAL_PATTERN.test(values.interestRate.trim())) {
    errors.interestRate = 'Usa solo números positivos, con máximo 2 decimales';
  } else if (Number(values.interestRate) > MAX_RATE) {
    errors.interestRate = `La tasa no puede superar ${MAX_RATE}`;
  }

  if (!values.termMonths.trim()) {
    errors.termMonths = 'El plazo en meses es obligatorio';
  } else if (!INTEGER_PATTERN.test(values.termMonths.trim())) {
    errors.termMonths = 'El plazo debe ser un número entero de meses';
  } else if (Number(values.termMonths) <= 0) {
    errors.termMonths = 'El plazo debe ser mayor que cero';
  }

  if (!values.agentName.trim()) {
    errors.agentName = 'El nombre del comercial es obligatorio';
  } else if (values.agentName.trim().length > MAX_NAME_LENGTH) {
    errors.agentName = `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres`;
  }

  return errors;
}

export default function CreditForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackFailed, setFeedbackFailed] = useState(false);

  const update = (field: keyof FormValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async () => {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await createCredit({
        clientName: values.clientName.trim(),
        clientDocument: values.clientDocument.trim(),
        amount: Number(values.amount),
        interestRate: Number(values.interestRate),
        termMonths: Number(values.termMonths),
        agentName: values.agentName.trim(),
      });
      setValues(EMPTY_FORM);
      setFeedbackFailed(false);
      setFeedback('Crédito registrado correctamente');
    } catch (cause) {
      setFeedbackFailed(true);
      setFeedback(cause instanceof Error ? cause.message : 'No se pudo registrar el crédito');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <AppHeader title="Registrar crédito" />
      <IonContent>
        <div className="credit-form">
          <p className="credit-form__intro">
            Completa los datos del crédito. Se enviará una notificación por correo al registrarlo.
          </p>

          <FormField
            label="Nombre del cliente"
            value={values.clientName}
            onChange={update('clientName')}
            error={errors.clientName}
            placeholder="Pepito Perez"
            maxlength={MAX_NAME_LENGTH}
          />
          <FormField
            label="Cédula o identificación"
            value={values.clientDocument}
            onChange={update('clientDocument')}
            error={errors.clientDocument}
            placeholder="79452188"
            inputMode="numeric"
            maxlength={20}
          />
          <FormField
            label="Valor del crédito"
            value={values.amount}
            onChange={update('amount')}
            error={errors.amount}
            placeholder="7800000"
            inputMode="decimal"
          />
          <FormField
            label="Tasa de interés (%)"
            value={values.interestRate}
            onChange={update('interestRate')}
            error={errors.interestRate}
            placeholder="2"
            inputMode="decimal"
          />
          <FormField
            label="Plazo en meses"
            value={values.termMonths}
            onChange={update('termMonths')}
            error={errors.termMonths}
            placeholder="10"
            inputMode="numeric"
          />
          <FormField
            label="Comercial"
            value={values.agentName}
            onChange={update('agentName')}
            error={errors.agentName}
            placeholder="Carolina Restrepo"
            maxlength={MAX_NAME_LENGTH}
          />

          <IonButton
            className="credit-form__submit"
            expand="block"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? 'Registrando…' : 'Registrar crédito'}
          </IonButton>
        </div>

        <IonToast
          isOpen={feedback !== ''}
          message={feedback}
          duration={3000}
          cssClass={feedbackFailed ? 'fya-toast--error' : 'fya-toast--ok'}
          onDidDismiss={() => setFeedback('')}
        />
      </IonContent>
    </IonPage>
  );
}
