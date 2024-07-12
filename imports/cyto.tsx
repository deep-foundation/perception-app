import {
  Box,
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { memo } from "react";

export const Cyto = memo(function Cyto() {
  const deep = useDeep();
  const links = deep.useMinilinksSubscription({});
  return <Box>
    {links.map(l => <Box>{JSON.stringify(l.toPlain())}</Box>)}
  </Box>;
}, () => true);