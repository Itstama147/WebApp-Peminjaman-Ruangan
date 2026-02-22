import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ysayleijnbuasprxmkpn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYXlsZWlqbmJ1YXNwcnhta3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NDE1MDEsImV4cCI6MjA4NzMxNzUwMX0.dua7h9StNpyXqdNQU0NB8bTxzDIe_04YGydaI64yZb0'
export const supabase = createClient(supabaseUrl, supabaseKey)
