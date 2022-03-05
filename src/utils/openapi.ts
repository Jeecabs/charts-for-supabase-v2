import { OpenAPIV2 } from 'openapi-types';
import { Param } from './types';
const RPC_PREFIX = '/rpc/';

export const getRPCNames = (
  schema: OpenAPIV2.Document | undefined
): string[] | undefined =>
  schema
    ? Object.keys(schema?.paths)
        .filter((path) => path.startsWith(RPC_PREFIX))
        .map((path) => path.substring(RPC_PREFIX.length))
        .sort()
    : undefined;

export const getTableAndViewNames = (
  schema: OpenAPIV2.Document | undefined
): string[] | undefined =>
  schema?.definitions ? Object.keys(schema.definitions).sort() : undefined;

export const getColumns = (
  table: string | undefined,
  definitions: OpenAPIV2.DefinitionsObject | undefined
): string[] | undefined => {
  if (!table || !definitions || !definitions[table]) {
    return undefined;
  }

  const { properties } = definitions[table];
  return properties ? Object.keys(properties) : undefined;
};

export const getRPCParamInfo = (
  rpc: string,
  paths: OpenAPIV2.PathsObject | undefined
): { [name: string]: OpenAPIV2.SchemaObject } | undefined => {
  const path = paths?.[RPC_PREFIX + rpc];

  const param0 = path?.post?.parameters?.[0];

  if (param0 && 'schema' in param0 && param0.name === 'args') {
    return param0.schema.properties;
  }
};

export const formatParams = (
  rpc: string,
  params: Param[] | undefined,
  schema: OpenAPIV2.Document | undefined
): object | undefined => {
  const paramInfos = getRPCParamInfo(rpc, schema?.paths);
  if (!paramInfos) {
    return;
  }

  const formattedParams: Record<string, unknown> = {};
  params?.forEach((param) => {
    const info = paramInfos[param.name];
    if (info) {
      if (info.type === 'boolean') {
        formattedParams[param.name] = param.value === 'true';
      } else if (['integer', 'long'].includes(info.type as string)) {
        formattedParams[param.name] = parseInt(param.value);
      } else if (['double', 'float'].includes(info.type as string)) {
        formattedParams[param.name] = parseFloat(param.name);
      } else {
        formattedParams[param.name] = param.value;
      }
    }
  });

  return formattedParams;
};
