import { ClientSideBaseVisitor, getConfigValue, OMIT_TYPE } from '@graphql-codegen/visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { Kind } from 'graphql';
import { titleCase } from 'change-case';
export class UrqlVisitor extends ClientSideBaseVisitor {
    constructor(fragments, rawConfig) {
        super(fragments, rawConfig, {
            withComponent: getConfigValue(rawConfig.withComponent, true),
            withHooks: getConfigValue(rawConfig.withHooks, false),
            urqlImportFrom: getConfigValue(rawConfig.urqlImportFrom, null),
        });
        autoBind(this);
    }
    getImports() {
        const baseImports = super.getImports();
        const imports = [];
        const hasOperations = this._collectedOperations.length > 0;
        if (!hasOperations) {
            return baseImports;
        }
        if (this.config.withComponent) {
            imports.push(`import * as React from 'react';`);
        }
        if (this.config.withComponent || this.config.withHooks) {
            imports.push(`import * as Urql from '${this.config.urqlImportFrom || 'urql'}';`);
        }
        imports.push(OMIT_TYPE);
        return [...baseImports, ...imports];
    }
    _buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
        const componentName = this.convertName(node.name.value, { suffix: 'Component', useTypesPrefix: false });
        const isVariablesRequired = operationType === 'Query' && node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);
        const generics = [operationResultType, operationVariablesTypes];
        if (operationType === 'Subscription') {
            generics.unshift(operationResultType);
        }
        return `
export const ${componentName} = (props: Omit<Urql.${operationType}Props<${generics.join(', ')}>, 'query'> & { variables${isVariablesRequired ? '' : '?'}: ${operationVariablesTypes} }) => (
  <Urql.${operationType} {...props} query={${documentVariableName}} />
);
`;
    }
    _buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) {
        const operationName = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });
        if (operationType === 'Mutation') {
            return `
export function use${operationName}() {
  return Urql.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
};`;
        }
        let generics = [operationVariablesTypes];
        if (operationType !== 'Subscription') {
            generics.unshift(operationResultType);
        }
        return `
export function use${operationName}(options: Omit<Urql.Use${operationType}Args<${generics.join(', ')}>, 'query'> = {}) {
  return Urql.use${operationType}<${operationResultType}>({ query: ${documentVariableName}, ...options });
};`;
    }
    buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
        const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
        const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;
        return [component, hooks].filter(a => a).join('\n');
    }
}
//# sourceMappingURL=visitor.js.map