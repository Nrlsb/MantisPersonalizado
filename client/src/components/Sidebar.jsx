import { Link, useLocation } from 'react-router-dom';
import { Home, Folder, List, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Proyectos', href: '/projects', icon: Folder },
    { name: 'Incidencias', href: '/issues', icon: List },
    //   { name: 'Configuración', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
    const location = useLocation();
    const { signOut, user } = useAuth();

    return (
        <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <h1 className="text-xl font-bold text-white tracking-wider">MANTIS</h1>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-300',
                                        'mr-3 flex-shrink-0 h-6 w-6'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
                <div className="flex-shrink-0 w-full group block">
                    <div className="flex items-center">
                        <div className="inline-block h-9 w-9 rounded-full bg-gray-500 flex items-center justify-center text-white">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-gray-300 truncate">
                                {user?.email}
                            </p>
                            <button
                                onClick={() => signOut()}
                                className="text-xs font-medium text-gray-500 group-hover:text-gray-300 flex items-center mt-1"
                            >
                                <LogOut className="mr-1 h-3 w-3" /> Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
