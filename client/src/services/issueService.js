import { supabase } from '../supabaseClient';
import { getProfiles } from './userService';

const mapProfilesToIssues = (issues, profiles) => {
    const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
    }, {});

    return issues.map(issue => ({
        ...issue,
        created_by_profile: profileMap[issue.created_by] || null,
        assigned_to_profile: profileMap[issue.assigned_to] || null,
    }));
};

export const getIssuesByProject = async (projectId) => {
    const { data: issues, error } = await supabase
        .from('issues')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const profiles = await getProfiles();
    return mapProfilesToIssues(issues, profiles);
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
    const { data: issue, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    const profiles = await getProfiles();
    const [enrichedIssue] = mapProfilesToIssues([issue], profiles);
    return enrichedIssue;
};

export const getAllIssues = async () => {
    const { data: issues, error } = await supabase
        .from('issues')
        .select(`
        *,
        project:projects(name)
      `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const profiles = await getProfiles();
    return mapProfilesToIssues(issues, profiles);
};
