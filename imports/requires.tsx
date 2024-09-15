import * as perception from '@deep-foundation/perception-imports';
import { requires as piRequires } from '@deep-foundation/perception-imports';
import dynamic from 'next/dynamic';

// @ts-ignore
const GraphQL = dynamic(() => import('./graphql').then(m => m.GraphQL), { ssr: false })

export const requires: any = {
  ...piRequires,
  '@deep-foundation/perception-imports': perception,
  '@deep-foundation/perception-app': {
    ...perception,
    GraphQL,
  },
};

