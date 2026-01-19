import { supabase } from '../supabaseClient';

export const getIssuesByProject = async (projectId) => {
    const { data, error } = await supabase
        .from('issues')
        .select(`
      *,
      created_by_profile:profiles!created_by(email, username),
      assigned_to_profile:profiles!assigned_to(email, username)
    `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createIssue = async (issue) => {
    const { data, error } = await supabase
        .from('issues')
        .insert([issue])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateIssue = async (id, updates) => {
    const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getIssueById = async (id) => {
    const { data, error } = await supabase
        .from('issues')
        .select(`
      *,
      created_by_profile:profiles!created_by(username, email),
      assigned_to_profile:profiles!assigned_to(username, email)
    `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const getAllIssues = async () => {
    const { data, error } = await supabase
        .from('issues')
        .select(`
        *,
        project:projects(name),
        created_by_profile:profiles!created_by(email, username),
        assigned_to_profile:profiles!assigned_to(email, username)
      `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};
