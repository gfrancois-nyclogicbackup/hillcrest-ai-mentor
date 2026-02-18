import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbqgmvshxkhkrhoxvyws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicWdtdnNoeGtoa3Job3h2eXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjU2MDksImV4cCI6MjA4Njk0MTYwOX0.JsySVF_HUpkzxxNokNITdujeoCfTeWut2SxuNhjWK_w';

export const supabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
