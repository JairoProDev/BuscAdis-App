import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const REVERSE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Mapeo de tipos de componentes de dirección de Google a nuestra jerarquía
const componentMap: Record<string, 'country' | 'department' | 'province' | 'district'> = {
    'country': 'country',
    'administrative_area_level_1': 'department',
    'administrative_area_level_2': 'province',
    'locality': 'district',
    'sublocality_level_1': 'district', // A veces el distrito está aquí
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API key is not configured. Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in your .env.local file.");
        return NextResponse.json({ error: 'Configuration error: The server is missing the required API key for location services.' }, { status: 500 });
    }

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    try {
        const response = await fetch(`${REVERSE_GEOCODE_URL}?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=es`);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Google Maps API Error:', data.status, data.error_message);
            return NextResponse.json({ error: 'Failed to fetch location data from Google Maps', details: data.status }, { status: 502 });
        }
        
        // El primer resultado suele ser el más específico/preciso
        const result = data.results[0];
        if (!result) {
            return NextResponse.json({ error: 'No location found for the provided coordinates' }, { status: 404 });
        }

        const location: Record<string, any> = {
            country: null,
            department: null,
            province: null,
            district: null,
        };

        // Extraemos los componentes de la dirección y los mapeamos a nuestra estructura
        result.address_components.forEach((component: any) => {
            const componentType = component.types[0];
            if (componentMap[componentType]) {
                const ourType = componentMap[componentType];
                // Tomamos el primer valor que encontremos para cada tipo
                if (!location[ourType]) {
                    location[ourType] = {
                        name: component.long_name,
                        // El 'id' de Google no coincide con nuestro sistema, lo dejamos como null
                        // Nuestro frontend deberá buscar el ID correspondiente por nombre
                        id: null 
                    };
                }
            }
        });

        return NextResponse.json({ location });

    } catch (error) {
        console.error('Reverse geocoding internal error:', error);
        return NextResponse.json({ error: 'An internal server error occurred during geocoding.' }, { status: 500 });
    }
} 