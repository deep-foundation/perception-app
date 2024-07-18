import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverContent, PopoverTrigger, Portal, SlideFade, useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { Id, Link } from "@deep-foundation/deeplinks/imports/minilinks";
import { createContext, memo, useContext, useRef, useState } from "react";
import { BsCheck2, BsX } from "react-icons/bs";
import { Tree } from "./tree";

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
    link,
    onSubmit,
    onChange,
    onOpen,
    onClose,
    children,
    PopoverProps = {},
    PortalProps = {},
    disclosure: __disclosure,
    mode = 'popover',
  }: {
    link: Link<Id>;
    onSubmit: (link) => void;
    onChange?: (link) => void;
    onOpen?: () => void;
    onClose?: () => void;
    children?: any;
    PopoverProps?: any;
    PortalProps?: any;
    disclosure?: UseDisclosureReturn;
    mode?: 'popover' | 'modal';
  }) {
  const ref = useContext(FinderContext);
  const [selectedLink, setSelectedLink] = useState<Link<Id>>();
  const _disclosure = useDisclosure();
  const { onOpen: _onOpen, onClose: _onClose, isOpen: _isOpen } = __disclosure || _disclosure;

  const tree = _isOpen && <Tree
    scope={`finder-tree-${link.id}`}
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
  />;

  const submit = <>
    <SlideFade in={true} offsetX='-0.5rem' style={{position: 'absolute', top: 0, right: '-4em'}}>
      <Button
        w='3em' h='3em'
        boxShadow='dark-lg'
        variant={undefined}
        onClick={async () => {
          _onClose && _onClose();
        }}
      ><BsX /></Button>
    </SlideFade>
    <SlideFade in={!!selectedLink} offsetX='-0.5rem' style={{position: 'absolute', bottom: 0, right: '-4em'}}>
      <Button
        w='3em' h='3em'
        boxShadow='dark-lg'
        variant={selectedLink ? 'active' : undefined}
        onClick={async () => {
          if (selectedLink) {
            _onClose && _onClose();
            onSubmit && onSubmit(selectedLink);
          }
        }}
      ><BsCheck2 /></Button>
    </SlideFade>
  </>;
  
  if (mode === 'modal') return <Modal
    onClose={(...args) => (_onClose(...args),(onClose && onClose()))}
    isOpen={_isOpen}
  >
    <ModalOverlay />
    <ModalContent w='80vw' h='80vh'>
      <ModalHeader>Modal Title</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {tree}
      </ModalBody>
      {submit}
    </ModalContent>
  </Modal>

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
      <PopoverContent h={'32em'} w={'25em'} boxShadow='dark-lg'>
        {tree}
        {submit}
      </PopoverContent>
    </Portal>
  </Popover>;
});
