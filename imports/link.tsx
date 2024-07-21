import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id } from '@deep-foundation/deeplinks/imports/minilinks';
import { symbol, useSymbol } from './tree';

export const LinkButton = ({
  id, name: _name, type: _type,
  icon: _icon,
  isActive = false,
  needParent = true,
  onClick,
  buttonRef,
  ...props
}: {
  id: Id;
  name?: string;
  type?: string;
  icon?: string;
  isActive?: boolean;
  needParent?: boolean;
  onClick?: (id: Id) => void;

  buttonRef?: any;

  [key: string]: any;
}) => {
  const deep = useDeep();
  const link = deep?.minilinks?.byId[id];
  const name = _name || link?.name;
  const type = _type || link?.type?.name;
  const symbol = useSymbol();
  const icon = _icon || symbol(link);

  const parent = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.from;
  const parentName = parent?.name || '';
  const parentIcon = symbol(parent);

  return <Button
    ref={buttonRef}
    variant={isActive ? 'active' : 'solid'}
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      onClick && onClick(id);
    }}
    justifyContent={'left'}
    h='auto' pt={2} pb={2}
    {...props}
  >
    {icon} <Box textAlign='left' pl='0.5em' w='100%' overflow='hidden' position='relative'>
      {!!parent && !!needParent && <Box fontSize="0.6em" textAlign='right'>{parentName} {parentIcon}</Box>}
      {!!((name) || (type)) && <Box fontSize="sm">{name || type}
      </Box>}
      <Box fontSize="xxs">{name ? type : ''} {id}</Box>
      {!!props?.children && props.children}
      {!!link?.value && <>
        <Text fontSize="xxs" opacity={0.5}>value:</Text>
        <Text fontSize="xs">
          {typeof(link?.value?.value) == 'string' && <>
            <Heading as='pre' fontSize='xs' noOfLines={1} w='100%'>{link?.value?.value}</Heading>
          </>}
          {typeof(link?.value?.value) == 'number' && <>
            <Heading as='pre' fontSize='xs' noOfLines={1} w='100%'>{link?.value?.value}</Heading>
          </>}
          {typeof(link?.value?.value) == 'object' && <>
            <Heading as='pre' fontSize='xs' noOfLines={1} w='100%'>{JSON.stringify(link?.value?.value)}</Heading>
          </>}
        </Text>
      </>}
    </Box>
  </Button>;
};