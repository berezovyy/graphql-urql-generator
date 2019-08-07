import { ClientSideBaseVisitor, ClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { UrqlRawPluginConfig } from './index';
import { OperationDefinitionNode } from 'graphql';
export interface UrqlPluginConfig extends ClientSideBasePluginConfig {
    withComponent: boolean;
    withHooks: boolean;
    urqlImportFrom: string;
}
export declare class UrqlVisitor extends ClientSideBaseVisitor<UrqlRawPluginConfig, UrqlPluginConfig> {
    constructor(fragments: LoadedFragment[], rawConfig: UrqlRawPluginConfig);
    getImports(): string[];
    private _buildComponent;
    private _buildHooks;
    protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string;
}
