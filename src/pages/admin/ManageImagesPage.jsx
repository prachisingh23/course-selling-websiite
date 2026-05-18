import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, UploadCloud, Trash2, CheckCircle, XCircle, Clock, Loader2, PlusCircle, Link, Pencil } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { attachProfileNames } from '@/utils/profileLookup';
import { isManagedMediaUrl, removeMediaFile } from '@/utils/mediaStorage';
import { uploadAdminAssetFile } from '@/utils/adminMediaUploads';
import {
    mergeHashtagMetadata,
    parseHashtagInput,
    splitHashtagMetadata,
    stringifyHashtags,
    uniqueHashtags,
} from '@/utils/hashtags';

const INITIAL_IMAGE_FORM = {
    title: '',
    description: '',
    tags: '',
    is_free: true,
    price: 0,
    files: [],
    url: '',
};

const getFileTitle = (fileName = '') => {
    const withoutExtension = String(fileName).replace(/\.[^/.]+$/, '');
    return withoutExtension
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const isImageTagsColumnMissing = (error) => {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('images.tags')
        || message.includes("column 'tags'")
        || message.includes('column images.tags')
        || message.includes('column "tags" does not exist');
};

const buildImageEditForm = (image) => {
    const { text: description, tags: metadataTags } = splitHashtagMetadata(image.description || '');
    const tags = uniqueHashtags([
        ...parseHashtagInput(image.tags || []),
        ...metadataTags,
    ]);

    return {
        id: image.id,
        title: image.title || '',
        description,
        tags: stringifyHashtags(tags),
        image_url: image.image_url || '',
        watermarked_image_url: image.watermarked_image_url || image.image_url || '',
        is_free: image.is_free !== false,
        price: Number(image.price || 0),
    };
};

const getImageDisplayMetadata = (image) => {
    const { text: description, tags: metadataTags } = splitHashtagMetadata(image.description || '');
    const tags = uniqueHashtags([
        ...parseHashtagInput(image.tags || []),
        ...metadataTags,
    ]);

    return {
        description,
        tags,
    };
};

const normalizeImageId = (imageId) => String(imageId);

const getManagedImageFileNames = (image) => {
    const urls = [image?.image_url, image?.watermarked_image_url];

    return [...new Set(
        urls
            .filter((url) => isManagedMediaUrl(url))
            .map((url) => {
                try {
                    return decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
                } catch {
                    return String(url).split('/').pop()?.split('?')[0] || '';
                }
            })
            .filter(Boolean),
    )];
};

const cleanupManagedImageFiles = async (records) => {
    const fileNames = [...new Set(records.flatMap((record) => getManagedImageFileNames(record)))];

    if (fileNames.length === 0) {
        return [];
    }

    const cleanupResults = await Promise.all(
        fileNames.map(async (fileName) => {
            const { error } = await removeMediaFile(fileName);
            return error ? { fileName, error } : null;
        }),
    );

    return cleanupResults.filter(Boolean);
};

const ManageImagesPage = () => {
    const { user, isAdmin } = useAuth();
    const [images, setImages] = useState([]);
    const [selectedImageIds, setSelectedImageIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [uploadType, setUploadType] = useState('file');
    const [newImage, setNewImage] = useState(INITIAL_IMAGE_FORM);
    const [editingImage, setEditingImage] = useState(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        if (!isAdmin) {
            setImages([]);
            setLoading(false);
            return;
        }
        const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false });
        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching images', description: error.message });
        } else {
            setImages(await attachProfileNames(data || []));
        }
        setLoading(false);
    }, [isAdmin]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    useEffect(() => {
        const validIds = new Set(images.map((image) => normalizeImageId(image.id)));
        setSelectedImageIds((currentIds) => currentIds.filter((imageId) => validIds.has(imageId)));
    }, [images]);

    const writeImageRecord = useCallback(async ({ imageId = null, payload }) => {
        const runQuery = (record) => {
            const query = imageId === null
                ? supabase.from('images').insert(record)
                : supabase.from('images').update(record).eq('id', imageId);

            return query;
        };

        let result = await runQuery(payload);

        if (result.error && Object.prototype.hasOwnProperty.call(payload, 'tags') && isImageTagsColumnMissing(result.error)) {
            const { tags, description = '', ...fallbackPayload } = payload;
            result = await runQuery({
                ...fallbackPayload,
                description: mergeHashtagMetadata(description, tags),
            });
        }

        return result;
    }, []);

    const handleAddImage = async () => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can upload images.' });
            return;
        }

        const title = newImage.title.trim();
        const description = newImage.description.trim();
        const url = newImage.url.trim();
        const files = newImage.files || [];
        const tags = parseHashtagInput(newImage.tags);
        const isFileUpload = uploadType === 'file';

        if (!user || (isFileUpload && files.length === 0) || (!isFileUpload && (!title || !url))) {
            toast({
                variant: 'destructive',
                title: 'Missing fields',
                description: isFileUpload
                    ? 'Select one or more image files to upload.'
                    : 'Title and image URL are required.',
            });
            return;
        }

        setIsSubmitting(true);

        let successCount = 0;
        const failedUploads = [];

        if (!isFileUpload) {
            const payload = {
                user_id: user.id,
                title,
                description,
                is_free: newImage.is_free,
                price: newImage.is_free ? 0 : newImage.price,
                image_url: url,
                watermarked_image_url: url,
                status: 'approved',
                tags,
            };
            const { error } = await writeImageRecord({ payload });

            if (error) {
                failedUploads.push(error.message);
            } else {
                successCount = 1;
            }
        } else {
            for (const [index, file] of files.entries()) {
                const fallbackTitle = getFileTitle(file.name) || `Image ${index + 1}`;
                const recordTitle = title
                    ? (files.length === 1 ? title : `${title} ${index + 1}`)
                    : fallbackTitle;

                const { data: uploadData, error: uploadError } = await uploadAdminAssetFile(file, {
                    prefix: 'image',
                    folder: 'lifelapss/images',
                    resourceType: 'image',
                    tags: ['admin', 'image', ...tags],
                });

                if (uploadError) {
                    failedUploads.push(`${file.name}: ${uploadError.message}`);
                    continue;
                }

                const payload = {
                    user_id: user.id,
                    title: recordTitle,
                    description,
                    is_free: newImage.is_free,
                    price: newImage.is_free ? 0 : newImage.price,
                    image_url: uploadData.publicUrl,
                    watermarked_image_url: uploadData.publicUrl,
                    status: 'approved',
                    tags,
                };
                const { error } = await writeImageRecord({ payload });

                if (error) {
                    failedUploads.push(`${file.name}: ${error.message}`);
                    continue;
                }

                successCount += 1;
            }
        }

        if (successCount > 0) {
            toast({
                title: successCount === 1 ? 'Image Added!' : `${successCount} images added`,
                description: failedUploads.length > 0
                    ? `${failedUploads.length} upload${failedUploads.length > 1 ? 's' : ''} failed.`
                    : 'Images have been approved.',
            });
            setNewImage(INITIAL_IMAGE_FORM);
            setUploadType('file');
            fetchImages();
        }

        if (failedUploads.length > 0 && successCount === 0) {
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: failedUploads[0],
            });
        }

        setIsSubmitting(false);
    };

    const handleSaveImage = async () => {
        if (!editingImage?.id) {
            return;
        }

        const title = editingImage.title.trim();
        const description = editingImage.description.trim();
        const imageUrl = editingImage.image_url.trim();
        const previewUrl = editingImage.watermarked_image_url.trim() || imageUrl;
        const tags = parseHashtagInput(editingImage.tags);

        if (!title || !imageUrl) {
            toast({ variant: 'destructive', title: 'Missing fields', description: 'Title and image URL are required.' });
            return;
        }

        setIsEditing(true);
        const payload = {
            title,
            description,
            image_url: imageUrl,
            watermarked_image_url: previewUrl,
            is_free: editingImage.is_free,
            price: editingImage.is_free ? 0 : Number(editingImage.price || 0),
            tags,
        };
        const { error } = await writeImageRecord({ imageId: editingImage.id, payload });

        if (error) {
            toast({ variant: 'destructive', title: 'Failed to update image', description: error.message });
        } else {
            toast({ title: 'Image updated', description: 'Title, description, hashtags, and pricing were saved.' });
            setEditingImage(null);
            fetchImages();
        }

        setIsEditing(false);
    };

    const handleStatusUpdate = async (imageId, status) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can manage image status.' });
            return;
        }
        const { error } = await supabase.from('images').update({ status }).eq('id', imageId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error updating status', description: error.message });
        } else {
            toast({ title: 'Image status updated!' });
            fetchImages();
        }
    };

    const handleDelete = async (imageId, imageUrl) => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can delete images.' });
            return;
        }
        const { error } = await supabase.from('images').delete().eq('id', imageId);
        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting image record', description: error.message });
            return;
        }

        const deletedImage = images.find((image) => normalizeImageId(image.id) === normalizeImageId(imageId))
            || { image_url: imageUrl };
        const storageCleanupErrors = await cleanupManagedImageFiles([deletedImage]);

        if (storageCleanupErrors.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Image record deleted, but file cleanup failed',
                description: storageCleanupErrors[0].error.message,
            });
        }

        setSelectedImageIds((currentIds) => currentIds.filter((currentId) => currentId !== normalizeImageId(imageId)));
        toast({ title: 'Image Deleted' });
        fetchImages();
    };

    const handleToggleImageSelection = (imageId, checked) => {
        const normalizedId = normalizeImageId(imageId);

        setSelectedImageIds((currentIds) => {
            if (checked === true) {
                return currentIds.includes(normalizedId) ? currentIds : [...currentIds, normalizedId];
            }

            return currentIds.filter((currentId) => currentId !== normalizedId);
        });
    };

    const handleToggleSelectAll = (checked) => {
        if (checked === true) {
            setSelectedImageIds(images.map((image) => normalizeImageId(image.id)));
            return;
        }

        setSelectedImageIds([]);
    };

    const handleBulkDelete = async () => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Permission Denied', description: 'Only admins can delete images.' });
            return;
        }

        const selectedImages = images.filter((image) => selectedImageIds.includes(normalizeImageId(image.id)));
        if (selectedImages.length === 0) {
            return;
        }

        setIsBulkDeleting(true);

        const imageIds = selectedImages.map((image) => image.id);
        const imageIdSet = new Set(imageIds.map((imageId) => normalizeImageId(imageId)));
        const { error } = await supabase.from('images').delete().in('id', imageIds);

        if (error) {
            toast({ variant: 'destructive', title: 'Error deleting images', description: error.message });
            setIsBulkDeleting(false);
            return;
        }

        const storageCleanupErrors = await cleanupManagedImageFiles(selectedImages);

        if (editingImage && imageIdSet.has(normalizeImageId(editingImage.id))) {
            setEditingImage(null);
        }

        setSelectedImageIds((currentIds) => currentIds.filter((imageId) => !imageIdSet.has(imageId)));

        if (storageCleanupErrors.length > 0) {
            toast({
                variant: 'destructive',
                title: `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} deleted`,
                description: `${storageCleanupErrors.length} storage file${storageCleanupErrors.length > 1 ? 's were' : ' was'} not cleaned up automatically.`,
            });
        } else {
            toast({
                title: `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} deleted`,
                description: 'Selected image records were removed successfully.',
            });
        }

        await fetchImages();
        setIsBulkDeleting(false);
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
        return <div className="text-center p-8 text-red-500">Access Denied: Only admins can upload or manage images.</div>;
    }

    const selectedImages = images.filter((image) => selectedImageIds.includes(normalizeImageId(image.id)));
    const allImagesSelected = images.length > 0 && selectedImageIds.length === images.length;
    const hasPartialSelection = selectedImageIds.length > 0 && !allImagesSelected;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Images</h1>
                {isAdmin && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="w-4 h-4 mr-2" /> Add Image</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Add New Image</DialogTitle></DialogHeader>
                            <Tabs defaultValue="file" onValueChange={setUploadType}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="file"><UploadCloud className="w-4 h-4 mr-2" />Upload File</TabsTrigger>
                                    <TabsTrigger value="url"><Link className="w-4 h-4 mr-2" />Import from URL</TabsTrigger>
                                </TabsList>
                                <TabsContent value="file">
                                    <div className="pt-4 space-y-2">
                                        <Label>Image Files</Label>
                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={(e) => setNewImage({ ...newImage, files: Array.from(e.target.files || []) })}
                                        />
                                        {newImage.files.length > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                {newImage.files.length} file{newImage.files.length > 1 ? 's' : ''} selected
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="url">
                                    <div className="pt-4">
                                        <Label>Image URL</Label>
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            value={newImage.url}
                                            onChange={e => setNewImage({ ...newImage, url: e.target.value })}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="space-y-4 pt-4">
                                <div>
                                    <Label>{uploadType === 'file' ? 'Title Prefix (optional for bulk upload)' : 'Title'}</Label>
                                    <Input
                                        placeholder={uploadType === 'file' ? 'If empty, each file name becomes the title' : 'Image title'}
                                        value={newImage.title}
                                        onChange={e => setNewImage({ ...newImage, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        rows={4}
                                        value={newImage.description}
                                        onChange={e => setNewImage({ ...newImage, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Hashtags</Label>
                                    <Input
                                        placeholder="#travel #portrait #sunset"
                                        value={newImage.tags}
                                        onChange={e => setNewImage({ ...newImage, tags: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_free_img"
                                        checked={newImage.is_free}
                                        onCheckedChange={checked => setNewImage({ ...newImage, is_free: checked === true })}
                                    />
                                    <Label htmlFor="is_free_img">Free Image</Label>
                                </div>
                                {!newImage.is_free && (
                                    <div>
                                        <Label>Price ($)</Label>
                                        <Input
                                            type="number"
                                            value={newImage.price}
                                            onChange={e => setNewImage({ ...newImage, price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                )}
                                <Button onClick={handleAddImage} disabled={isSubmitting} className="w-full">
                                    {isSubmitting
                                        ? <Loader2 className="animate-spin" />
                                        : uploadType === 'file' && newImage.files.length > 1
                                            ? `Upload ${newImage.files.length} Images`
                                            : 'Submit Image'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedImages.length > 0
                            ? `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected`
                            : 'Select images to delete them in bulk'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use the checkboxes in the table to select multiple image records at once.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedImageIds([])}
                        disabled={selectedImages.length === 0 || isBulkDeleting}
                    >
                        Clear Selection
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={selectedImages.length === 0 || isBulkDeleting}>
                                {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Selected
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete selected images?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {selectedImages.length} selected image{selectedImages.length > 1 ? 's' : ''}. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkDeleting}>
                                    {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                <Checkbox
                                    checked={allImagesSelected ? true : hasPartialSelection ? 'indeterminate' : false}
                                    onCheckedChange={handleToggleSelectAll}
                                    aria-label="Select all images"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Preview</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Details</th>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium uppercase">Creator</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : images.map(image => {
                            const metadata = getImageDisplayMetadata(image);
                            const isInlineEditing = editingImage?.id === image.id;
                            const isSelected = selectedImageIds.includes(normalizeImageId(image.id));

                            return (
                            <tr key={image.id}>
                                <td className="px-6 py-4 align-top">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleToggleImageSelection(image.id, checked)}
                                        aria-label={`Select ${image.title}`}
                                    />
                                </td>
                                <td className="px-6 py-4"><img src={image.image_url} alt={image.title} className="w-16 h-16 object-cover rounded-md" /></td>
                                <td className="px-6 py-4">
                                    {isInlineEditing ? (
                                        <div className="max-w-md space-y-3">
                                            <div>
                                                <Label className="text-xs">Title</Label>
                                                <Input value={editingImage.title} onChange={e => setEditingImage({ ...editingImage, title: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Description</Label>
                                                <Textarea
                                                    rows={3}
                                                    value={editingImage.description}
                                                    onChange={e => setEditingImage({ ...editingImage, description: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Hashtags</Label>
                                                <Input
                                                    placeholder="#travel #portrait #sunset"
                                                    value={editingImage.tags}
                                                    onChange={e => setEditingImage({ ...editingImage, tags: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Image URL</Label>
                                                <Input
                                                    value={editingImage.image_url}
                                                    onChange={e => setEditingImage({ ...editingImage, image_url: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Preview URL</Label>
                                                <Input
                                                    value={editingImage.watermarked_image_url}
                                                    onChange={e => setEditingImage({ ...editingImage, watermarked_image_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="font-medium">{image.title}</div>
                                            {metadata.description ? (
                                                <p className="max-w-md text-xs text-gray-500 dark:text-gray-300">{metadata.description}</p>
                                            ) : null}
                                            {metadata.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {metadata.tags.map((tag) => (
                                                        <span
                                                            key={`${image.id}-${tag}`}
                                                            className="inline-flex rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">No hashtags</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                {isAdmin && <td className="px-6 py-4">{image.creator_name}</td>}
                                <td className="px-6 py-4">
                                    {isInlineEditing ? (
                                        <div className="min-w-[140px] space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`edit_inline_is_free_img_${image.id}`}
                                                    checked={editingImage.is_free}
                                                    onCheckedChange={checked => setEditingImage({ ...editingImage, is_free: checked === true })}
                                                />
                                                <Label htmlFor={`edit_inline_is_free_img_${image.id}`} className="text-xs">Free Image</Label>
                                            </div>
                                            {!editingImage.is_free && (
                                                <div>
                                                    <Label className="text-xs">Price ($)</Label>
                                                    <Input
                                                        type="number"
                                                        value={editingImage.price}
                                                        onChange={e => setEditingImage({ ...editingImage, price: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : image.is_free ? <span className="text-green-500">Free</span> : `$${image.price}`}
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={image.status} /></td>
                                <td className="px-6 py-4 text-right">
                                    {isInlineEditing ? (
                                        <div className="flex flex-col items-end gap-2">
                                            <Button size="sm" onClick={handleSaveImage} disabled={isEditing}>
                                                {isEditing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingImage(null)} disabled={isEditing}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingImage(buildImageEditForm(image))}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    {isAdmin && image.status !== 'approved' && <DropdownMenuItem onClick={() => handleStatusUpdate(image.id, 'approved')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve</DropdownMenuItem>}
                                                    {isAdmin && image.status !== 'rejected' && <DropdownMenuItem onClick={() => handleStatusUpdate(image.id, 'rejected')}><XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject</DropdownMenuItem>}
                                                    {isAdmin && <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the image.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(image.id, image.image_url)}>Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageImagesPage;
