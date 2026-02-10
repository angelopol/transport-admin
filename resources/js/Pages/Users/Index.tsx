import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'owner';
    phone: string | null;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    users: PaginatedUsers;
    filters: {
        search: string;
    };
}

export default function Index({ users, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('users.index'), { preserveState: true });
    };

    const handleDelete = (user: User) => {
        if (confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Gestión de Usuarios ({users.total})
                    </h2>
                    <Link
                        href={route('users.create')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        + Nuevo Usuario
                    </Link>
                </div>
            }
        >
            <Head title="Usuarios" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Filters */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                            <form onSubmit={onSearch} className="flex gap-2 w-full max-w-md">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Buscar
                                </button>
                            </form>
                        </div>

                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                                }`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Dueño'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.phone || '—'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                href={route('users.edit', user.id)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                            <div className="flex gap-1">
                                {users.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded border ${link.active
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded border border-gray-300 text-gray-400 bg-gray-50"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
