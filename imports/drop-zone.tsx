// import { Box } from '@chakra-ui/react';
// import { useDeep } from '@deep-foundation/deeplinks/imports/client';
// import React, { useMemo, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import axios from 'axios';

// export function useFile() {

// }

// export async function upload(linkId, file: Blob | string, deep) {
//   var formData = new FormData();
//   formData.append("file", file);
//   console.log('drop-zone formData', formData);
//   await axios.post(`http${deep.client.ssl ? 's' : ''}://${deep.client.path.slice(0, -4)}/file`, formData, {
//     headers: {
//       'linkId': linkId,
//       "Authorization": `Bearer ${deep.token}`,
//     },
//   })
// }

// export function useFiles() {
//   const deep = useDeep();
//   return useMemo(() => {
//     return {
//       upload: (linkId, file) => upload(linkId, file, deep),
//       insert: () =>
//     };
//   }, []);
// }

// let counter = 0;

// export const CytoDropZone = React.memo(function CytoDropZone({
//   cy,
//   children,
//   gqlPath,
//   gqlSsl,
//   render=({
//     getRootProps,
//     input,
//     isDragAccept,
//     isDragActive,
//     isDragReject,
//     children,
//   }) => (
//     <Box>
//       <Box {...getRootProps({})} onClick={() => {}} position="absolute" left={0} top={0} w={'100%'} h={'100%'} bg={
//         isDragActive ? 'blue' : isDragAccept ? 'green' : isDragReject ? 'red' : 'transparent'
//       }>
//         {input}
//         {children}
//       </Box>
//     </Box>
//   ),
// }: {
//   cy?: any;
//   gqlPath: string;
//   gqlSsl: boolean;
//   render?: any;
//   children?: any;
// }) {
//   const deep = useDeep();

//   const onDrop = async (files, a, event) => {
//     for (const file of files) {
//       await deep.insert({
//         file,
//         type_id: deep.idLocal('@deep-foundation/core', 'AsyncFile'),
//         containerId,
//         ...insert,
//       });
//     }
//     // cy.add({
//     //   id: `file-${_id}`,
//     //   data: { id: _id, label: _id },
//     //   position: { x: ((event.clientX) - (pan.x)) / zoom, y: ((event.clientY) - (pan.y)) / zoom },
//     //   locked: true,
//     //   classes: 'file',
//     // });
//   };
//   const {
//     getRootProps,
//     getInputProps,
//     isDragActive,
//     isDragAccept,
//     isDragReject,    
//   } = useDropzone({
//     onDrop
//   });

//   const input = <input {...getInputProps()} />;

//   return render({
//     getRootProps,
//     input,
//     isDragActive,
//     isDragAccept,
//     isDragReject,
//     children,
//     deep,
//   });
// });