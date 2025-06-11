'use client'

import { usePathname } from 'next/navigation'
import GlobalSearchBar from './GlobalSearchBar'

export default function ConditionalSearchBar() {
  const pathname = usePathname()
  
  // No mostrar el GlobalSearchBar en la página de búsqueda
  if (pathname === '/buscar') {
    return null
  }
  
  return <GlobalSearchBar />
} 