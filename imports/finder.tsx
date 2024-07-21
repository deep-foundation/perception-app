import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverContent, PopoverTrigger, Portal, SlideFade, useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { Id, Link } from "@deep-foundation/deeplinks/imports/minilinks";
import { createContext, memo, useContext, useRef, useState } from "react";
import { BsCheck2, BsX } from "react-icons/bs";
import { Result, Tree } from "./tree";
import { LinkButton } from "./link";
import Chance from 'chance';
import { Orientation } from "./orientation";
var chance = new Chance();

export const FinderContext = createContext<any>(undefined);
export const FinderProvider = memo(function FinderProvider({ children }: { children: any; }) {
  const ref = useRef<any>();
  return <>
    <div ref={ref}></div>
    <FinderContext.Provider value={ref}>
      {children}
    </FinderContext.Provider>
  </>
}, () => true);

export const FinderPopover = memo(function FinderPopover({
    scope,
    linkId,
    query,
    search,
    onSubmit,
    onChange,
    onOpen,
    onClose,
    children,
    PopoverProps = {},
    PortalProps = {},
    disclosure: __disclosure,
    mode = 'popover',
    header = '',
    where,
  }: {
    scope: string;
    linkId?: Id;
    query?: any;
    search?: string;
    onSubmit: (link) => void;
    onChange?: (link) => void;
    onOpen?: () => void;
    onClose?: () => void;
    children?: any;
    PopoverProps?: any;
    PortalProps?: any;
    disclosure?: UseDisclosureReturn;
    mode?: 'popover' | 'modal';
    header?: string;
    where?: any;
  }) {
  const ref = useContext(FinderContext);
  const [selectedLink, setSelectedLink] = useState<Link<Id>>();
  const _disclosure = useDisclosure();
  const { onOpen: _onOpen, onClose: _onClose, isOpen: _isOpen } = __disclosure || _disclosure;
  const [unique] = useState(linkId || chance.string());

  const tree = _isOpen && <Orientation
    linkId={linkId}
    query={query}
    search={search}
    scope={`finder-tree-${scope}`}
    insert={false}
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
  >
    <Tree onescreen autoFocus/>
  </Orientation>;

  const buttons = <>
    {mode === 'modal' && <SlideFade in={true} offsetX='-0.5rem' style={{position: 'absolute', top: 0, right: '-4em'}}>
      <Button
        w='3em' h='3em'
        boxShadow='dark-lg'
        variant={undefined}
        onClick={async () => {
          _onClose && _onClose();
        }}
      ><BsX /></Button>
    </SlideFade>}
    <SlideFade in={!!selectedLink} offsetX='-0.5rem' style={{position: 'absolute', bottom: 0, right: '-4em'}}>
      <Button
        w='3em' h='3em'
        boxShadow='dark-lg'
        variant={'active'}
        onClick={async () => {
          if (selectedLink) {
            _onClose && _onClose();
            onSubmit && onSubmit(selectedLink);
          }
        }}
      ><BsCheck2 /></Button>
    </SlideFade>
  </>;
  
  if (mode === 'modal') return <>
    <Modal
      onClose={(...args) => (_onClose(...args),(onClose && onClose()))}
      isOpen={_isOpen} portalProps={{ containerRef: ref }}
    >
      <ModalOverlay />
      <ModalContent w='80vw' h='80vh' position='relative'>
        <ModalHeader>{header}</ModalHeader>
        <Box position='absolute' bottom='-0.5em' right='-0.5em' boxShadow='dark-lg' zIndex={2}>
          {!!selectedLink && <LinkButton id={selectedLink?.id} maxW='100%'/>}
        </Box>
        <ModalCloseButton />
        <ModalBody>
          {tree}
        </ModalBody>
        {buttons}
      </ModalContent>
    </Modal>
    {children}
  </>

  if (mode === 'popover') return <Popover
    isLazy
    placement='right-start'
    onOpen={(...args) => (_onOpen(...args),(onOpen && onOpen()))} onClose={(...args) => (_onClose(...args),(onClose && onClose()))} isOpen={_isOpen}
    {...PopoverProps}
  >
    <PopoverTrigger>
      {children}
    </PopoverTrigger>
    <Portal containerRef={ref} {...PortalProps}>
      <PopoverContent h={'32em'} w={'25em'} boxShadow='dark-lg' position='relative'>
        <Box position='absolute' bottom='-0.5em' right='-0.5em' boxShadow='dark-lg' zIndex={2}>
          {!!selectedLink && <LinkButton id={selectedLink?.id} maxW='100%'/>}
        </Box>
        {tree}
        {buttons}
      </PopoverContent>
    </Portal>
  </Popover>;
});
