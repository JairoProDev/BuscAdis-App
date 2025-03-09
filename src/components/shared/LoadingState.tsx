import { Spinner } from '@/components/ui/Spinner';

export default function LoadingState({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Spinner size="lg" />
      <p className="mt-4 text-primary-600">{message}</p>
    </div>
  );
}
