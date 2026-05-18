import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/useAuth';
import {
    articleBodyToPreviewHtml,
    createFallbackArticle,
    normalizeGeneratedArticle,
} from '@/services/aiArticleService';

const AiGeneratorPage = ({ onNavigate }) => {
    const { user, ensureAdminProfileAccess } = useAuth();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState(null);
    const [generationMode, setGenerationMode] = useState(null);

    const handleGenerate = async () => {
        if (!topic) {
            toast({ variant: 'destructive', title: 'Topic is required' });
            return;
        }
        setLoading(true);
        setGeneratedArticle(null);
        setGenerationMode(null);

        try {
            const { data, error } = await supabase.functions.invoke('generate-article', {
                body: { topic },
            });

            if (error) {
                throw error;
            }

            const normalizedArticle = normalizeGeneratedArticle(data, topic);
            setGeneratedArticle(normalizedArticle);
            setGenerationMode('ai');
            toast({ title: 'Article Generated Successfully!' });
        } catch (error) {
            console.error('AI generation failed, using fallback draft:', error);
            const fallbackArticle = createFallbackArticle(topic);
            setGeneratedArticle(fallbackArticle);
            setGenerationMode('fallback');
            toast({
                title: 'Draft created locally',
                description: 'The AI function is unavailable right now, so a strong editable draft was created instead.',
            });
        }
        setLoading(false);
    };

    const handleUseArticle = async () => {
        if (!generatedArticle || !user) {
            toast({ variant: 'destructive', title: 'Login required', description: 'Please login again and retry saving the article.' });
            return;
        }

        let profileRepairError = null;
        const repairResult = await ensureAdminProfileAccess({ force: true });
        profileRepairError = repairResult.error;

        const insertArticle = () => supabase
            .from('articles')
            .insert({
                ...generatedArticle,
                status: 'draft',
                user_id: user.id,
            })
            .select()
            .single();

        let { data, error } = await insertArticle();

        if (error?.code === '42501') {
            const retryRepairResult = await ensureAdminProfileAccess({ force: true });
            profileRepairError = retryRepairResult.error || profileRepairError;
            ({ data, error } = await insertArticle());
        }
        
        if (error) {
            const description = error.code === '42501'
                ? profileRepairError
                    ? `Failed to save article after an admin profile repair attempt: ${profileRepairError.message || 'the live RLS policy still denies this account.'}`
                    : 'Failed to save article because the live articles RLS policy still does not allow this account.'
                : error.message;
            toast({ variant: 'destructive', title: 'Failed to save article', description });
        } else {
            toast({ title: 'Article saved as draft!' });
            onNavigate('admin/articles/edit', { id: data.id });
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">AI Content Generator</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Enter a topic or keyword, and let the AI write a full SEO-optimized article for you.</p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <div className="space-y-2">
                    <Label htmlFor="topic">Article Topic</Label>
                    <div className="flex space-x-2">
                        <Input 
                            id="topic"
                            placeholder="e.g., 'The Future of AI in Video Editing'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Generate
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        If the live AI function is unavailable, the page will create a structured editable draft automatically.
                    </p>
                </div>
            </div>

            {generatedArticle && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">Generated Article Preview</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            generationMode === 'ai'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-300'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                        }`}>
                            {generationMode === 'ai' ? 'Live AI Output' : 'Local Draft Fallback'}
                        </span>
                    </div>
                    <div className="mb-4 grid gap-3 rounded-md border p-4 text-sm">
                        <p><strong>Meta Title:</strong> {generatedArticle.meta_title}</p>
                        <p><strong>Meta Description:</strong> {generatedArticle.meta_description}</p>
                        <p><strong>Summary:</strong> {generatedArticle.short_description}</p>
                        <p><strong>Tags:</strong> {(generatedArticle.tags || []).join(', ') || 'No tags'}</p>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none border p-4 rounded-md h-96 overflow-y-auto">
                        <h1>{generatedArticle.title}</h1>
                        <div dangerouslySetInnerHTML={{ __html: articleBodyToPreviewHtml(generatedArticle.body) }} />
                    </div>
                    <div className="mt-4 flex space-x-2">
                         <Button onClick={handleUseArticle}>Use this Article</Button>
                         <Button variant="outline" onClick={() => setGeneratedArticle(null)}>Discard</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiGeneratorPage;
