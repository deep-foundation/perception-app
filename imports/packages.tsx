import React, { useEffect, useState } from 'react';
import { Button } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";

export function Packages() {
  const deep = useDeep();
  const { data } = deep.useQuery({
    type_id: deep.idLocal('@deep-foundation/core', 'Package'),
    return: {
      contain: {
        relation: 'out', type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        return: {
          item: { relation: 'to' },
        },
      },
    },
  });
  // const count = deep.useMinilinksSubscription({ type_id: deep.idLocal('@deep-foundation/core', 'Package') }, { aggregate: 'count' }));
  const [count, setCount] = useState(0);
  useEffect(() => {
    // @ts-ignore
    setCount(deep.minilinks.select({ type_id: deep.idLocal('@deep-foundation/core', 'Package') }, { aggregate: 'count' }));
  }, [data]);
  return <Button w='3em' h='3em'>{count}</Button>;
}