export default function ErrorState({ message = 'Ocurrió un error', retry = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 text-red-500 mb-4">
        {/* Icono de error */}
      </div>
      <h3 className="text-lg font-medium text-red-600">{message}</h3>
      {retry && (
        <button 
          onClick={retry}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Intentar nuevamente
        </button>
      )}
    </div>
  );
}
