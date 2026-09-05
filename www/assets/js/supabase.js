// Importa o cliente do Supabase diretamente via ES Modules
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://bsjyxytfncjjesilcycd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzanl4eXRmbmNqamVzaWxjeWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjI5ODIsImV4cCI6MjEwNDE5ODk4Mn0.igm6TlNkBBEPeI7GfoF2mjpnOHMa9y32KnTfoaiaPXk'

// Cria a conexão que será exportada para os outros arquivos
export const supabase = createClient(supabaseUrl, supabaseKey)