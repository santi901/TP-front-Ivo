import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwyhgkdbkjojwebrvyuc.supabase.co';
const supabaseKey = 'sb_publishable_B7dAu9sGtNHw96uWODSf5A_35PKXHG9';

export const supabase = createClient(supabaseUrl, supabaseKey);