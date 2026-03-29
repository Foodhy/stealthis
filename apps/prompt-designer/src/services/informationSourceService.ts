import { getDataProvider } from '@/data/providerFactory';
import { InformationSource, InformationSourceInput } from '@/types/dataSource';

export const informationSourceService = {
  getAll: async (): Promise<InformationSource[]> => getDataProvider().sources.getAllSources(),
  getById: async (id: number): Promise<InformationSource | null> =>
    getDataProvider().sources.getSourceById(id),
  add: async (input: InformationSourceInput): Promise<InformationSource> =>
    getDataProvider().sources.addSource(input),
  update: async (id: number, input: Partial<InformationSourceInput>): Promise<void> =>
    getDataProvider().sources.updateSource(id, input),
  delete: async (id: number): Promise<void> => getDataProvider().sources.deleteSource(id),
};
