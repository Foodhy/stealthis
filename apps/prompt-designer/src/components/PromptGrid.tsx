import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/native/card';
import { Input } from '@/components/native/input';
import { Badge } from '@/components/native/badge';
import { Button } from '@/components/native/button';
import { getActiveDataProviderKind } from '@/data/providerFactory';
import { explainSupabaseError } from '@/integrations/supabase/errorDiagnostics';
import { listPromptSummaries, type PromptSummary } from '@/services/promptService';
import { Search, Plus, Filter, User, Calendar, Tag } from 'lucide-react';

interface PromptGridProps {
  onSelectPrompt: (promptId: number) => void;
  onCreateNew: () => void;
}

export const PromptGrid: React.FC<PromptGridProps> = ({ onSelectPrompt, onCreateNew }) => {
  const [prompts, setPrompts] = useState<PromptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [serviceWarning, setServiceWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true);
      const provider = getActiveDataProviderKind();

      try {
        if (provider === 'local') {
          setServiceWarning(
            'Provider activo: local. Si quieres usar la nube, define VITE_DATA_PROVIDER=supabase.',
          );
        } else {
          setServiceWarning(null);
        }

        const data = await listPromptSummaries();
        setPrompts(data || []);
      } catch (err) {
        setServiceWarning(
          provider === 'supabase'
            ? explainSupabaseError(err, {
                action: 'cargar prompts',
                expectedObjects: [
                  'latest_prompts_consolidated',
                  'prompts',
                  'prompt_components',
                  'prompt_tags',
                  'prompt_tools',
                  'prompt_variables',
                ],
              })
            : 'Fallo al cargar prompts desde el provider local.',
        );
        console.error('Error fetching prompts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    prompts.forEach(p => {
      p.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [prompts]);

  const allTeams = useMemo(() => {
    const teamSet = new Set<string>();
    prompts.forEach(p => {
      if (p.author_team) teamSet.add(p.author_team);
    });
    return Array.from(teamSet).sort();
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // Text search (title, description)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        prompt.title?.toLowerCase().includes(searchLower) ||
        prompt.description?.toLowerCase().includes(searchLower);

      // Tag filter
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => prompt.tags?.includes(tag));

      // Author filter
      const matchesAuthor = !authorFilter ||
        prompt.author_name?.toLowerCase().includes(authorFilter.toLowerCase());

      // Team filter
      const matchesTeam = !teamFilter ||
        prompt.author_team === teamFilter;

      return matchesSearch && matchesTags && matchesAuthor && matchesTeam;
    });
  }, [prompts, searchQuery, selectedTags, authorFilter, teamFilter]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setAuthorFilter('');
    setTeamFilter('');
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || authorFilter || teamFilter;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Prompts Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un prompt para editar o crea uno nuevo
            </p>
          </div>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Prompt Maestro
          </Button>
        </div>


        {serviceWarning && (
          <Card className="p-4 border-amber-500/30 bg-amber-500/10 text-amber-200">
            <p className="text-sm">{serviceWarning}</p>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showAdvancedFilters ? 'default' : 'outline'}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                Limpiar
              </Button>
            )}
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Autor
                </label>
                <Input
                  placeholder="Filtrar por nombre de autor..."
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Equipo</label>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Todos los equipos</option>
                  {allTeams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            'Cargando proyectos...'
          ) : (
            `${filteredPrompts.length} proyecto${filteredPrompts.length !== 1 ? 's' : ''} encontrado${filteredPrompts.length !== 1 ? 's' : ''}`
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              {prompts.length === 0 ? (
                <>
                  <p className="text-lg mb-2">No hay proyectos creados</p>
                  <p className="text-sm">Crea tu primer proyecto de prompts para comenzar</p>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">No se encontraron resultados</p>
                  <p className="text-sm">Intenta con otros filtros de búsqueda</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(prompt => (
              <Card
                key={prompt.id}
                className="p-5 cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group"
                onClick={() => onSelectPrompt(prompt.id)}
              >
                <div className="space-y-3">
                  {/* Title & Version */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {prompt.title}
                    </h3>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      v{prompt.version}
                    </Badge>
                  </div>

                  {/* Description */}
                  {prompt.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.description}
                    </p>
                  )}

                  {/* Tags */}
                  {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {prompt.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{prompt.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{prompt.author_name || 'Sin autor'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(prompt.updated_at)}</span>
                    </div>
                  </div>

                  {/* Variables count */}
                  {prompt.variable_count !== null && prompt.variable_count > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {prompt.variable_count} variable{prompt.variable_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
