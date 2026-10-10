'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSessionStore } from '@/core/store/useSessionStore';
import { FormService } from '../domain/formService';
import type { FormErrors, FormValues } from '../domain/formTypes';

export function useFormViewModel() {
  const service = useMemo(() => new FormService(), []);
  const catalogs = useMemo(() => service.getCatalogs(), [service]);
  const setToast = useSessionStore((state) => state.setToast);

  const [values, setValues] = useState<FormValues>(() => service.createEmpty());
  const [errors, setErrors] = useState<FormErrors>({});

  const patch = (partial: Partial<FormValues>) => {
    setValues((current) => ({ ...current, ...partial }));
  };

  const onChangeFullName = (event: ChangeEvent<HTMLInputElement>) => {
    patch({ fullName: event.target.value });
  };

  const onChangeDocumentId = (event: ChangeEvent<HTMLInputElement>) => {
    patch({ documentId: event.target.value });
  };

  const onChangeDate = (event: ChangeEvent<HTMLInputElement>) => {
    patch({ date: event.target.value });
  };

  const onChangeType = (type: string | number) => {
    patch({ type: String(type) });
  };

  const onChangeCity = (city: string | number) => {
    patch({ city: String(city) });
  };

  const onChangeInterests = (event: {
    target: { value: string | Array<string | number> };
  }) => {
    const next = event.target.value;
    patch({
      interests: typeof next === 'string' ? next.split(',') : next.map(String),
    });
  };

  const onChangePriority = (event: ChangeEvent<HTMLInputElement>) => {
    patch({ priority: event.target.value });
  };

  const onChangeNotes = (event: ChangeEvent<HTMLInputElement>) => {
    patch({ notes: event.target.value });
  };

  const onChangeAcceptsTerms = (acceptsTerms: boolean) => {
    patch({ acceptsTerms });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = service.submit(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setToast({
      show: true,
      icon: 'checkmark-circle',
      title: 'Formulario enviado',
      description:
        'Los datos se validaron en el cliente. Esta plantilla no llama a un servicio remoto.',
    });
  };

  const onReset = () => {
    setValues(service.createEmpty());
    setErrors({});
  };

  return {
    values,
    errors,
    catalogs,
    onChangeFullName,
    onChangeDocumentId,
    onChangeDate,
    onChangeType,
    onChangeCity,
    onChangeInterests,
    onChangePriority,
    onChangeNotes,
    onChangeAcceptsTerms,
    onSubmit,
    onReset,
  };
}
