import { DataProvider } from "@/data/contracts";
import { localDataProvider } from "@/data/providers/localProvider";

export const getDataProvider = (): DataProvider => localDataProvider;

export const getActiveDataProviderKind = (): DataProvider["kind"] => "local";
