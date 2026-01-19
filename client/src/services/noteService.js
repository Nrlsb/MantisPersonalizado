import { supabase } from '../supabaseClient';

export const getNotesByIssue = async (issueId) => {
    const { data, error } = await supabase
        .from('notes')
        .select('*, user_profile:user_id(username, email)')
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
};

export const createNote = async (note) => {
    const { data, error } = await supabase
        .from('notes')
        .insert([note])
        .select('*, user_profile:user_id(username, email)')
        .single();

    if (error) throw error;
    return data;
};
