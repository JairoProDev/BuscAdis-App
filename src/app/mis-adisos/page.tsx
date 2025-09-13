'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AdisoItem {
  _id: string
  sequentialId?: number
  title: string
  status: string
  category?: string
  createdAt?: string
}

export default function MisAdisosPage() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<AdisoItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'active' | 'expired' | 'pending'>('active')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const res = await fetch('/api/user/adisos')
        const data = await res.json()
        setItems(Array.isArray(data?.adisos) ? data.adisos : [])
      } catch (e) {
        setError('Error cargando tus adisos')
      }
    }
    load()
  }, [user])

  if (loading) return <div className="p-6">Cargando…</div>
  if (!user) return <div className="p-6">Inicia sesión para ver tus adisos.</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  const filtered = items.filter(i =>
    tab === 'active' ? i.status === 'active' : tab === 'expired' ? i.status === 'expired' : i.status === 'pending_review'
  )

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Adisos</h1>
      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-1 rounded ${tab==='active'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('active')}>Activos</button>
        <button className={`px-3 py-1 rounded ${tab==='expired'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('expired')}>Expirados</button>
        <button className={`px-3 py-1 rounded ${tab==='pending'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('pending')}>Pendientes</button>
      </div>
      <div className="grid gap-3">
        {filtered.map(i => (
          <div key={i._id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm text-gray-500">#{i.sequentialId ?? i._id} · {i.category || 'general'} · {i.status}</div>
            </div>
            <div className="flex gap-2">
              <a className="px-2 py-1 bg-gray-100 rounded" href={`/adisos/${i.sequentialId || i._id}/editar`}>Editar</a>
              <button className="px-2 py-1 bg-gray-100 rounded">Archivar</button>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-gray-500">No hay adisos en esta sección.</div>}
      </div>
    </div>
  )
}



