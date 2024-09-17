import type { NextApiRequest, NextApiResponse } from 'next';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { DeepClient } from '@deep-foundation/deeplinks';

type Preloaded = {
    handlers: any[];
    packages: any[];
}

console.log('process.env', process.env);
const deep = new DeepClient({
    apolloClient: generateApolloClient({
        path: `${process.env.DEEPLINKS}/gql`.replace(/(^\w+:|^)\/\//, ''),
        ssl: !!+process.env.SSL,
        secret: process.env.SECRET,
    }),
});

const preloaded = {
    handlers: [],
    packages: [],
};

deep.subscribe({
    type_id: {
        _nin: [
            deep.idLocal('@deep-foundation/core', 'Promise'),
            deep.idLocal('@deep-foundation/core', 'Then'),
            deep.idLocal('@deep-foundation/core', 'Rejected'),
            deep.idLocal('@deep-foundation/core', 'Resolved'),
            deep.idLocal('@deep-foundation/core', 'PromiseResult'),
        ]
    },
    up: {
        tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
        parent: {
            type_id: { _eq: deep.idLocal('@deep-foundation/core', 'Package') },
            string: { value: { _neq: 'deep' } },
        },
    },
    return: {
        _version: {
            relation: 'in',
            type_id: deep.idLocal('@deep-foundation/core', 'PackageVersion')
        },
    },
}, { apply: 'packages' }).subscribe({
    // @ts-ignore
    next: ({ plainLinks: packages }) => {
        preloaded.packages = packages;
    },
});

deep.subscribe({
    execution_provider_id: { _eq: deep.idLocal('@deep-foundation/core', 'JSExecutionProvider') },
    return: {
        dist: { relation: 'dist' }
    },
}, { table: 'handlers' }).subscribe({
    // @ts-ignore
    next: ({ data: handlers }) => {
        preloaded.handlers = handlers;
    },
});

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Preloaded>
) {
    res.status(200).json(preloaded);
}