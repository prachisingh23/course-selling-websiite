import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, UploadCloud, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { uploadAdminAssetFile } from '@/utils/adminMediaUploads';

const normalizeProduct = (data = {}, fallbackUserId = null) => ({
    name: data.name || '',
    description: data.description || '',
    price: data.price ?? 0,
    thumbnail_url: data.thumbnail_url || '',
    file_url: data.file_url || '',
    status: data.status || 'pending_approval',
    user_id: data.user_id || fallbackUserId,
});

const EditProductPage = ({ onNavigate, productId }) => {
    const { user, isAdmin } = useAuth();
    const [product, setProduct] = useState(() => normalizeProduct({}, user?.id));
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState({ thumbnail: false, file: false });

    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
                if (error || (!isAdmin && data.user_id !== user.id)) {
                    toast({ variant: 'destructive', title: 'Error', description: "Could not fetch product or access denied." });
                    onNavigate('admin/products');
                } else {
                    setProduct(normalizeProduct(data, user?.id));
                }
                setLoading(false);
            };
            fetchProduct();
        } else {
            setProduct((prev) => normalizeProduct(prev, user?.id));
        }
    }, [productId, isAdmin, user, onNavigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [type]: true }));
        const { data, error } = await uploadAdminAssetFile(file, {
            prefix: type,
            folder: 'lifelapss/products',
            resourceType: type === 'thumbnail' ? 'image' : 'auto',
            tags: ['admin', 'product', type],
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
        } else {
            setProduct(prev => ({ ...prev, [`${type}_url`]: data.publicUrl }));
            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!` });
        }
        setIsUploading(prev => ({ ...prev, [type]: false }));
    };

    const handleSave = async () => {
        setLoading(true);
        const finalStatus = isAdmin ? product.status : 'pending_approval'; // Creators always submit for approval
        const productData = normalizeProduct({ ...product, status: finalStatus }, user?.id);

        let response;
        if (productId) {
            response = await supabase.from('products').update(productData).eq('id', productId);
        } else {
            response = await supabase.from('products').insert(productData).select().single();
        }
        
        const { error, data } = response;
        if (error) {
            toast({ variant: 'destructive', title: 'Error saving product', description: error.message });
        } else {
            toast({ title: 'Product Saved!', description: `Your product has been saved.` });
            onNavigate('admin/products');
        }
        setLoading(false);
    };

    if (loading && !product.name) return <div className="text-center p-8">Loading product editor...</div>;

    return (
        <div>
            <Button variant="ghost" onClick={() => onNavigate('admin/products')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
            </Button>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">{productId ? 'Edit Product' : 'Create New Product'}</h1>
                
                <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" value={product.name} onChange={handleInputChange} placeholder="e.g., AI Video LUTs Pack" />
                </div>
                
                <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" name="description" value={product.description} onChange={handleInputChange} rows="4" className="w-full p-2 border rounded-md bg-transparent" placeholder="Describe your product..."></textarea>
                </div>

                <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" name="price" type="number" value={product.price} onChange={handleInputChange} placeholder="19.99" />
                </div>

                <div className="space-y-2">
                    <Label>Product Thumbnail</Label>
                    <div className="flex items-center space-x-4">
                        {product.thumbnail_url && <img src={product.thumbnail_url} alt="thumbnail" className="w-20 h-20 object-cover rounded-md"/>}
                        <Label htmlFor="thumbnail-upload" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-dashed text-sm rounded-md cursor-pointer">
                            {isUploading.thumbnail ? <Loader2 className="animate-spin"/> : <><UploadCloud className="w-4 h-4 mr-2"/> Click to upload</>}
                        </Label>
                        <Input id="thumbnail-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'thumbnail')} accept="image/*"/>
                    </div>
                    <Input
                        name="thumbnail_url"
                        value={product.thumbnail_url}
                        onChange={handleInputChange}
                        placeholder="Or paste a thumbnail URL"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Digital File</Label>
                    <div className="flex items-center space-x-4">
                        {product.file_url && <p className="text-sm text-green-500 truncate">File uploaded</p>}
                        <Label htmlFor="file-upload" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-dashed text-sm rounded-md cursor-pointer">
                            {isUploading.file ? <Loader2 className="animate-spin"/> : <><UploadCloud className="w-4 h-4 mr-2"/> Click to upload</>}
                        </Label>
                        <Input id="file-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
                    </div>
                    <Input
                        name="file_url"
                        value={product.file_url}
                        onChange={handleInputChange}
                        placeholder="Or paste a hosted file URL"
                    />
                </div>

                {isAdmin && ( // Only admin can change status directly
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={product.status}
                            onValueChange={(value) => setProduct((prev) => ({ ...prev, status: value }))}
                        >
                            <SelectTrigger id="status" className="w-full border rounded-md bg-transparent">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="animate-spin"/> : 'Save Product'}
                </Button>
            </div>
        </div>
    );
};

export default EditProductPage;
