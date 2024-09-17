import { DeepClient } from '@deep-foundation/deeplinks/imports/client.js';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

let path, ssl = true;
try { path = process.env.GQL || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://deeplinks.deep.foundation/gql' } catch(e) {}
try { ssl = new URL(path).protocol === "https:" } catch(e) {}

const secret = process.env.SECRET || process.env.DEEPLINKS_HASURA_SECRET;
const token = process.env.TOKEN || process.env.NEXT_PUBLIC_DEEP_TOKEN;

const deep = new DeepClient({
  apolloClient: generateApolloClient({
    path: `${path}`.replace(/(^\w+:|^)\/\//, ''),
    ssl: ssl,
    secret: secret,
    token: token,
  }),
})

var init = async () => {
  const { plainLinks: packages } = await deep.select({
    type_id: { _nin: [
      deep.idLocal('@deep-foundation/core', 'Promise'),
      deep.idLocal('@deep-foundation/core', 'Then'),
      deep.idLocal('@deep-foundation/core', 'Rejected'),
      deep.idLocal('@deep-foundation/core', 'Resolved'),
      deep.idLocal('@deep-foundation/core', 'PromiseResult'),
    ] },
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
  }, { apply: 'packages' });

  const { data: handlers } = await deep.select({
    execution_provider_id: { _eq: deep.idLocal('@deep-foundation/core', 'JSExecutionProvider') },
    return: {
      dist: { relation: 'dist' }
    },
  }, { table: 'handlers' });

  console.log('preloader packages', packages?.length || 0);
  console.log('preloader handlers', handlers?.length || 0);
  if (!packages?.length || !handlers?.length) {
    console.log('preloader ignored');
    return;
  }
  deep.minilinks.apply(packages, 'packages');
  const preloaded = deep.minilinks.links.map(l => l.toPlain());
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  fs.writeFileSync(__dirname+'/imports/preloaded.js', `export default ${JSON.stringify({
    packages: preloaded,
    handlers,
  }, null, 2)}`);
  console.log('preloader success', __dirname+'/imports/preloaded.js');
}

if (secret || token) {
  init();
}
