"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const visitor_1 = require("./visitor");
exports.UrqlVisitor = visitor_1.UrqlVisitor;
const path_1 = require("path");
exports.plugin = (schema, documents, config) => {
    const allAst = graphql_1.concatAST(documents.reduce((prev, v) => {
        return [...prev, v.content];
    }, []));
    const allFragments = [
        ...allAst.definitions.filter(d => d.kind === graphql_1.Kind.FRAGMENT_DEFINITION).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
        ...(config.externalFragments || []),
    ];
    const visitor = new visitor_1.UrqlVisitor(allFragments, config);
    const visitorResult = graphql_1.visit(allAst, { leave: visitor });
    return {
        prepend: visitor.getImports(),
        content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
    };
};
exports.validate = async (schema, documents, config, outputFile) => {
    if (config.withComponent === false) {
        if (path_1.extname(outputFile) !== '.ts' && path_1.extname(outputFile) !== '.tsx') {
            throw new Error(`Plugin "urql" with "noComponents" requires extension to be ".ts" or ".tsx"!`);
        }
    }
    else {
        if (path_1.extname(outputFile) !== '.tsx') {
            throw new Error(`Plugin "urql" requires extension to be ".tsx"!`);
        }
    }
};
//# sourceMappingURL=index.js.map