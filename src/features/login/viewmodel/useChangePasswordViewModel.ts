'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { LoginService } from '@/features/login/domain/loginService';
import {
  emptyChangePasswordValues,
  type ChangePasswordErrors,
  type ChangePasswordValues,
} from '@/features/login/domain/changePasswordTypes';

const FALLBACK_ERROR = 'No pudimos cambiar la clave. Intenta de nuevo.';

export function useChangePasswordViewModel() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const service = useMemo(() => new LoginService(), []);

  const [values, setValues] = useState<ChangePasswordValues>(
    emptyChangePasswordValues,
  );
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange =
    (field: keyof ChangePasswordValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      const result = await service.changePassword(values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      setUser(result.user);
      router.push('/home');
    } catch (error) {
      const message = (error as { message?: string } | null)?.message;
      setFormError(message?.trim() || FALLBACK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    formError,
    isSubmitting,
    onChangeCurrent: onChange('currentPassword'),
    onChangeNew: onChange('newPassword'),
    onChangeConfirm: onChange('confirmPassword'),
    onSubmit,
  };
}
