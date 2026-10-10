'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useUserStore } from '@/core/store/useUserStore';
import { setLastActivityTime } from '@/core/utils/sessionTimeout';
import { LoginService } from '@/features/login/domain/loginService';
import {
  emptyCredentials,
  type LoginCredentials,
  type LoginErrors,
} from '@/features/login/domain/loginTypes';

const FALLBACK_ERROR = 'No pudimos iniciar sesión. Intenta de nuevo.';

export function useLoginViewModel() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const service = useMemo(() => new LoginService(), []);

  const [values, setValues] = useState<LoginCredentials>(emptyCredentials);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, email: event.target.value }));
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, password: event.target.value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      const result = await service.signIn(values);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      setUser(result.user);
      setLastActivityTime();
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
    onChangeEmail,
    onChangePassword,
    onSubmit,
  };
}
