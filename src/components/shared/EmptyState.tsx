export default function EmptyState({ message = 'No hay contenido disponible', icon = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon}
      <h3 className="text-lg font-medium text-primary-600 mt-4">{message}</h3>
    </div>
  );
}
