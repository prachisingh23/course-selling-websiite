import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, PlusCircle, Trash2, CheckCircle, XCircle, Clock, Loader2, UploadCloud, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { attachProfileNames } from '@/utils/profileLookup';
import { uploadAdminAssetFile } from '@/utils/adminMediaUploads';
import {
    mergeHashtagMetadata,
    parseHashtagInput,
    splitHashtagMetadata,
    stringifyHashtags,
} from '@/utils/hashtags';

const INITIAL_VIDEO_FORM = {
    title: '',
    description: '',
    tags: '',
    category: '',
    video_url: '',
    thumbnail_url: '',
    is_free: true,
    price: 0,
};

const buildVideoEditForm = (video) => {
    const { text: description, tags } = splitHashtagMetadata(video.description || '');

    return {
        id: video.id,
        title: video.title || '',
        description,
        tags: stringifyHashtags(tags),
        category: video.category || '',
        video_url: video.video_url || '',
        thumbnail_url: video.thumbnail_url || '',
        is_free: video.is_free !== false,
        price: Number(video.price || 0),
    };
};

const ManageVideosPage = () => {
    const { user, isAdmin } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingEditFile, setIsUploadingEditFile] = useState(false);
    const [newVideo, setNewVideo] = useState(INITIAL_VIDEO_FORM);
    const [editingVideo, setEditingVideo] = useState(null);

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        if (!isAdmin) {
            setVideos([]);
            setLoading(false);
            return;
        }
        const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching videos', description: error.message });
        } else {
            setVideos(await attachProfileNames(data || []));
        }
        setLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleVideoUpload = async ({ file, onComplete, onFinally, tags = [] }) => {
        const { data, error } = await uploadAdminAssetFile(file, {
            prefix: 'video',
            folder: 'lifelapss/videos',
            resourceType: 'video',
            tags: ['admin', 'video', ...tags],
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Video upload failed', description: error.message });
        } else {
            onComplete(data);
            toast({ title: 'Video uploaded', description: 'The hosted Cloudinary URL has been added to the form.' });
        }

        onFinally();
    };

    const handleVideoFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setIsUploadingFile(true);
        await handleVideoUpload({
            file,
            tags: parseHashtagInput(newVideo.tags),
            onComplete: (data) => {
                setNewVideo((prev) => ({
                    ...prev,
                    video_url: data.publicUrl,
                    thumbnail_url: data.thumbnailUrl || prev.thumbnail_url,
                }));
            },
            onFinally: () => {
                setIsUploadingFile(false);
                e.target.value = '';
            },
        });
    };

    const handleEditVideoFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !editingVideo) {
            return;
        }

        setIsUploadingEditFile(true);
        await handleVideoUpload({
            file,
            tags: parseHashtagInput(editingVideo.tags),
            onComplete: (data) => {
                setEditingVideo((prev) => prev ? {
                    ...prev,
                    video_url: data.publicUrl,
                    thumbnail_url: data.thumbnailUrl || prev.thumbnail_url,
                } : prev);
            },
            onFinally: () => {
                setIsUploadingEditFile(false);
                e.target.value = '';
            },
        });
    };

    const handleAddVideo = async () => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can upload videos.' });
            return;
        }

        const title = newVideo.title.trim();
        const videoUrl = newVideo.video_url.trim();
        const tags = parseHashtagInput(newVideo.tags);

        if (!title || !videoUrl || !user) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Title, Video URL, and user session are required.' });
            return;
        }

        setIsSubmitting(true);
        const { error } = await supabase.from('videos').insert({
            title,
            description: mergeHashtagMetadata(newVideo.description.trim(), tags),
            category: newVideo.category.trim(),
            video_url: videoUrl,
            thumbnail_url: newVideo.thumbnail_url.trim(),
            is_free: newVideo.is_free,
            price: newVideo.is_free ? 0 : Number(newVideo.price || 0),
            user_id: user.id,
            status: 'approved',
        });
        if (error) {
            toast({ variant: 'destructive', title: 'Failed to add video', description: error.message });
        } else {
            toast({ title: 'Video Added!', description: 'Video has been approved.' });
            setNewVideo(INITIAL_VIDEO_FORM);
            fetchVideos();
        }
        setIsSubmitting(false);
    };

    const handleSaveVideo = async () => {
        if (!editingVideo?.id) {
            return;
        }

        const title = editingVideo.title.trim();
        const videoUrl = editingVideo.video_url.trim();
        const tags = parseHashtagInput(editingVideo.tags);

        if (!title || !videoUrl) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Title and video URL are required.' });
            return;
        }

        setIsEditing(true);
        const { error } = await supabase
            .from('videos')
            .update({
                title,
                description: mergeHashtagMetadata(editingVideo.description.trim(), tags),
                category: editingVideo.category.trim(),
                video_url: videoUrl,
                thumbnail_url: editingVideo.thumbnail_url.trim(),
                is_free: editingVideo.is_free,
                price: editingVideo.is_free ? 0 : Number(editingVideo.price || 0),
            })
            .eq('id', editingVideo.id);

        if (error) {
            toast({ variant: 'destructive', title: 'Failed to update video', description: error.message });
        } else {
            toast({ title: 'Video updated', description: 'Video details and hashtags were saved.' });
            setEditingVideo(null);
            fetchVideos();
        }

        setIsEditing(false);
    };

    const handleStatusUpdate = async (videoId, status) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can manage video status.' });
            return;
        }
        const { error } = await supabase.from('videos').update({ status }).eq('id', videoId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error updating status', description: error.message });
        } else {
            toast({ title: 'Video status updated!' });
            fetchVideos();
        }
    };

    const handleDelete = async (videoId) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can delete videos.' });
            return;
        }
        const { error } = await supabase.from('videos').delete().eq('id', videoId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting video', description: error.message });
        } else {
            toast({ title: 'Video Deleted' });
            fetchVideos();
        }
    };

    const StatusBadge = ({ status }) => {
        const statusMap = {
            approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approved' },
            pending_approval: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
            rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
        };
        const current = statusMap[status] || statusMap.pending_approval;
        return <span className={`inline-flex items-center text-xs font-semibold ${current.color}`}><current.icon className="w-4 h-4 mr-1" />{current.label}</span>;
    };

    if (!isAdmin) {
        return <div className="text-center p-8 text-red-500">Access Denied: Only admins can upload or manage videos.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Videos</h1>
                {isAdmin && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="w-4 h-4 mr-2" /> Add Video</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Add New Video</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div><Label>Title</Label><Input value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} /></div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea rows={4} value={newVideo.description} onChange={e => setNewVideo({ ...newVideo, description: e.target.value })} />
                                </div>
                                <div><Label>Hashtags</Label><Input placeholder="#drone #travel #4k" value={newVideo.tags} onChange={e => setNewVideo({ ...newVideo, tags: e.target.value })} /></div>
                                <div><Label>Category</Label><Input value={newVideo.category} onChange={e => setNewVideo({ ...newVideo, category: e.target.value })} /></div>
                                <div>
                                    <Label>Video URL</Label>
                                    <Input
                                        value={newVideo.video_url}
                                        onChange={e => setNewVideo({ ...newVideo, video_url: e.target.value })}
                                        placeholder="Paste a YouTube or hosted video URL"
                                    />
                                </div>
                                <div>
                                    <Label>Thumbnail URL</Label>
                                    <Input
                                        value={newVideo.thumbnail_url}
                                        onChange={e => setNewVideo({ ...newVideo, thumbnail_url: e.target.value })}
                                        placeholder="Optional custom thumbnail URL"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="video-file-upload">Or upload a video file</Label>
                                    <Label
                                        htmlFor="video-file-upload"
                                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed px-4 py-3 text-sm"
                                    >
                                        {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UploadCloud className="w-4 h-4 mr-2" /> Upload video file</>}
                                    </Label>
                                    <Input id="video-file-upload" type="file" accept="video/*" className="hidden" onChange={handleVideoFileUpload} />
                                    {newVideo.thumbnail_url ? (
                                        <p className="text-xs text-green-600 dark:text-green-400">Thumbnail prepared for the current hosted video.</p>
                                    ) : null}
                                </div>
                                <div className="flex items-center space-x-2"><Checkbox id="is_free_vid" checked={newVideo.is_free} onCheckedChange={checked => setNewVideo({ ...newVideo, is_free: checked === true })} /><Label htmlFor="is_free_vid">Free Video</Label></div>
                                {!newVideo.is_free && <div><Label>Price ($)</Label><Input type="number" value={newVideo.price} onChange={e => setNewVideo({ ...newVideo, price: parseFloat(e.target.value) || 0 })} /></div>}
                                <Button onClick={handleAddVideo} disabled={isSubmitting} className="w-full">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Video'}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Title</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium uppercase">Creator</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : videos.map(video => (
                            <tr key={video.id}>
                                <td className="px-6 py-4 font-medium">{video.title}</td>
                                {isAdmin && <td className="px-6 py-4">{video.creator_name}</td>}
                                <td className="px-6 py-4">{video.is_free ? <span className="text-green-500">Free</span> : `$${video.price}`}</td>
                                <td className="px-6 py-4"><StatusBadge status={video.status} /></td>
                                <td className="px-6 py-4 text-right">
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingVideo(buildVideoEditForm(video))}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                {isAdmin && video.status !== 'approved' && <DropdownMenuItem onClick={() => handleStatusUpdate(video.id, 'approved')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve</DropdownMenuItem>}
                                                {isAdmin && video.status !== 'rejected' && <DropdownMenuItem onClick={() => handleStatusUpdate(video.id, 'rejected')}><XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject</DropdownMenuItem>}
                                                {isAdmin && <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the video.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(video.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={Boolean(editingVideo)} onOpenChange={(open) => !open && setEditingVideo(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Video</DialogTitle></DialogHeader>
                    {editingVideo ? (
                        <div className="space-y-4 pt-2">
                            <div><Label>Title</Label><Input value={editingVideo.title} onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })} /></div>
                            <div>
                                <Label>Description</Label>
                                <Textarea rows={4} value={editingVideo.description} onChange={e => setEditingVideo({ ...editingVideo, description: e.target.value })} />
                            </div>
                            <div><Label>Hashtags</Label><Input placeholder="#drone #travel #4k" value={editingVideo.tags} onChange={e => setEditingVideo({ ...editingVideo, tags: e.target.value })} /></div>
                            <div><Label>Category</Label><Input value={editingVideo.category} onChange={e => setEditingVideo({ ...editingVideo, category: e.target.value })} /></div>
                            <div><Label>Video URL</Label><Input value={editingVideo.video_url} onChange={e => setEditingVideo({ ...editingVideo, video_url: e.target.value })} /></div>
                            <div><Label>Thumbnail URL</Label><Input value={editingVideo.thumbnail_url} onChange={e => setEditingVideo({ ...editingVideo, thumbnail_url: e.target.value })} /></div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-video-file-upload">Replace video file</Label>
                                <Label
                                    htmlFor="edit-video-file-upload"
                                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed px-4 py-3 text-sm"
                                >
                                    {isUploadingEditFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UploadCloud className="w-4 h-4 mr-2" /> Upload replacement video</>}
                                </Label>
                                <Input id="edit-video-file-upload" type="file" accept="video/*" className="hidden" onChange={handleEditVideoFileUpload} />
                            </div>
                            <div className="flex items-center space-x-2"><Checkbox id="edit_is_free_vid" checked={editingVideo.is_free} onCheckedChange={checked => setEditingVideo({ ...editingVideo, is_free: checked === true })} /><Label htmlFor="edit_is_free_vid">Free Video</Label></div>
                            {!editingVideo.is_free && <div><Label>Price ($)</Label><Input type="number" value={editingVideo.price} onChange={e => setEditingVideo({ ...editingVideo, price: parseFloat(e.target.value) || 0 })} /></div>}
                            <Button onClick={handleSaveVideo} disabled={isEditing} className="w-full">{isEditing ? <Loader2 className="animate-spin" /> : 'Save Video'}</Button>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageVideosPage;
