import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

export async function middleware(req: NextRequest) {
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/publicar', '/mis-adisos', '/perfil'];
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Obtener tokens de las cookies
    const idToken = req.cookies.get('idToken')?.value;
    
    // Verificar si el token existe y no está expirado
    if (!idToken || isTokenExpired(idToken)) {
      // En lugar de redirigir, permitimos que la página se cargue
      // El componente de la página manejará mostrar el modal de login
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/publicar/:path*',
    '/mis-adisos/:path*',
    '/perfil/:path*',
  ],
};
