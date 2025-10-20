import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Settings, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Layout from '@/components/layout/AdminLayout';
import { api } from '@/lib/apiService';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { toast } from 'sonner';

interface EmailNotification {
    id: number;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export default function EmailNotifications() {
    const [emails, setEmails] = useState<EmailNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch email notifications
    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.EMAIL_NOTIFICATIONS_GET_ALL);
            setEmails(response.data);
        } catch (error) {
            console.error('Failed to fetch email notifications:', error);
            toast.error('Failed to load email notifications');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    // Add new email notification
    const handleAddEmail = async () => {
        if (!newEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setIsAdding(true);
            const response = await api.post(API_ENDPOINTS.EMAIL_NOTIFICATIONS_CREATE, {
                email: newEmail.trim(),
                is_active: true
            });

            setEmails(prev => [...prev, response.data]);
            setNewEmail('');
            setIsDialogOpen(false);
            toast.success('Email notification added successfully');
        } catch (error) {
            console.error('Failed to add email notification:', error);
            toast.error('Failed to add email notification');
        } finally {
            setIsAdding(false);
        }
    };

    // Toggle email active status
    const handleToggleActive = async (emailId: number) => {
        try {
            const response = await api.patch(`${API_ENDPOINTS.EMAIL_NOTIFICATIONS_TOGGLE}${emailId}/toggle`);
            setEmails(prev =>
                prev.map(email =>
                    email.id === emailId ? response.data : email
                )
            );
            toast.success('Email notification status updated');
        } catch (error) {
            console.error('Failed to toggle email status:', error);
            toast.error('Failed to update email notification status');
        }
    };

    // Delete email notification
    const handleDeleteEmail = async (emailId: number) => {
        try {
            await api.delete(`${API_ENDPOINTS.EMAIL_NOTIFICATIONS_DELETE}${emailId}`);
            setEmails(prev => prev.filter(email => email.id !== emailId));
            toast.success('Email notification deleted successfully');
        } catch (error) {
            console.error('Failed to delete email notification:', error);
            toast.error('Failed to delete email notification');
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="py-4 px-6 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading email notifications...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="py-4 px-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Email Notifications</h1>
                        <p className="text-gray-600 mt-1">
                            Manage email addresses that receive notifications when students complete onboarding
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Email
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Email Notification</DialogTitle>
                                <DialogDescription>
                                    Add an email address to receive notifications when students complete onboarding.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddEmail}
                                    disabled={isAdding}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isAdding ? 'Adding...' : 'Add Email'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4">
                    {emails.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Notifications</h3>
                                <p className="text-gray-600 mb-4">
                                    No email addresses are configured to receive notifications.
                                </p>
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Email
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        emails.map((email) => (
                            <Card key={email.id}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="font-medium text-gray-900">{email.email}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge
                                                        variant={email.is_active ? "default" : "secondary"}
                                                        className={email.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                                                    >
                                                        {email.is_active ? (
                                                            <>
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                Inactive
                                                            </>
                                                        )}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        Added {new Date(email.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleActive(email.id)}
                                                className={email.is_active ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                                            >
                                                {email.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Email Notification</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete the email notification for <strong>{email.email}</strong>?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteEmail(email.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {emails.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900">How it works</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    When a student completes their onboarding process, notification emails will be sent to all active email addresses listed above.
                                    You can activate or deactivate individual email addresses as needed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
