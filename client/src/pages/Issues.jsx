import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllIssues } from '../services/issueService';

const Issues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const data = await getAllIssues();
            setIssues(data);
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'assigned': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-4">Cargando incidencias...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
                Todas las Incidencias
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {issues.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">No se encontraron incidencias.</li>
                    ) : (
                        issues.map((issue) => (
                            <li key={issue.id}>
                                <Link to={`/issues/${issue.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center truncate">
                                                <p className="text-sm font-medium text-blue-600 truncate mr-2">#{issue.id}</p>
                                                <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {issue.project?.name}
                                                </span>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500 mr-4">
                                                    Prioridad: {issue.priority}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Severidad: {issue.severity}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    Asignado a: {issue.assigned_to_profile?.username || 'Sin asignar'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Issues;
