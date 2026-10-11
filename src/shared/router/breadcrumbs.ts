export const breadcrumbsByRoute: Record<
  string,
  { label: string; parent?: string }
> = {
  '/': { label: 'Inicio' },
  '/home/': { label: 'Inicio', parent: '/' },
  '/afiliados/': { label: 'Afiliados', parent: '/home/' },
  '/pagos/': { label: 'Pagos', parent: '/home/' },
  '/beneficios/': { label: 'Beneficios', parent: '/home/' },
  '/beneficios/entregas/': { label: 'Entregas', parent: '/beneficios/' },
  '/perfiles/': { label: 'Perfiles', parent: '/home/' },
  '/usuarios/': { label: 'Usuarios', parent: '/home/' },
  '/roles/': { label: 'Roles', parent: '/home/' },
  '/parametros/': { label: 'Parámetros', parent: '/home/' },
};
