import React from 'react';
import { Card } from '@/components/native/card';
import { Badge } from '@/components/native/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/native/button';
import { Search, X, User, Package, Clock, Settings, Hash, ChevronRight, ChevronLeft } from '@/components/icons';
import { Input } from '@/components/native/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/native/select';
import { PromptVariable } from '@/services/valuesService';

interface VariablePanelProps {
  variables: PromptVariable[];
  onAddVariable: (variable: string) => void;
  onRemoveVariable: (variable: string) => void;
  tools: Record<string, boolean>;
  availableTools: Array<{ name: string; display_name: string; info: string }>;
  onToggleTool: (toolId: string, enabled: boolean) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  onInsertVariable?: (variable: string) => void;
}

export const VariablePanel: React.FC<VariablePanelProps> = ({
  variables,
  onAddVariable,
  onRemoveVariable,
  tools,
  availableTools,
  onToggleTool,
  isVisible,
  setIsVisible,
  onInsertVariable
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [panelMode, setPanelMode] = React.useState<'tools' | 'variables'>('tools');
  // State for open accordion items
  const [openItems, setOpenItems] = React.useState<string[]>(['usuario', 'producto', 'fecha', 'sistema', 'personalizada']);

  // Update openItems when categories change (optional, to ensure new categories are visible or keep existing behavior)
  // For now, let's just initialize it once or let the user control it. 
  // If we want new categories to auto-open, we'd need an effect, but that might annoy the user.
  // We'll stick to user control + initial defaults.

  // Organizar variables por categorías (variable_type)
  const categorizedVariables = React.useMemo(() => {
    const filteredVars = variables.filter(variable =>
      variable.variable_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories: Record<string, PromptVariable[]> = {};

    filteredVars.forEach(variable => {
      // Normalize category key
      const category = (variable.variable_type || 'General').toLowerCase();
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(variable);
    });

    return categories;
  }, [variables, searchTerm]);

  // Update open items if we have a search term to show results? 
  // Or just keep it simple. controlled state fixes the reported bug.

  const handleVariableClick = (variable: string) => {
    if (onInsertVariable) {
      onInsertVariable(variable);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('user') || category.includes('usuario')) return User;
    if (category.includes('product') || category.includes('producto')) return Package;
    if (category.includes('date') || category.includes('fecha')) return Clock;
    if (category.includes('system') || category.includes('sistema')) return Settings;
    return Hash;
  };

  const getCategoryLabel = (category: string) => {
    // Capitalize
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card className={`${isVisible ? 'w-64' : 'w-12'} m-4 p-4 flex flex-col transition-all duration-300`}>
      {isVisible ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <Select value={panelMode} onValueChange={(value) => setPanelMode(value as 'tools' | 'variables')}>
              <SelectTrigger className="h-9 w-full min-w-[180px] text-sm font-medium">
                <SelectValue placeholder="Selecciona vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tools">Herramientas</SelectItem>
                <SelectItem value="variables">Variables</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {panelMode === 'variables' ? (
            <>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar variable..."
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 pr-1">
                <Accordion
                  type="multiple"
                  value={openItems}
                  onValueChange={setOpenItems}
                  className="w-full"
                >
                  {Object.entries(categorizedVariables).map(([category, categoryVars]) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <AccordionItem key={category} value={category} className="border-b border-border/50">
                        <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{getCategoryLabel(category)}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {categoryVars.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 pb-3">
                          <div className="space-y-2">
                            {categoryVars.map(variable => (
                              <div key={variable.variable_name} className="group relative">
                                <Badge
                                  variant="secondary"
                                  className="block w-full cursor-pointer px-3 py-2 pr-8 text-xs bg-variable-bg text-variable-text hover:bg-accent transition-colors"
                                  onClick={() => handleVariableClick(variable.variable_name)}
                                  title={variable.description}
                                >
                                  {`{{${variable.variable_name}}}`}
                                </Badge>
                                {/* Only allow removing if it's strictly local/personal? Or just allow removing from list view? 
                                      The previous logic allowed removal. We usually only want to 'hide' global ones or remove local ones. 
                                      For now, keep remove button but it only removes from view state */}
                                <Button
                                  onClick={() => onRemoveVariable(variable.variable_name)}
                                  size="sm"
                                  variant="ghost"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                                >
                                  <X className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>

              <div className="mt-4 text-xs text-muted-foreground">
                <p>Haz clic para insertar.</p>
              </div>
            </>
          ) : (
            <>
              {/* Tool rendering section remains same */}
              <div className="mb-4 space-y-1 text-xs text-muted-foreground">
                <p>Herramientas disponibles.</p>
              </div>

              <ScrollArea className="flex-1 pr-1">
                <div className="space-y-3">
                  {availableTools.map(tool => {
                    const isEnabled = !!tools[tool.name];
                    return (
                      <div key={tool.name} className="rounded-md border border-border/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{tool.display_name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{tool.info}</p>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => onToggleTool(tool.name, checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Las herramientas habilitadas aparecerán en el resumen.</p>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(true)}
            className="h-8 w-8 p-0"
            title="Mostrar panel"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="writing-mode-vertical-rl text-center">
            <span className="text-xs font-medium text-foreground">
              {panelMode === 'tools' ? 'Herramientas' : 'Variables'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
