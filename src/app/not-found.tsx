// src/app/not-found.tsx
'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '5rem', textAlign: 'center' }}>
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link href="/" style={{ color: 'blue' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
