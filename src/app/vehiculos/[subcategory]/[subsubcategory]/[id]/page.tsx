"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import VehiculoDetail from "@/components/publications/dedicated/categories/VehiculoDetail";
import { WhatsAppIcon } from '@/components/icons';
import { ShareIcon, FlagIcon } from '@heroicons/react/24/outline';
import type { PublicationDocument } from '@/types/api';
import { normalizePublicationData } from '@/utils/publications';

export default function VehiculoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [publication, setPublication] = useState<PublicationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/publications/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPublication(data.publication);
        setError(!data.publication);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && publication) {
      try {
        await navigator.share({
          title: publication.title || 'Vehículo en BuscaDis',
          text: publication.description || 'Mira este vehículo en BuscaDis',
          url: window.location.href
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleBack = () => router.back();

  const formatWhatsAppMessage = () => {
    if (!publication) return '';
    return encodeURIComponent(`Hola, estoy interesado en el vehículo "${publication.title}" que tienes en BuscaDis.`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }
  if (error || !publication) {
    return <div className="flex items-center justify-center min-h-screen">No se encontró la publicación.</div>;
  }

  // Adapt publication to PublicationData
  const normalizedPublication = normalizePublicationData(publication);

  const whatsapp = normalizedPublication.whatsapp;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="mr-1">←</span> Volver
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            <VehiculoDetail publication={normalizedPublication} />
          </div>
          {/* Panel lateral derecho */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Contactar</h2>
              <div className="space-y-3">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${formatWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
                  >
                    <WhatsAppIcon className="w-5 h-5 mr-2" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 space-y-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-gray-200"
              >
                <ShareIcon className="w-5 h-5 mr-2" /> Compartir
              </button>
              <button
                className="flex items-center justify-center w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium transition-all shadow-sm border border-red-100"
              >
                <FlagIcon className="w-5 h-5 mr-2" /> Reportar Aviso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 