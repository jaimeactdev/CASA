import { describe, expect, it, vi } from 'vitest';
import { FormService } from './formService';
import { emptyFormValues, validateForm } from './formTypes';

function validValues() {
  return {
    ...emptyFormValues(),
    fullName: 'Ana Pérez',
    documentId: '123456',
    date: '2026-01-15',
    type: 'natural',
    city: 'bogota',
    interests: ['reportes'],
    priority: 'media',
    acceptsTerms: true,
  };
}

describe('validateForm', () => {
  it('requires the mandatory fields', () => {
    const errors = validateForm(emptyFormValues());
    expect(errors.fullName).toBeTruthy();
    expect(errors.documentId).toBeTruthy();
    expect(errors.date).toBeTruthy();
    expect(errors.type).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.interests).toBeTruthy();
    expect(errors.priority).toBeTruthy();
    expect(errors.acceptsTerms).toBeTruthy();
  });

  it('accepts a complete record', () => {
    expect(validateForm(validValues())).toEqual({});
  });
});

describe('FormService', () => {
  it('does not persist when validation fails', () => {
    const repo = {
      getCatalogs: vi.fn(),
      saveDraft: vi.fn(),
    };
    const service = new FormService(repo as never);
    const result = service.submit(emptyFormValues());

    expect(result.ok).toBe(false);
    expect(repo.saveDraft).not.toHaveBeenCalled();
  });

  it('saves a local draft when the form is valid', () => {
    const repo = {
      getCatalogs: vi.fn(),
      saveDraft: vi.fn(),
    };
    const service = new FormService(repo as never);
    const values = validValues();
    const result = service.submit(values);

    expect(result).toEqual({ ok: true });
    expect(repo.saveDraft).toHaveBeenCalledWith(values);
  });
});
