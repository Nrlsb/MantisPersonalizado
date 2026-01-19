import { supabase } from '../supabaseClient';

export const getProjects = async () => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createProject = async (project) => {
    const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getProjectById = async (id) => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};
