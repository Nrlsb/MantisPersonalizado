import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, updateIssue, getChecklistItems, toggleChecklistItem } from '../services/issueService';
import { getNotesByIssue, createNote } from '../services/noteService';
import { getProfiles } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Tag, AlertTriangle, MessageSquare, Save } from 'lucide-react';

const IssueDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [notes, setNotes] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchIssueData();
        fetchProfiles();
    }, [id]);

    const fetchIssueData = async () => {
        try {
            const [issueData, notesData] = await Promise.all([
                getIssueById(id),
                getNotesByIssue(id)
            ]);

            setIssue(issueData);
            setEditForm(issueData); // Initialize edit form
            setNotes(notesData);

            if (issueData.issue_type === 'checklist') {
                const items = await getChecklistItems(id);
                setChecklistItems(items);
            }
        } catch (error) {
            console.error('Error fetching issue data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfiles = async () => {
        try {
            const data = await getProfiles();
            setProfiles(data);
        } catch (error) {
            console.error('Error fetching profiles', error);
        }
    }

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const updated = await updateIssue(id, { status: newStatus });
            setIssue(prev => ({ ...prev, status: updated.status }));
            setEditForm(prev => ({ ...prev, status: updated.status }));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            const noteData = {
                issue_id: id,
                user_id: user.id,
                note: newNote
            };

            const createdNote = await createNote(noteData);
            setNotes([...notes, createdNote]);
            setNewNote('');
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const handleToggleChecklistItem = async (itemId, currentStatus) => {
        try {
            const updatedItem = await toggleChecklistItem(itemId, !currentStatus);
            setChecklistItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, is_completed: updatedItem.is_completed } : item
            ));
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    };

    const handleUpdateIssue = async () => {
        try {
            const updated = await updateIssue(id, {
                title: editForm.title,
                description: editForm.description,
                priority: editForm.priority,
                severity: editForm.severity,
                assigned_to: editForm.assigned_to
            });
            setIssue(prev => ({ ...prev, ...updated }));
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update issue", error);
        }
    }

    if (loading) return <div className="p-4">Cargando incidencia...</div>;
    if (!issue) return <div className="p-4">Incidencia no encontrada</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white shadow sm:rounded-lg mb-6 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Incidencia #{issue.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Reportado por {issue.created_by_profile?.username || issue.created_by_profile?.email} el {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <select
                            value={issue.status}
                            onChange={handleStatusChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="new">Nueva</option>
                            <option value="assigned">Asignada</option>
                            <option value="resolved">Resuelta</option>
                            <option value="closed">Cerrada</option>
                        </select>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-3 py-2 border border-blue-600 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Editar
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleUpdateIssue}
                                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <Save className="h-4 w-4 mr-1" /> Guardar
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4 py-5 sm:p-6">
                    {!isEditing ? (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{issue.title}</h1>
                            {issue.issue_type === 'standard' ? (
                                <div className="prose max-w-none text-gray-500 mb-6">
                                    <p className="whitespace-pre-wrap">{issue.description}</p>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Lista de Tareas</h4>
                                    <ul className="space-y-3">
                                        {checklistItems.map(item => (
                                            <li key={item.id} className="flex items-start">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.is_completed}
                                                        onChange={() => handleToggleChecklistItem(item.id, item.is_completed)}
                                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <span className={`font-medium ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                        {item.content}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    rows={4}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <AlertTriangle className="mr-1.5 h-4 w-4 text-gray-400" /> Prioridad
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                {!isEditing ? issue.priority.toUpperCase() : (
                                    <select
                                        value={editForm.priority}
                                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">Alta</option>
                                        <option value="immediate">Inmediata</option>
                                    </select>
                                )}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Tag className="mr-1.5 h-4 w-4 text-gray-400" /> Severidad
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {!isEditing ? issue.severity : (
                                    <select
                                        value={editForm.severity}
                                        onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="feature">Característica</option>
                                        <option value="minor">Menor</option>
                                        <option value="major">Mayor</option>
                                        <option value="crash">Crítico</option>
                                    </select>
                                )}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <User className="mr-1.5 h-4 w-4 text-gray-400" /> Asignado a
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {!isEditing ? (issue.assigned_to_profile?.username || 'Sin asignar') : (
                                    <select
                                        value={editForm.assigned_to || ''}
                                        onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="">Sin asignar</option>
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.username || p.email}</option>
                                        ))}
                                    </select>
                                )}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Calendar className="mr-1.5 h-4 w-4 text-gray-400" /> Actualizado
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(issue.updated_at).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Attachments Section */}
            {(issue.evidence_url || issue.log_url) && (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Adjuntos
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            {issue.evidence_url && (
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Evidencia</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <a href={issue.evidence_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                                            Ver Imagen
                                        </a>
                                        <img src={issue.evidence_url} alt="Evidencia" className="mt-2 max-w-full h-auto rounded-lg shadow-sm" />
                                    </dd>
                                </div>
                            )}
                            {issue.log_url && (
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Log</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <a href={issue.log_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                                            Descargar Log
                                        </a>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            )}

            {/* Notes Section */}
            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Discusión
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {notes.map((note) => (
                        <li key={note.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                        {note.user_profile?.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {note.user_profile?.username || note.user_profile?.email}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(note.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {note.note}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <form onSubmit={handleAddNote}>
                        <div>
                            <label htmlFor="note" className="sr-only">Añadir una nota</label>
                            <textarea
                                id="note"
                                name="note"
                                rows="3"
                                className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md border p-2"
                                placeholder="Añadir un comentario..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Comentar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
