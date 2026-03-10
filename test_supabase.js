import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gccvvzcznjxgwyqhjngm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3Z2emN6bmp4Z3d5cWhqbmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTIzMTQsImV4cCI6MjA2MTAyODMxNH0.c2AuOZ_zMHJgONpYyroeDrJQC31MdmqZkb6_fsEVJks';

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
    const { data, error } = await supabase
        .from('userscore')
        .insert([
            {
                username: 'test_user',
                game_log_data: []
            }
        ]);

    console.log("Error:", error);
    console.log("Data:", data);
}

testInsert();
