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
    const { checklistItems, ...issueDataProp } = issue;

    const { data, error } = await supabase
        .from('issues')
        .insert([issueDataProp])
        .select()
        .single();

    if (error) throw error;

    if (checklistItems && checklistItems.length > 0) {
        const itemsToInsert = checklistItems.map(item => ({
            issue_id: data.id,
            content: item,
            is_completed: false
        }));

        const { error: checklistError } = await supabase
            .from('checklist_items')
            .insert(itemsToInsert);

        if (checklistError) console.error('Error creating checklist items:', checklistError);
    }

    return data;
};

export const getChecklistItems = async (issueId) => {
    const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('issue_id', issueId)
        .order('id', { ascending: true });

    if (error) throw error;
    return data;
};

export const toggleChecklistItem = async (itemId, isCompleted) => {
    const { data, error } = await supabase
        .from('checklist_items')
        .update({ is_completed: isCompleted })
        .eq('id', itemId)
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

export const uploadIssueAttachment = async (file, folder = 'misc') => {
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase
        .storage
        .from('issue-attachments')
        .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase
        .storage
        .from('issue-attachments')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const updateIssueChecklist = async (issueId, newItems) => {
    // 1. Get current items to find deletions
    const currentItems = await getChecklistItems(issueId);
    const splitItems = {
        toUpdate: [],
        toInsert: [],
        toDelete: []
    };

    const newIds = new Set(newItems.filter(i => i.id).map(i => i.id));

    // Find items to delete
    splitItems.toDelete = currentItems
        .filter(item => !newIds.has(item.id))
        .map(item => item.id);

    // Split newItems into update and insert
    newItems.forEach(item => {
        if (item.id) {
            splitItems.toUpdate.push({
                id: item.id,
                content: item.content,
                is_completed: item.is_completed // Preserve or update status
            });
        } else {
            splitItems.toInsert.push({
                issue_id: issueId,
                content: item.content,
                is_completed: false // Default for new items
            });
        }
    });

    // Execute operations
    if (splitItems.toDelete.length > 0) {
        const { error } = await supabase
            .from('checklist_items')
            .delete()
            .in('id', splitItems.toDelete);
        if (error) throw error;
    }

    if (splitItems.toUpdate.length > 0) {
        for (const item of splitItems.toUpdate) {
            const { error } = await supabase
                .from('checklist_items')
                .update({ content: item.content, is_completed: item.is_completed })
                .eq('id', item.id);
            if (error) throw error;
        }
    }

    if (splitItems.toInsert.length > 0) {
        const { error } = await supabase
            .from('checklist_items')
            .insert(splitItems.toInsert);
        if (error) throw error;
    }

    return await getChecklistItems(issueId);
};
