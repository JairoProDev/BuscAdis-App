'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import DedicatedPublicationPage from '@/components/publications/dedicated/DedicatedPublicationPage'
import { PublicationData } from '@/types/publication'

export default function AdisoDetailPage() {
  const params = useParams() as { sequentialId?: string; slug?: string }
  const [publication, setPublication] = useState<PublicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const id = params?.sequentialId
        if (!id) {
          setError('ID inválido')
          return
        }
        // Track detail view once
        fetch(`/api/adisos/${encodeURIComponent(id)}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'detailView' })
        }).catch(() => {})
        const res = await fetch(`/api/publications/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('No se pudo cargar el adiso')
        const data = await res.json()
        if (data?.publication) {
          const p = data.publication
          const pub: PublicationData = {
            id: String(p._id || p.id || p.sequentialId),
            title: p.title,
            description: p.description || '',
            categorySlug: p.category || p.categorySlug || 'general',
            subcategorySlug: null,
            subSubcategorySlug: null,
            transactionType: 'venta',
            value: p.pricing?.amount || p.amount || 0,
            currency: p.pricing?.currency || p.currency || 'PEN',
            valueType: 'total',
            size: 0,
            location: {
              district: p.location?.district || '',
              province: p.location?.province || p.location?.department || '',
              city: p.location?.city || '',
              country: p.location?.countryCode || 'PE'
            },
            images: Array.isArray(p.media) && p.media.length > 0 ? p.media.filter((m: any) => m?.type === 'image').map((m: any) => m.url) : (Array.isArray(p.images) ? p.images : []),
            whatsapp: p.contactInfo?.phone || '',
            createdAt: p.publicationDate || p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt,
            views: p.metrics?.views || 0,
            featured: false,
            premium: p.premium || false,
            attributes: p.attributes || {}
          }
          setPublication(pub)
        } else {
          setError('Adiso no encontrado')
        }
      } catch (error) {
        console.error('Error loading publication:', error);
        setError('Error cargando adiso');
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params?.sequentialId])

  if (loading) return <div className="p-8">Cargando…</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!publication) return null

  return <DedicatedPublicationPage publication={publication} />
}


