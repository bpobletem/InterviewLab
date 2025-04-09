// Configurar variables de entorno para las pruebas
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:54322/postgres';