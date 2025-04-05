import clientPromise from '@/lib/mongodb';

export class AuthService {
    private static async getCollection() {
        const client = await clientPromise;
        const db = client.db('test');
        return db.collection('users');
    }

    static async register({ firstName, lastName, phone, dni }) {
        try {
            const users = await this.getCollection();
            
            // Check if user already exists
            const existingUser = await users.findOne({ phone });
            if (existingUser) {
                return { data: null, error: 'El número de teléfono ya está registrado' };
            }
            
            const userData = {
                phone,
                dni,
                firstName,
                lastName,
                createdAt: Date.now(),
            };
            
            await users.insertOne(userData);
            return { data: { message: 'Usuario registrado correctamente' }, error: null };
        } catch (error) {
            console.error('Error en registro:', error);
            return { data: null, error };
        }
    }

    static async login({ phone, dni }) {
        try {
            const users = await this.getCollection();
            
            const user = await users.findOne({ phone, dni });

            if (user) {
                return { data: user, error: null };
            } else {
                return { data: null, error: 'Credenciales incorrectas' };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { data: null, error };
        }
    }
}