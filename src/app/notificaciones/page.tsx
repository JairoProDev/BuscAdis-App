import React from 'react';

export default function NotificacionesPage() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-5xl mb-4 animate-bounce">🔔</div>
      <h1 className="text-3xl font-bold mb-2 text-cyan-600">Tus Notificaciones</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Aquí verás todas las novedades, alertas y notificaciones importantes de tu cuenta y tus adisos.<br/>
        ¡Mantente atento para no perderte nada!
      </p>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 shadow text-center">
        <span className="text-lg text-slate-500">Aún no tienes notificaciones.<br/>¡Sigue participando para recibir novedades!</span>
      </div>
    </div>
  );
} 