import React from 'react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';

export default function Page() {
  const deep = useDeep();
  var { data: itemsContainedIntoMe } = deep.useDeepSubscription({ in: { from_id: deep.linkId, type_id: 3 } });
  console.log(itemsContainedIntoMe);

  return <div>{itemsContainedIntoMe.map(l => <div>{l.id}</div>)}</div>
}