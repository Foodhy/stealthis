import { PasswordGate } from '@/components/PasswordGate';
import { useState, useEffect } from 'react';
import { InformationSource, InformationSourceInput, SourceType } from '@/types/dataSource';
import { informationSourceService } from '@/services/informationSourceService';
import { Trash2, Copy, Plus, FileText, Link as LinkIcon, Code, FileJson, Key, File, Edit, Loader2, Download, Search, X as XIcon, Heart, Filter, Calendar } from 'lucide-react';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { valuesService, Tag } from '@/services/valuesService';
import { Badge } from '@/components/native/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/native/select';
import { X } from '@/components/icons/extra';
import { useI18n } from '@/i18n';

type SortField = 'created_at' | 'name';
type SortDirection = 'asc' | 'desc';

const NewDataSource = () => {
    const { t, locale } = useI18n();
    const [sources, setSources] = useState<InformationSource[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    // Filter & Sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTags, setSearchTags] = useState<number[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [filterType, setFilterType] = useState<SourceType | 'all'>('all');
    const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({
        field: 'created_at',
        direction: 'desc'
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Form state
    const [formData, setFormData] = useState<InformationSourceInput>({
        name: '',
        description: '',
        source_type: 'text',
        content: '',
        url: '',
    });

    useEffect(() => {
        // Load filters from local storage
        const savedFilters = localStorage.getItem('dataSource_filters');
        if (savedFilters) {
            try {
                const { term, tags, showFavorites, type, sort, advancedOpen } = JSON.parse(savedFilters);
                if (typeof term === 'string') setSearchTerm(term);
                if (Array.isArray(tags)) setSearchTags(tags);
                if (typeof showFavorites === 'boolean') setShowFavoritesOnly(showFavorites);
                if (type) setFilterType(type);
                if (sort) setSortConfig(sort);
                if (typeof advancedOpen === 'boolean') setShowAdvancedFilters(advancedOpen);
            } catch (e) {
                console.error('Failed to parse saved filters', e);
            }
        }

        // Load favorites
        const savedFavorites = localStorage.getItem('dataSource_favorites');
        if (savedFavorites) {
            try {
                const favs = JSON.parse(savedFavorites);
                if (Array.isArray(favs)) setFavorites(favs);
            } catch (e) {
                console.error('Failed to parse favorites', e);
            }
        }

        loadSources();
        loadTags();
    }, []);

    useEffect(() => {
        // Save filters to local storage
        const filters = {
            term: searchTerm,
            tags: searchTags,
            showFavorites: showFavoritesOnly,
            type: filterType,
            sort: sortConfig,
            advancedOpen: showAdvancedFilters
        };
        localStorage.setItem('dataSource_filters', JSON.stringify(filters));
    }, [searchTerm, searchTags, showFavoritesOnly, filterType, sortConfig, showAdvancedFilters]);

    useEffect(() => {
        // Save favorites
        localStorage.setItem('dataSource_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const filteredSources = sources
        .filter(source => {
            const matchesTerm = (source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (source.description || '').toLowerCase().includes(searchTerm.toLowerCase()));

            const sourceTags = (source.metadata?.tags as number[]) || [];
            const matchesTags = searchTags.length === 0 || searchTags.every(tagId => sourceTags.includes(tagId));

            const matchesFavorite = !showFavoritesOnly || favorites.includes(source.id);
            const matchesType = filterType === 'all' || source.source_type === filterType;

            return matchesTerm && matchesTags && matchesFavorite && matchesType;
        })
        .sort((a, b) => {
            const direction = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.field === 'created_at') {
                return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * direction;
            }
            if (sortConfig.field === 'name') {
                return a.name.localeCompare(b.name) * direction;
            }
            return 0;
        });

    const loadTags = async () => {
        try {
            const tags = await valuesService.getTags();
            setAvailableTags(tags);
        } catch (err) {
            console.error('Error loading tags:', err);
        }
    };

    const loadSources = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await informationSourceService.getAll();
            setSources(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('newSource.errorLoad');
            setError(errorMessage);
            console.error('Error loading sources:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingId) {
                await informationSourceService.update(editingId, {
                    ...formData,
                    metadata: { ...formData.metadata, tags: selectedTagIds }
                });
                setEditingId(null);
            } else {
                await informationSourceService.add({
                    ...formData,
                    metadata: { ...formData.metadata, tags: selectedTagIds }
                });
            }
            setFormData({
                name: '',
                description: '',
                source_type: 'text',
                content: '',
                url: '',
                metadata: {}
            });
            setSelectedTagIds([]);
            setIsFormOpen(false);
            await loadSources();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('newSource.errorSave');
            setError(errorMessage);
            console.error('Error saving source:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (source: InformationSource) => {
        setFormData({
            name: source.name,
            description: source.description || '',
            source_type: source.source_type,
            content: source.content || '',
            url: source.url || '',
            metadata: source.metadata
        });

        // Extract tags from metadata if they exist
        const tags = source.metadata?.tags;
        if (Array.isArray(tags)) {
            const tagIds = tags.filter((t): t is number => typeof t === 'number');
            setSelectedTagIds(tagIds);
        } else {
            setSelectedTagIds([]);
        }

        setEditingId(source.id);
        setIsFormOpen(true);
    };

    const handleCancelEdit = () => {
        setFormData({
            name: '',
            description: '',
            source_type: 'text',
            content: '',
            url: '',
            metadata: {}
        });
        setSelectedTagIds([]);
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t('newSource.confirmDelete'))) {
            setLoading(true);
            setError(null);
            try {
                await informationSourceService.delete(id);
                // Also remove from favorites if it was favorited
                setFavorites(prev => prev.filter(fid => fid !== id));
                await loadSources();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : t('newSource.errorDelete');
                setError(errorMessage);
                console.error('Error deleting source:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleFavorite = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (favorites.includes(id)) {
            setFavorites(favorites.filter(fid => fid !== id));
        } else {
            setFavorites([...favorites, id]);
        }
    };

    const handleCopy = (content?: string, url?: string) => {
        const textToCopy = content || url || '';
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            // Could add a toast notification here
        }
    };

    const handleDownload = (source: InformationSource) => {
        if (!source.content) return;

        const blob = new Blob([source.content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${source.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getIcon = (type: SourceType) => {
        switch (type) {
            case 'link': return <LinkIcon className="w-4 h-4" />;
            case 'json': return <FileJson className="w-4 h-4" />;
            case 'secret': return <Key className="w-4 h-4" />;
            case 'markdown': return <FileText className="w-4 h-4" />;
            case 'text': return <FileText className="w-4 h-4" />;
            case 'file': return <File className="w-4 h-4" />;
            default: return <Code className="w-4 h-4" />;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setFormData({ ...formData, content });
        };
        reader.readAsText(file);
    };

    const sourceTypeLabel = (type: SourceType | 'all') => {
        if (type === 'all') return t('newSource.allTypes');
        return t(`newSource.type.${type}`);
    };

    return (
        <PasswordGate>
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header & Actions */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('newSource.title')}</h1>
                            <p className="text-muted-foreground mt-1">{t('newSource.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => editingId ? handleCancelEdit() : setIsFormOpen(!isFormOpen)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isFormOpen ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isFormOpen ? t('common.cancel') : t('newSource.newSource')}
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t('newSource.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="w-full md:w-1/3">
                                <Select
                                    value=""
                                    onValueChange={(value) => {
                                        const tagId = parseInt(value);
                                        if (!searchTags.includes(tagId)) {
                                            setSearchTags([...searchTags, tagId]);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-full min-h-[40px]">
                                        <div className="flex flex-wrap gap-1 pr-6">
                                            {searchTags.length === 0 ? (
                                                <span className="text-muted-foreground font-normal">{t('newSource.filterByTags')}</span>
                                            ) : (
                                                searchTags.map(tagId => {
                                                    const tag = availableTags.find(t => t.id === tagId);
                                                    return tag ? (
                                                        <Badge key={tagId} variant="secondary" className="gap-1 font-normal">
                                                            {tag.name}
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSearchTags(searchTags.filter(id => id !== tagId));
                                                                }}
                                                                className="hover:text-destructive"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </Badge>
                                                    ) : null;
                                                })
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTags
                                            .filter(tag => !searchTags.includes(tag.id))
                                            .map(tag => (
                                                <SelectItem key={tag.id} value={tag.id.toString()}>
                                                    {tag.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`px-4 py-2 text-sm border rounded-md transition-colors flex items-center gap-2 ${showAdvancedFilters ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/50'}`}
                            >
                                <Filter className="w-4 h-4" />
                                {t('newSource.advancedFilters')}
                            </button>
                        </div>

                        {showAdvancedFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t mt-2 animate-in fade-in slide-in-from-top-2">
                                {/* Sort Order */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{t('newSource.sortBy')}</label>
                                    <Select
                                        value={sortConfig.field}
                                        onValueChange={(value) => setSortConfig({ ...sortConfig, field: value as SortField })}
                                    >
                                        <SelectTrigger className="h-9">
                                            <div className="flex items-center gap-2">
                                                {sortConfig.field === 'created_at' ? <Calendar className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                                <span>{sortConfig.field === 'created_at' ? t('newSource.sortDate') : t('newSource.sortName')}</span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="created_at">{t('newSource.createdDate')}</SelectItem>
                                            <SelectItem value="name">{t('newSource.sortName')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Direction */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{t('newSource.direction')}</label>
                                    <div className="flex bg-secondary/50 p-1 rounded-md border border-input">
                                        <button
                                            onClick={() => setSortConfig({ ...sortConfig, direction: 'asc' })}
                                            className={`flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded-sm transition-all ${sortConfig.direction === 'asc' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {t('newSource.asc')}
                                        </button>
                                        <button
                                            onClick={() => setSortConfig({ ...sortConfig, direction: 'desc' })}
                                            className={`flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded-sm transition-all ${sortConfig.direction === 'desc' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {t('newSource.desc')}
                                        </button>
                                    </div>
                                </div>

                                {/* Filter by Type */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{t('newSource.sourceType')}</label>
                                    <Select
                                        value={filterType}
                                        onValueChange={(value) => setFilterType(value as SourceType | 'all')}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder={t('newSource.allTypes')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('newSource.allTypes')}</SelectItem>
                                            <SelectItem value="text">{t('newSource.type.text')}</SelectItem>
                                            <SelectItem value="markdown">{t('newSource.type.markdown')}</SelectItem>
                                            <SelectItem value="json">{t('newSource.type.json')}</SelectItem>
                                            <SelectItem value="link">{t('newSource.type.link')}</SelectItem>
                                            <SelectItem value="secret">{t('newSource.type.secret')}</SelectItem>
                                            <SelectItem value="file">{t('newSource.type.file')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Show Favorites */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{t('newSource.favorites')}</label>
                                    <button
                                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                        className={`w-full h-9 flex items-center justify-between px-3 rounded-md border text-sm transition-colors ${showFavoritesOnly ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-input hover:bg-secondary'}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                                            {t('newSource.onlyFavorites')}
                                        </span>
                                        {showFavoritesOnly && <XIcon className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(searchTerm || searchTags.length > 0 || showFavoritesOnly || filterType !== 'all') && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSearchTags([]);
                                        setShowFavoritesOnly(false);
                                        setFilterType('all');
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 hover:underline"
                                >
                                    <XIcon className="h-3 w-3" />
                                    {t('newSource.clearFilters')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form Section */}
                    {isFormOpen && (
                        <div className="bg-card border rounded-lg shadow-sm p-6 animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-xl font-semibold mb-6">{editingId ? t('newSource.editSource') : t('newSource.addSource')}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('newSource.name')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-2 rounded-md border bg-background"
                                            placeholder={t('newSource.namePlaceholder')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('newSource.type')}</label>
                                        <select
                                            value={formData.source_type}
                                            onChange={e => setFormData({ ...formData, source_type: e.target.value as SourceType })}
                                            className="w-full p-2 rounded-md border bg-background"
                                        >
                                            <option value="text">{t('newSource.type.text')}</option>
                                            <option value="markdown">{t('newSource.type.markdown')}</option>
                                            <option value="json">{t('newSource.type.json')}</option>
                                            <option value="link">{t('newSource.type.link')}</option>
                                            <option value="secret">{t('newSource.type.secret')}</option>
                                            <option value="file">{t('newSource.type.file')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('newSource.tags')}</label>
                                    <Select
                                        value=""
                                        onValueChange={(value) => {
                                            const tagId = parseInt(value);
                                            if (!selectedTagIds.includes(tagId)) {
                                                setSelectedTagIds([...selectedTagIds, tagId]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTagIds.length === 0 ? (
                                                    <span className="text-muted-foreground">{t('newSource.selectTags')}</span>
                                                ) : (
                                                    selectedTagIds.map(tagId => {
                                                        const tag = availableTags.find(t => t.id === tagId);
                                                        return tag ? (
                                                            <Badge key={tagId} variant="secondary" className="gap-1">
                                                                {tag.name}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
                                                                    }}
                                                                    className="hover:text-destructive"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </Badge>
                                                        ) : null;
                                                    })
                                                )}
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTags
                                                .filter(tag => !selectedTagIds.includes(tag.id))
                                                .map(tag => (
                                                    <SelectItem key={tag.id} value={tag.id.toString()}>
                                                        {tag.name}
                                                    </SelectItem>
                                                ))}
                                            {availableTags.filter(tag => !selectedTagIds.includes(tag.id)).length === 0 && (
                                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                    {t('newSource.allTagsSelected')}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('newSource.description')}</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-2 rounded-md border bg-background"
                                        placeholder={t('newSource.descriptionPlaceholder')}
                                    />
                                </div>

                                {formData.source_type === 'link' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('newSource.url')}</label>
                                        <input
                                            required
                                            type="url"
                                            value={formData.url}
                                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full p-2 rounded-md border bg-background"
                                            placeholder="https://..."
                                        />
                                    </div>
                                ) : formData.source_type === 'markdown' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('newSource.markdownContent')}</label>
                                        <MarkdownEditor
                                            value={formData.content || ''}
                                            onChange={(content) => setFormData({ ...formData, content })}
                                            placeholder={t('newSource.markdownPlaceholder')}
                                        />
                                    </div>
                                ) : formData.source_type === 'file' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('newSource.fileCsv')}</label>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileChange}
                                                className="w-full p-2 rounded-md border bg-background text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t('newSource.fileHelp')}
                                            </p>
                                        </div>
                                        {formData.content && (
                                            <div className="mt-2">
                                                <label className="text-xs font-medium mb-1 block">{t('newSource.previewContent')}</label>
                                                <textarea
                                                    value={formData.content}
                                                    readOnly
                                                    className="w-full p-2 rounded-md border bg-secondary/20 h-[100px] font-mono text-xs text-muted-foreground resize-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('newSource.content')}</label>
                                        <textarea
                                            required
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full p-2 rounded-md border bg-background min-h-[150px] font-mono text-sm"
                                            placeholder={t('newSource.contentPlaceholder')}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-2">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/80 font-medium"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingId ? t('newSource.updateSource') : t('newSource.saveSource')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && sources.length === 0 && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* List Section */}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSources.map((source) => (
                                <div key={source.id} className="group bg-card border rounded-lg p-5 shadow-sm hover:shadow-md transition-all relative">
                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => toggleFavorite(source.id, e)}
                                        className={`absolute top-5 right-5 p-1.5 rounded-full transition-colors ${favorites.includes(source.id) ? 'text-red-500 bg-red-50' : 'text-muted-foreground/30 hover:text-red-400 hover:bg-red-50'}`}
                                        title={favorites.includes(source.id) ? t('newSource.removeFavorite') : t('newSource.addFavorite')}
                                    >
                                        <Heart className={`w-4 h-4 ${favorites.includes(source.id) ? 'fill-current' : ''}`} />
                                    </button>

                                    <div className="flex justify-between items-start mb-3 pr-8">
                                        <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1 mr-2">
                                            <div className="flex-shrink-0 p-2 bg-secondary/50 rounded-md text-secondary-foreground">
                                                {getIcon(source.source_type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold truncate" title={source.name}>{source.name}</h3>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">{sourceTypeLabel(source.source_type)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {source.metadata?.tags && Array.isArray(source.metadata.tags) && source.metadata.tags.map((tagId: any) => {
                                            // Handle both IDs and potentially names/objects if legacy, though we aim for IDs
                                            const tag = availableTags.find(t => t.id === tagId);
                                            return tag ? (
                                                <Badge key={tag.id} variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                    {tag.name}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-[40px]">
                                        {source.description || t('newSource.noDescription')}
                                    </p>

                                    <div className="bg-secondary/30 rounded p-3 font-mono text-xs text-muted-foreground overflow-hidden h-[80px] relative">
                                        {source.source_type === 'link' ? source.url : source.content}
                                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-transparent pointer-events-none" />
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{new Date(source.created_at).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US')}</span>
                                        <div className="flex gap-1 flex-shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {source.source_type === 'file' && (
                                                <button
                                                    onClick={() => handleDownload(source)}
                                                    disabled={loading}
                                                    className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={t('newSource.download')}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(source)}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={t('newSource.edit')}
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleCopy(source.content, source.url)}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={t('newSource.copyContent')}
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(source.id)}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={t('newSource.delete')}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sources.length === 0 && !isFormOpen && !loading && (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-secondary/5">
                            <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4 text-muted-foreground">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">{t('newSource.emptyTitle')}</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">{t('newSource.emptyDescription')}</p>
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="text-primary hover:underline text-sm font-medium"
                            >
                                {t('newSource.emptyAction')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PasswordGate>
    );
};

export default NewDataSource;
