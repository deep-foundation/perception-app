import { requires as piRequires } from '@deep-foundation/perception-imports'

// @ts-ignore
const GraphQL = dynamic(() => import('./graphql').then(m => m.GraphQL), { ssr: false })

export const requires: any = {
  ...piRequires
};

