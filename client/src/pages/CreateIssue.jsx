import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createIssue, uploadIssueAttachment } from '../services/issueService';
import { getProfiles } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const CreateIssue = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'new',
        priority: 'normal',
        severity: 'minor',
        assigned_to: '',
        issue_type: 'standard', // 'standard' or 'checklist'
    });

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [logFile, setLogFile] = useState(null);
    const [checklistItems, setChecklistItems] = useState(['']); // Start with one empty item

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const data = await getProfiles();
            setProfiles(data);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChecklistItemChange = (index, value) => {
        const newItems = [...checklistItems];
        newItems[index] = value;
        setChecklistItems(newItems);
    };

    const addChecklistItem = () => {
        setChecklistItems([...checklistItems, '']);
    };

    const removeChecklistItem = (index) => {
        const newItems = checklistItems.filter((_, i) => i !== index);
        setChecklistItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let evidenceUrl = null;
            let logUrl = null;

            if (evidenceFile) {
                evidenceUrl = await uploadIssueAttachment(evidenceFile, 'evidence');
            }

            if (logFile) {
                logUrl = await uploadIssueAttachment(logFile, 'logs');
            }

            const issueData = {
                ...formData,
                project_id: projectId,
                created_by: user.id,
                assigned_to: formData.assigned_to || null,
                evidence_url: evidenceUrl,
                log_url: logUrl,
                checklistItems: formData.issue_type === 'checklist' ? checklistItems.filter(item => item.trim() !== '') : [],
            };

            await createIssue(issueData);
            navigate(`/projects/${projectId}`);
        } catch (error) {
            console.error('Error creating issue:', error);
            alert('Failed to create issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-white shadow sm:rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Reportar Incidencia</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Incidencia</label>
                    <div className="mt-1 flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="issue_type"
                                value="standard"
                                checked={formData.issue_type === 'standard'}
                                onChange={handleChange}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Completa</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="issue_type"
                                value="checklist"
                                checked={formData.issue_type === 'checklist'}
                                onChange={handleChange}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Lista de Chequeo (Checklist)</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>

                {formData.issue_type === 'standard' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Evidencia (Imagen)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Log (Archivo)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setLogFile(e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Items del Checklist</label>
                        {checklistItems.map((item, index) => (
                            <div key={index} className="flex mb-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                                    placeholder={`Item ${index + 1}`}
                                    className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {checklistItems.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeChecklistItem(index)}
                                        className="ml-2 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200"
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addChecklistItem}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
                        >
                            + Añadir Item
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="low">Baja</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                            <option value="immediate">Inmediata</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Severidad</label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="feature">Característica</option>
                            <option value="minor">Menor</option>
                            <option value="major">Mayor</option>
                            <option value="crash">Crítico</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asignar a</label>
                        <select
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Sin asignar</option>
                            {profiles.map(profile => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.username || profile.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Incidencia'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateIssue;
