import { IconButton, Popover, PopoverContent, PopoverTrigger, Portal, SlideFade, useDisclosure } from "@chakra-ui/react";
import { useDeep, useDeepId } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from "@deep-foundation/deeplinks/imports/minilinks";
import React, { useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { Tree } from "./tree";

export const FinderPopover = React.memo(function FinderPopover({
    // link,
    onSubmit,
    onChange,
    onOpen,
    onClose,
    children,
    PopoverProps = {},
    PortalProps = {},
  }: {
    // link: Link<Id>;
    onSubmit: (link) => void;
    onChange?: (link) => void;
    onOpen?: () => void;
    onClose?: () => void;
    children?: any;
    PopoverProps?: any;
    PortalProps?: any;
  }) {
  const deep = useDeep();
  const [selectedLink, setSelectedLink] = useState<Link<Id>>();
  const { onOpen: _onOpen, onClose: _onClose, isOpen: _isOpen } = useDisclosure();
  return <Popover
    isLazy
    placement='right-start'
    onOpen={(...args) => (_onOpen(...args),(onOpen && onOpen()))} onClose={(...args) => (_onClose(...args),(onClose && onClose()))} isOpen={_isOpen}
    {...PopoverProps}
  >
    <PopoverTrigger>
      {children}
    </PopoverTrigger>
    <Portal {...PortalProps}>
      <PopoverContent h={'32em'} w={'25em'}>
        {_isOpen && <Tree
          onChange={(l, p) => {
            onChange && onChange(l);
            setSelectedLink(l);
          }}
          onEnter={l => {
            _onClose && _onClose();
            onSubmit && onSubmit(l);
          }}
          autoFocus
          onescreen
        />}
        <SlideFade in={!!selectedLink} offsetX='-0.5rem' style={{position: 'absolute', bottom: 0, right: '-2.8rem'}}>
          <IconButton
            isRound
            variant='active'
            // color='white'
            aria-label='submit button'
            icon={<BsCheck2 />}
            onClick={async () => {
              if (selectedLink) {
                _onClose && _onClose();
                onSubmit && onSubmit(selectedLink);
              }
            }}
          />
        </SlideFade>
      </PopoverContent>
    </Portal>
  </Popover>;
}, () => true);
