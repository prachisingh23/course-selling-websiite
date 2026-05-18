import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, UploadCloud, Eye, Trash2, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { uploadAdminAssetFile } from '@/utils/adminMediaUploads';

// A mock rich text editor component
const RichTextEditor = ({ value, onChange }) => (
    <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-96 w-full rounded-[24px] border border-white/10 bg-white/5 p-4 text-white placeholder:text-white/28 focus:border-cyan-300/40"
        placeholder="Start writing your article here..."
    />
);

const normalizeArticle = (data = {}, fallbackUserId = null) => ({
    title: data.title || '',
    meta_title: data.meta_title || '',
    meta_description: data.meta_description || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    short_description: data.short_description || '',
    body: data.body || '',
    featured_image_url: data.featured_image_url || '',
    status: data.status || 'draft',
    user_id: data.user_id || fallbackUserId,
});

const EditArticlePage = ({ onNavigate, articleId }) => {
    const { user, isAdmin, ensureAdminProfileAccess } = useAuth();
    const [article, setArticle] = useState(() => normalizeArticle({}, user?.id));
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    useEffect(() => {
        if (!isAdmin) {
            toast({ variant: 'destructive', title: 'Access Denied', description: 'Only admins can create or edit articles.' });
            onNavigate('admin/dashboard');
            return;
        }

        if (articleId) {
            const fetchArticle = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('articles').select('*').eq('id', articleId).single();
                if (error) {
                    toast({ variant: 'destructive', title: 'Error fetching article', description: error.message });
                    onNavigate('admin/articles');
                } else {
                    setArticle(normalizeArticle(data, user?.id));
                }
                setLoading(false);
            };
            fetchArticle();
        } else {
            // For new articles, set the user_id
            setArticle((prev) => normalizeArticle(prev, user?.id));
        }
    }, [articleId, isAdmin, user, onNavigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setArticle(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (e) => {
        setArticle(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const { data, error } = await uploadAdminAssetFile(file, {
            prefix: 'article',
            folder: 'lifelapss/articles',
            resourceType: 'image',
            tags: ['admin', 'article'],
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
        } else {
            setArticle(prev => ({ ...prev, featured_image_url: data.publicUrl }));
            toast({ title: 'Image uploaded successfully!' });
        }
        setIsUploading(false);
    };

    const handleSave = async (status) => {
        setLoading(true);

        const finalStatus = status;
        const articleData = normalizeArticle({ ...article, status: finalStatus }, user?.id);

        const persistArticle = async () => {
            if (articleId) {
                return supabase.from('articles').update(articleData).eq('id', articleId);
            }

            return supabase.from('articles').insert(articleData).select().single();
        };

        let profileRepairError = null;

        if (isAdmin) {
            const repairResult = await ensureAdminProfileAccess({ force: true });
            profileRepairError = repairResult.error;
        }

        let response = await persistArticle();

        if (response.error?.code === '42501' && isAdmin) {
            const repairResult = await ensureAdminProfileAccess({ force: true });
            profileRepairError = repairResult.error || profileRepairError;
            response = await persistArticle();
        }

        const { error, data } = response;
        if (error) {
            const description = error.code === '42501'
                ? profileRepairError
                    ? `Supabase is still blocking article writes after an admin profile repair attempt: ${profileRepairError.message || 'the live RLS policy still denies this account.'}`
                    : 'Supabase is still blocking article writes. The live articles RLS policy still does not allow this account.'
                : error.message;
            toast({ variant: 'destructive', title: 'Error saving article', description });
        } else {
            toast({ title: 'Article Saved!', description: `Article has been saved as ${finalStatus}.` });
            if (!articleId && data) {
                onNavigate(`admin/articles/edit`, { id: data.id });
            } else {
                 onNavigate('admin/articles');
            }
        }
        setLoading(false);
    };

    if (loading && !article.title) return <div className="text-center p-8">Loading article editor...</div>;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => onNavigate('admin/articles')} className="rounded-full border border-white/10 bg-white/5 px-4 text-white/74 hover:bg-white/10 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
            </Button>

            <div>
                <p className="media-kicker">Editorial Studio</p>
                <h1 className="mt-3 text-4xl text-white">{articleId ? 'Edit Article' : 'Create Article'}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">Shape the article layout, featured visual, and metadata from one focused editor.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-panel-soft p-6">
                         <Label htmlFor="title" className="text-lg font-semibold text-white">Article Title</Label>
                         <Input id="title" name="title" value={article.title} onChange={handleInputChange} placeholder="Your Awesome Title" className="mt-3 h-12 rounded-2xl border-white/10 bg-white/5 text-xl text-white placeholder:text-white/28"/>
                    </div>
                     <div className="admin-panel-soft p-6">
                         <Label htmlFor="body" className="text-lg font-semibold text-white">Full Article Body</Label>
                        <RichTextEditor value={article.body} onChange={(value) => setArticle(p => ({...p, body: value}))} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="admin-panel-soft p-6">
                         <h3 className="mb-4 text-lg font-semibold text-white">Publish</h3>
                         <div className="space-y-2">
                            <Button variant="ghost" className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 text-white/82 hover:bg-white/10 hover:text-white" onClick={() => handleSave('draft')} disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Save as Draft'}</Button>
                            <Button className="premium-button h-11 w-full rounded-2xl font-semibold" onClick={() => handleSave('published')} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin"/> : (isAdmin ? 'Publish Now' : 'Submit for Review')}
                            </Button>
                         </div>
                         {article.status && <p className="mt-3 text-center text-xs text-white/56">Current Status: <span className="font-bold uppercase tracking-[0.16em] text-white/82">{article.status}</span></p>}
                    </div>
                    <div className="admin-panel-soft p-6">
                        <h3 className="mb-4 text-lg font-semibold text-white">Featured Image</h3>
                        <div className="mb-4 flex h-40 w-full items-center justify-center rounded-[24px] border-2 border-dashed border-white/10 bg-white/[0.03]">
                            {isUploading ? <Loader2 className="animate-spin"/> : article.featured_image_url ? 
                                <img src={article.featured_image_url} alt="Featured" className="w-full h-full object-cover rounded-md"/> :
                                <p className="text-sm text-white/52">No image uploaded</p>
                            }
                        </div>
                        <Label htmlFor="image-upload" className="premium-button inline-flex w-full cursor-pointer items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold">
                            <UploadCloud className="w-4 h-4 mr-2"/>
                            Upload Image
                        </Label>
                        <Input id="image-upload" type="file" className="hidden" onChange={handleFileUpload} accept="image/*"/>
                        <div className="mt-4">
                            <Label htmlFor="featured_image_url" className="text-white/82">Or paste an image URL</Label>
                            <Input
                                id="featured_image_url"
                                name="featured_image_url"
                                value={article.featured_image_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/cover-image.jpg"
                                className="mt-2 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/28"
                            />
                        </div>
                        {article.featured_image_url && 
                            <Button variant="link" className="mt-2 w-full text-red-200 hover:text-red-100" onClick={() => setArticle(p=>({...p, featured_image_url: ''}))}>Remove image</Button>
                        }
                    </div>
                    <div className="admin-panel-soft p-6">
                        <h3 className="mb-4 text-lg font-semibold text-white">SEO & Meta</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="meta_title" className="text-white/82">Meta Title</Label>
                                <Input id="meta_title" name="meta_title" value={article.meta_title} onChange={handleInputChange} placeholder="SEO Friendly Title" className="mt-2 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/28"/>
                            </div>
                            <div>
                                <Label htmlFor="meta_description" className="text-white/82">Meta Description</Label>
                                <Input id="meta_description" name="meta_description" value={article.meta_description} onChange={handleInputChange} placeholder="Short, catchy description" className="mt-2 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/28"/>
                            </div>
                             <div>
                                <Label htmlFor="tags" className="text-white/82">Tags (comma-separated)</Label>
                                <Input id="tags" name="tags" value={article.tags.join(', ')} onChange={handleTagsChange} placeholder="ai, video, animation" className="mt-2 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/28"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditArticlePage;
