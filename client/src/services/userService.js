import { supabase } from '../supabaseClient';

export const getProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email')
        .order('username');

    if (error) throw error;
    return data;
};
