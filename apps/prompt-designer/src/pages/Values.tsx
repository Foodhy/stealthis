
import { useState, useEffect } from 'react';
import { PasswordGate } from '@/components/PasswordGate';
import { Button } from '@/components/native/button';
import { Card } from '@/components/native/card';
import { Input } from '@/components/native/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/native/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { valuesService, Author, Tag, Tool, PromptVariable } from '@/services/valuesService';
import { Plus, Pencil, Trash2, Tag as TagIcon, Users, Wrench, Variable } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tab = 'authors' | 'tags' | 'tools' | 'variables';

export default function Values() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>('authors');
    const [loading, setLoading] = useState(false);

    // Data
    const [authors, setAuthors] = useState<Author[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [variables, setVariables] = useState<PromptVariable[]>([]);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // Author | Tag | Tool | null

    // Form State
    const [formData, setFormData] = useState<any>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'authors') {
                const data = await valuesService.getAuthors();
                setAuthors(data);
            } else if (activeTab === 'tags') {
                const data = await valuesService.getTags();
                setTags(data);
            } else if (activeTab === 'tools') {
                const data = await valuesService.getTools();
                setTools(data);
            } else if (activeTab === 'variables') {
                const data = await valuesService.getGlobalVariables();
                setVariables(data);
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error loading data', description: 'Failed to fetch ' + activeTab, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleOpenDialog = (item?: any) => {
        setEditingItem(item || null);
        if (activeTab === 'authors') {
            setFormData(item ? { ...item } : { name: '', email: '', team: '' });
        } else if (activeTab === 'tags') {
            setFormData(item ? { ...item } : { name: '' });
        } else if (activeTab === 'tools') {
            setFormData(item ? { ...item, configuration: JSON.stringify(item.configuration || {}, null, 2) } : { name: '', description: '', configuration: '{}' });
        } else if (activeTab === 'variables') {
            setFormData(item ? { ...item } : { variable_name: '', description: '' });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeTab === 'authors') {
                if (editingItem) {
                    await valuesService.updateAuthor(editingItem.id, formData);
                } else {
                    await valuesService.createAuthor(formData);
                }
            } else if (activeTab === 'tags') {
                if (editingItem) {
                    // Tags usually don't support update in this simple model, but let's assume create only or delete/re-create.
                    // Wait, service doesn't have updateTag. I'll skip update for tags or impl it if I added it.
                    // I didn't add updateTag. So I can only create.
                    // If editing, I guess I'll show error or not allow edit button for tags.
                    // Actually, I can just delete and create new if I really wanted, but let's disable edit for tags.
                } else {
                    await valuesService.createTag(formData.name);
                }
            } else if (activeTab === 'tools') {
                const payload = {
                    ...formData,
                    configuration: JSON.parse(formData.configuration || '{}')
                };
                if (editingItem) {
                    await valuesService.updateTool(editingItem.id, payload);
                } else {
                    await valuesService.createTool(payload);
                }
            } else if (activeTab === 'variables') {
                if (editingItem) {
                    // No update method in service for variables yet.
                    // Assuming create-only or delete-recreate for now as per minimal plan, or user could just delete.
                    // Let's support create only in this block effectively or throw if edit attempted without service support.
                    // Service only has createGlobalVariable.
                    // I will focus on CREATE for now.
                    // If editing needed, I should have added updateGlobalVariable.
                    // Let's stick to CREATE for the new plan request which was "guardar prompt_variables".
                } else {
                    await valuesService.createGlobalVariable(formData);
                }
            }

            setIsDialogOpen(false);
            fetchData();
            toast({ title: 'Success', description: 'Item saved successfully' });
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error', description: error.message || 'Failed to save', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            if (activeTab === 'authors') await valuesService.deleteAuthor(id);
            if (activeTab === 'tags') await valuesService.deleteTag(id);
            if (activeTab === 'tools') await valuesService.deleteTool(id);
            if (activeTab === 'variables') await valuesService.deleteGlobalVariable(id);
            fetchData();
            toast({ title: 'Success', description: 'Item deleted' });
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to delete. It might be in use.', variant: 'destructive' });
        }
    };

    return (
        <PasswordGate>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Valores</h1>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo {activeTab === 'authors' ? 'Autor' : activeTab === 'tags' ? 'Tag' : activeTab === 'tools' ? 'Herramienta' : 'Variable'}
                    </Button>
                </div>

                {/* Custom Tabs */}
                <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('authors')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                            activeTab === 'authors' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <Users className="w-4 h-4" /> Autores
                    </button>
                    <button
                        onClick={() => setActiveTab('tags')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                            activeTab === 'tags' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <TagIcon className="w-4 h-4" /> Tags
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                            activeTab === 'tools' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <Wrench className="w-4 h-4" /> Herramientas
                    </button>
                    <button
                        onClick={() => setActiveTab('variables')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2",
                            activeTab === 'variables' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        <Variable className="w-4 h-4" /> Variables
                    </button>
                </div>

                <Card className="p-0 overflow-hidden border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {activeTab === 'authors' && (
                                    <>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Equipo</TableHead>
                                    </>
                                )}
                                {activeTab === 'tags' && <TableHead>Nombre</TableHead>}
                                {activeTab === 'tools' && (
                                    <>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Descripción</TableHead>
                                    </>
                                )}
                                {activeTab === 'variables' && (
                                    <>
                                        <TableHead>Variable</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Tipo</TableHead>
                                    </>
                                )}
                                <TableHead className="w-[100px] text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeTab === 'authors' && authors.map(author => (
                                <TableRow key={author.id}>
                                    <TableCell className="font-medium">{author.name}</TableCell>
                                    <TableCell>{author.email || '-'}</TableCell>
                                    <TableCell>{author.team || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(author)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(author.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activeTab === 'tags' && tags.map(tag => (
                                <TableRow key={tag.id}>
                                    <TableCell className="font-medium">{tag.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Tags don't have update in service yet, just delete */}
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(tag.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activeTab === 'tools' && tools.map(tool => (
                                <TableRow key={tool.id}>
                                    <TableCell className="font-medium">{tool.name}</TableCell>
                                    <TableCell className="max-w-md truncate">{tool.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tool)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(tool.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activeTab === 'variables' && variables.map(variable => (
                                <TableRow key={variable.id}>
                                    <TableCell className="font-mono text-xs">{`{{${variable.variable_name}}}`}</TableCell>
                                    <TableCell>{variable.description || '-'}</TableCell>
                                    <TableCell>{variable.variable_type || 'text'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(variable.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!loading && ((activeTab === 'authors' && authors.length === 0) || (activeTab === 'tags' && tags.length === 0) || (activeTab === 'tools' && tools.length === 0) || (activeTab === 'variables' && variables.length === 0))) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No hay resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-lg h-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Editar' : 'Crear'} {activeTab === 'authors' ? 'Autor' : activeTab === 'tags' ? 'Tag' : activeTab === 'tools' ? 'Herramienta' : 'Variable'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 mt-4">
                            {activeTab === 'authors' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre</label>
                                        <Input
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Equipo</label>
                                        <Input
                                            value={formData.team || ''}
                                            onChange={e => setFormData({ ...formData, team: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'tags' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nombre del Tag</label>
                                    <Input
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            {activeTab === 'tools' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre (ID interno)</label>
                                        <Input
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descripción</label>
                                        <Input
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Configuración (JSON)</label>
                                        <textarea
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                            value={formData.configuration || ''}
                                            onChange={e => setFormData({ ...formData, configuration: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'variables' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Categoría (Tipo)</label>
                                        <Input
                                            placeholder="ej. Usuario, Sistema, Personalizada"
                                            value={formData.variable_type || ''}
                                            onChange={e => setFormData({ ...formData, variable_type: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre de la Variable</label>
                                        <Input
                                            placeholder="ej. nombre_cliente"
                                            value={formData.variable_name || ''}
                                            onChange={e => setFormData({ ...formData, variable_name: e.target.value })}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">Sin llaves {'{{ }}'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descripción</label>
                                        <Input
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

            </div >
        </PasswordGate >
    );
}
