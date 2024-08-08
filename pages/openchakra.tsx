import { i18nGetStaticProps } from '../src/i18n';
// import { DeepNamespaceProvider } from '@deep-foundation/deeplinks/imports/client';
// import { MinilinksProvider } from '@deep-foundation/deeplinks/imports/minilinks';
// import { AutoGuest } from '@deep-foundation/perception-imports/imports/auto-guest';
// import { PreloadProvider } from '@deep-foundation/perception-imports/imports/hooks';
// import { ReactHandlersProvider } from '@deep-foundation/perception-imports/imports/react-handler';
// import { memo, useState } from 'react';
// import { HotkeysProvider } from 'react-hotkeys-hook';
// import { FinderProvider } from '../imports/finder';
// import { Mounted } from '../imports/mounted';
// import { useDeepPath } from '../src/provider';

// // import { DndProvider } from 'react-dnd'
// // import { HTML5Backend } from 'react-dnd-html5-backend'
// // import { Global } from '@emotion/react'
// // import Metadata from 'open-chakra/src/components/Metadata.tsx';
// // import useShortcuts from 'open-chakra/src/hooks/useShortcuts.tsx';
// // import Header from 'open-chakra/src/components/Header.tsx';
// // import Sidebar from 'open-chakra/src/components/sidebar/Sidebar.tsx';
// // import EditorErrorBoundary from 'open-chakra/src/components/errorBoundaries/EditorErrorBoundary.tsx';
// // import Editor from 'open-chakra/src/components/editor/Editor.tsx';
// // import { InspectorProvider } from 'open-chakra/src/contexts/inspector-context.tsx';
// // import Inspector from 'open-chakra/src/components/inspector/Inspector.tsx';

// const dpl = '@deep-foundation/perception-links';
// const dc = '@deep-foundation/core';

// export const Content = memo(function Content() {
//   return (<>
//     {/* <Global
//       styles={() => ({
//         html: { minWidth: '860px', backgroundColor: '#1a202c' },
//       })}
//     />
//     <Metadata />
//     <Header />*/}
//     {/* @ts-ignore */}
//     {/*<DndProvider backend={HTML5Backend}>
//       <Flex h="calc(100vh - 3rem)">
//         <Sidebar />
//         <EditorErrorBoundary>
//           <Box bg="white" flex={1} position="relative">
//             <Editor />
//           </Box>
//         </EditorErrorBoundary>

//         <Box
//           maxH="calc(100vh - 3rem)"
//           flex="0 0 15rem"
//           bg="#f7fafc"
//           overflowY="auto"
//           overflowX="visible"
//           borderLeft="1px solid #cad5de"
//         >
//           <InspectorProvider>
//             <Inspector />
//           </InspectorProvider>
//         </Box>
//       </Flex>
//     </DndProvider> */}
//   </>);
// }, () => true);

// export default function Page({
//   defaultPath,
//   defaultSsl,
//   serverUrl,
//   deeplinksUrl,
//   appVersion,
//   disableConnector,
// }: {
//   defaultPath: string;
//   defaultSsl: boolean;
//   serverUrl: string;
//   deeplinksUrl: string;
//   appVersion: string;
//   disableConnector: boolean;
// }) {
//   const [path, setPath] = useDeepPath(defaultPath);
//   const [ssl, setSsl] = useState(defaultSsl);
//   const [portal, setPortal] = useState(true);

//   return (<>
//     <HotkeysProvider>
//       <FinderProvider>
//         <DeepNamespaceProvider>
//           <MinilinksProvider>
//             <AutoGuest/>
//             <Mounted>
//               <PreloadProvider>
//                 <ReactHandlersProvider>
//                   <Content/>
//                 </ReactHandlersProvider>
//               </PreloadProvider>
//             </Mounted>
//           </MinilinksProvider>
//         </DeepNamespaceProvider>
//       </FinderProvider>
//     </HotkeysProvider>
//   </>);
// };

export default function Page() {
  return <></>;
}

export async function getStaticProps(arg) {
  const result: any = await i18nGetStaticProps(arg);
  result.props = result?.props || {};
  return result;
}