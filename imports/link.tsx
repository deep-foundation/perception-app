import {
  Box,
  Button
} from '@chakra-ui/react';
import { Id } from '@deep-foundation/deeplinks/imports/minilinks';

export const LinkButton = ({
  id, name, type, icon, isActive, onClick,
  buttonRef,
  ...props
}: {
  id: Id;
  name?: string;
  type: string;
  icon: string;
  isActive: boolean;
  onClick?: (id: Id) => void;

  buttonRef?: any;

  [key: string]: any;
}) => {
  return <Button
    ref={buttonRef}
    h='3em' variant={isActive ? 'active' : 'solid'}
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      onClick && onClick(id);
    }}
    justifyContent={'left'}
    {...props}
  >
    {icon} <Box textAlign='left' pl='0.5em'>
      {!!((name) || (type)) && <Box fontSize="sm">{name || type}</Box>}
      <Box fontSize="xxs">{name ? type : ''} {id}</Box>
    </Box>
  </Button>;
};