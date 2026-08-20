import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Plus, RefreshCw, Copy, CheckCircle, Shield } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/data-table';
import Layout from '@/components/layout/AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { api } from '@/lib/apiService';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';

interface Admin extends Record<string, unknown> {
    id: string;
    email: string;
    username: string;
    created_at: string;
}

export default function AdminManagement() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create admin modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Password display modal
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [passwordCopied, setPasswordCopied] = useState(false);

    // Reset password
    const [resetAdminId, setResetAdminId] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    // Fetch admins
    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.ADMIN_GET_ALL_ADMINS);
            setAdmins(response.data);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            toast.error('Failed to load admin list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAdmin = async () => {
        if (!newAdminEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        try {
            setIsCreating(true);
            const response = await api.post(API_ENDPOINTS.ADMIN_CREATE_ADMIN, {
                email: newAdminEmail,
            });

            // Response should contain: { email, temporary_password }
            setGeneratedEmail(response.data.email);
            setGeneratedPassword(response.data.temporary_password);

            // Close create modal, open password display modal
            setCreateModalOpen(false);
            setPasswordModalOpen(true);
            setPasswordCopied(false);

            // Reset form
            setNewAdminEmail('');

            // Refresh admin list
            fetchAdmins();

            toast.success('Admin created successfully!');
        } catch (error: any) {
            console.error('Failed to create admin:', error);
            toast.error(error.response?.data?.detail || 'Failed to create admin');
        } finally {
            setIsCreating(false);
        }
    };

    const handleResetPassword = async (adminId: string) => {
        if (!confirm('Are you sure you want to reset this admin\'s password? This will generate a new temporary password.')) {
            return;
        }

        try {
            setIsResetting(true);
            setResetAdminId(adminId);

            const response = await api.post(`${API_ENDPOINTS.ADMIN_RESET_PASSWORD}${adminId}/reset-password`);

            // Response should contain: { email, temporary_password }
            setGeneratedEmail(response.data.email);
            setGeneratedPassword(response.data.temporary_password);
            setPasswordModalOpen(true);
            setPasswordCopied(false);

            toast.success('Password reset successfully!');
        } catch (error: any) {
            console.error('Failed to reset password:', error);
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        } finally {
            setIsResetting(false);
            setResetAdminId(null);
        }
    };

    const copyPasswordToClipboard = () => {
        navigator.clipboard.writeText(generatedPassword);
        setPasswordCopied(true);
        toast.success('Password copied to clipboard!');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Table columns
    const columns: Column<Admin>[] = [
        {
            key: 'email',
            header: 'Admin',
            minWidth: '300px',
            render: (admin) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary border border-line flex items-center justify-center">
                        <span className="text-ink text-[13px] font-semibold">{(admin.username || admin.email || 'A').substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-[15px] text-ink truncate">{admin.email}</div>
                        <div className="text-[13px] text-inkmuted">@{admin.username}</div>
                    </div>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'created_at',
            header: 'Date Added',
            minWidth: '150px',
            render: (admin) => (
                <span className="text-ink text-sm">{formatDate(admin.created_at)}</span>
            ),
            sortable: true,
        },
        {
            key: 'actions',
            header: 'Actions',
            minWidth: '150px',
            align: 'right',
            render: (admin) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPassword(admin.id)}
                        disabled={isResetting && resetAdminId === admin.id}
                        className="text-ink bg-white border-line hover:bg-secondary"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1 ${isResetting && resetAdminId === admin.id ? 'animate-spin' : ''}`} />
                        Reset Password
                    </Button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <Layout>
                <div className="py-4 px-6 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading admin data...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="py-8 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-[28px] font-semibold text-ink tracking-tight">Admin Management</h1>
                        <p className="text-inkmuted text-[15px] mt-1">Manage administrator accounts and permissions</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Admin
                    </Button>
                </div>

                <DataTable<Admin>
                    data={admins}
                    columns={columns}
                    searchPlaceholder="Search admins..."
                    searchKeys={['email', 'username']}
                    filterOptions={[]}
                    itemsPerPage={10}
                    sortable={true}
                    defaultSortKey="created_at"
                    defaultSortOrder="desc"
                    emptyState={{
                        icon: '',
                        title: "No admins found",
                        description: "Add your first admin to get started",
                    }}
                />

                {/* Create Admin Modal */}
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Admin</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Email Address</Label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    disabled={isCreating}
                                />
                                <p className="text-xs text-gray-500">
                                    A username will be auto-generated from the email
                                </p>
                            </div>
                            <div className="bg-canvas border border-line rounded-lg p-3">
                                <p className="text-sm text-inkmuted">
                                    <strong>Note:</strong> A temporary password will be generated and shown once. Make sure to copy and share it with the new admin.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateAdmin}
                                disabled={isCreating || !newAdminEmail.trim()}
                                
                            >
                                {isCreating ? 'Creating...' : 'Create Admin'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Password Display Modal */}
                <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-success" />
                                Temporary Password Generated
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="bg-warning-soft border border-warning/30 rounded-lg p-4">
                                <p className="text-sm font-semibold text-warning mb-2">Important — save this password</p>
                                <p className="text-sm text-warning">
                                    This password will only be shown once. Copy it now and share it securely with the admin.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="bg-secondary border border-line rounded-lg p-3">
                                    <p className="text-sm font-mono text-gray-900">{generatedEmail}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Temporary Password</Label>
                                <div className="bg-secondary border border-line rounded-lg p-3 flex items-center justify-between">
                                    <p className="text-lg font-mono text-gray-900 font-bold">{generatedPassword}</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyPasswordToClipboard}
                                        className={passwordCopied ? 'bg-success-soft border-success/40' : ''}
                                    >
                                        {passwordCopied ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-1 text-success" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-danger-soft border border-danger/20 rounded-lg p-3">
                                <p className="text-sm text-danger">
                                    Once you close this window, you won't be able to see this password again. If lost, you'll need to reset the password.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setPasswordModalOpen(false)}
                                className="w-full"
                            >
                                I've Saved the Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}

