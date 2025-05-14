import React from 'react';

export default function MensajesPage() {
  return (
    <div className="container py-12 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-5xl mb-4 animate-bounce">💬</div>
      <h1 className="text-3xl font-bold mb-2 text-teal-600">Tus Mensajes</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Aquí aparecerán los mensajes y chats con otros usuarios. ¡Conecta, negocia y haz nuevos amigos en BuscAdis!<br/>
        Pronto podrás enviar y recibir mensajes directos de manera segura y divertida.
      </p>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 shadow text-center">
        <span className="text-lg text-slate-500">Aún no tienes mensajes.<br/>¡Empieza a interactuar con la comunidad!</span>
      </div>
    </div>
  );
} 