import type { FormCatalogs, FormValues } from '../../domain/formTypes';

/**
 * Local catalogs for the template. No remote I/O: a real product
 * replaces this repository with one that talks to its service.
 */
export class FormRepository {
  getCatalogs(): FormCatalogs {
    return {
      types: [
        { label: 'Persona natural', value: 'natural' },
        { label: 'Persona jurídica', value: 'juridica' },
      ],
      cities: [
        { label: 'Bogotá', value: 'bogota' },
        { label: 'Medellín', value: 'medellin' },
        { label: 'Cali', value: 'cali' },
        { label: 'Barranquilla', value: 'barranquilla' },
        { label: 'Bucaramanga', value: 'bucaramanga' },
      ],
      interests: [
        { label: 'Notificaciones', value: 'notificaciones' },
        { label: 'Reportes', value: 'reportes' },
        { label: 'Capacitaciones', value: 'capacitaciones' },
      ],
      priorities: [
        { label: 'Baja', value: 'baja' },
        { label: 'Media', value: 'media' },
        { label: 'Alta', value: 'alta' },
      ],
    };
  }

  saveDraft(values: FormValues): void {
    void values;
  }
}
