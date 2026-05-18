import React from 'react';
import { useAuth } from '@/contexts/useAuth';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboardPage from './AdminDashboardPage';
import AdminSidebar from './components/AdminSidebar';
import ManageArticlesPage from './ManageArticlesPage';
import EditArticlePage from './EditArticlePage';
import MediaLibraryPage from './MediaLibraryPage';
import AiGeneratorPage from './AiGeneratorPage';
import AdminSettingsPage from './AdminSettingsPage';
import ManageProductsPage from './ManageProductsPage';
import EditProductPage from './EditProductPage';
import SalesPage from './SalesPage';
import ManageUsersPage from './ManageUsersPage';
import ManageImagesPage from './ManageImagesPage'; // New
import ManageVideosPage from './ManageVideosPage'; // New

const AdminLayout = ({ page, onNavigate, params }) => {
    const { user, profile, loading, isAdmin } = useAuth();

    if (loading) {
        return <div className="auth-shell text-white">Loading Admin...</div>;
    }

    if (!user || !profile) {
        return <AdminLoginPage onNavigate={onNavigate} />;
    }
    
    if (!isAdmin) {
        return <AdminLoginPage onNavigate={onNavigate} />;
    }

    const renderAdminPage = () => {
        const adminPage = page.split('/')[1] || 'dashboard';
        const action = page.split('/')[2];
        
        switch (adminPage) {
            case 'articles':
                if (action === 'edit') return <EditArticlePage onNavigate={onNavigate} articleId={params.id} />;
                if (action === 'new') return <EditArticlePage onNavigate={onNavigate} />;
                return <ManageArticlesPage onNavigate={onNavigate} />;
            case 'products':
                if (action === 'edit') return <EditProductPage onNavigate={onNavigate} productId={params.id} />;
                if (action === 'new') return <EditProductPage onNavigate={onNavigate} />;
                return <ManageProductsPage onNavigate={onNavigate} />;
            case 'images': // New
                return <ManageImagesPage onNavigate={onNavigate} />;
            case 'videos': // New
                return <ManageVideosPage onNavigate={onNavigate} />;
            case 'sales':
                return <SalesPage onNavigate={onNavigate} />;
            case 'media':
                return <MediaLibraryPage onNavigate={onNavigate} />;
            case 'ai-generator':
                 return <AiGeneratorPage onNavigate={onNavigate} />;
            case 'users':
                return <ManageUsersPage onNavigate={onNavigate} />;
            case 'settings':
                return <AdminSettingsPage onNavigate={onNavigate} />;
            case 'dashboard':
            default:
                return <AdminDashboardPage onNavigate={onNavigate} />;
        }
    };

    return (
        <div className="admin-shell flex min-h-screen flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
            <AdminSidebar onNavigate={onNavigate} currentPage={page.split('/')[1] || 'dashboard'} />
            <main className="flex-1 overflow-y-auto">
                <div className="admin-panel min-h-full p-5 sm:p-6 lg:min-h-[calc(100vh-3rem)] lg:p-8">
                    {renderAdminPage()}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
