import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, Copy, Trash2, Loader2, Image } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/contexts/useAuth';
import { getMediaPublicUrl, listMediaFiles, removeMediaFile, uploadMediaFile } from '@/utils/mediaStorage';
import { isCloudinaryConfigured } from '@/utils/cloudinary';

const MediaLibraryPage = () => {
    const { user, isAdmin } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [bucketReady, setBucketReady] = useState(true);

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        if (!isAdmin) {
            setFiles([]);
            setLoading(false);
            return;
        }
        const { data, bucketName, error } = await listMediaFiles();

        if (error) {
            const isMissingBucket = error.message?.toLowerCase().includes('no storage bucket');
            setBucketReady(!isMissingBucket);
            setFiles([]);
            if (!isMissingBucket) {
                toast({ variant: 'destructive', title: 'Error fetching files', description: error.message });
            }
        } else {
            setBucketReady(true);
            const filesWithUrls = data.map((file) => {
                const publicUrl = getMediaPublicUrl(file.name, bucketName);
                return { ...file, bucketName, publicUrl };
            });
            setFiles(filesWithUrls);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileUpload = async (e) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can upload files to the media library.' });
            return;
        }
        if (!bucketReady) {
            toast({
                title: 'Storage setup needed',
                description: 'The media library page still needs a Supabase storage bucket such as media_library before library uploads can work.',
            });
            return;
        }
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;
        
        setIsUploading(true);
        
        const uploadPromises = Array.from(selectedFiles).map((file) => uploadMediaFile(file, { prefix: 'library' }));

        const results = await Promise.all(uploadPromises);

        const failedUploads = results.filter(result => result.error);
        if (failedUploads.length > 0) {
            toast({ variant: 'destructive', title: 'Some uploads failed', description: `${failedUploads.length} out of ${selectedFiles.length} files failed to upload.` });
        } else {
            toast({ title: 'Upload successful', description: `${selectedFiles.length} file(s) uploaded.` });
        }

        setIsUploading(false);
        fetchFiles();
    };

    const handleDelete = async (fileName) => {
        // Only admins can delete files for now.
        // If creators should delete their own, RLS on storage bucket and this logic needs adjustment.
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can delete files.' });
            return;
        }
        const { error } = await removeMediaFile(fileName);
        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting file', description: error.message });
        } else {
            toast({ title: 'File deleted' });
            fetchFiles();
        }
    };
    
    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast({title: "URL Copied!"});
    };

    if (!isAdmin) {
        return <div className="text-center p-8 text-red-500">Access Denied: Only admins can access the media library.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="media-kicker">Asset Storage</p>
                    <h1 className="mt-3 text-4xl text-white">Media Library</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">Manage reusable media files for articles, products, and internal content workflows.</p>
                </div>
                <Label
                    htmlFor={bucketReady ? "file-upload" : undefined}
                    className={`premium-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold ${bucketReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                    Upload
                </Label>
                <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading || !bucketReady}/>
            </div>
            {loading ? (
                <div className="admin-panel-soft p-8 text-center text-white/72">Loading media...</div>
            ) : !bucketReady ? (
                <div className="admin-panel-soft border-2 border-dashed border-amber-300/20 p-8 text-center">
                    <Image className="mx-auto h-12 w-12 text-amber-200" />
                    <h3 className="mt-4 text-lg font-semibold text-white">Storage bucket missing</h3>
                    <p className="mt-2 text-sm text-white/58">Create a public Supabase storage bucket such as `media_library` to use the admin media library uploads.</p>
                    {isCloudinaryConfigured() ? (
                        <p className="mt-2 text-xs text-white/44">Cloudinary is configured for direct image and video uploads, but this media library page still depends on a Supabase storage bucket for listing and reusable library files.</p>
                    ) : null}
                </div>
            ) : files.length === 0 ? (
                <div className="admin-panel-soft border-2 border-dashed border-white/10 p-8 text-center">
                    <Image className="mx-auto h-12 w-12 text-white/36" />
                    <h3 className="mt-4 text-lg font-semibold text-white">No media found</h3>
                    <p className="mt-2 text-sm text-white/58">Get started by uploading your first image or video.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map(file => (
                        <div key={file.id} className="admin-panel-soft group relative overflow-hidden rounded-[24px]">
                           <img src={file.publicUrl} alt={file.name} className="h-32 w-full object-cover"/>
                           <div className="absolute inset-0 flex items-center justify-center space-x-2 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => copyToClipboard(file.publicUrl)}><Copy className="w-4 h-4"/></Button>
                               {isAdmin && ( // Only admins can delete
                                   <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4"/></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete "{file.name}". This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(file.name)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               )}
                           </div>
                           <p className="truncate p-3 text-xs text-white/68">{file.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaLibraryPage;
