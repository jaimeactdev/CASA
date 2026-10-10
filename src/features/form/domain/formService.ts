import { FormRepository } from '../data/repositories/FormRepository';
import {
  emptyFormValues,
  validateForm,
  type FormSubmitResult,
  type FormValues,
} from './formTypes';

export class FormService {
  constructor(private readonly repository = new FormRepository()) {}

  getCatalogs() {
    return this.repository.getCatalogs();
  }

  createEmpty() {
    return emptyFormValues();
  }

  submit(values: FormValues): FormSubmitResult {
    const errors = validateForm(values);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    this.repository.saveDraft(values);
    return { ok: true };
  }
}
