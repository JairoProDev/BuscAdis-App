import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kfamkhpxikqujvqjdrsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYW1raHB4aWtxdWp2cWpkcnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjIzNTEsImV4cCI6MjA1NjkzODM1MX0.g6Z3ThMg-pWtre7ry-4UQIRlfigmC0ZJF1AKvPiEOlo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
