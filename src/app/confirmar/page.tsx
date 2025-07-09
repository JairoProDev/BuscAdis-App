'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function ConfirmarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const handleConfirmEmail = async () => {
    if (!token || !email) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      if (response.ok) {
        // Email confirmed successfully
        router.push('/login?message=email-confirmed')
      } else {
        // Handle error
        router.push('/login?error=confirmation-failed')
      }
    } catch (error) {
      console.error('Error confirming email:', error)
      router.push('/login?error=confirmation-failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Enlace inválido
            </h2>
            <p className="mt-2 text-gray-600">
              El enlace de confirmación no es válido o ha expirado.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="mt-4"
            >
              Volver al login
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Confirmar email
          </h2>
          <p className="mt-2 text-gray-600">
            ¿Deseas confirmar tu dirección de email?
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {email}
          </p>
          <div className="mt-6 space-y-3">
            <Button
              onClick={handleConfirmEmail}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Confirmando...' : 'Confirmar email'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
