import { useColorMode } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { OnMount } from '@monaco-editor/react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { langs } from '@uiw/codemirror-extensions-langs';
import { useDebounceCallback } from '@react-hook/debounce';

interface IEditor {
  refEditor?: any;
  value?: any;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  onClose?: () => void;
  onExit?: () => void;
  minimap?: boolean;
  lineNumbers?: string;
  defaultLanguage?: string;
  onMount?: (editor: any, monaco: any) => any;
  [key:string]: any;
}

export const Editor = React.memo(({
  refEditor = { current: undefined },
  value = '',
  onChange,
  onSave,
  onClose,
  onExit,
  minimap = true,
  lineNumbers = 'on',
  defaultLanguage="javascript",
  onMount,
  ...props
}:IEditor) => {
  const [v, setV] = useState(value);
  const { colorMode } = useColorMode();
  const [lang, setLang] = useState<any>(langs.tsx());

  // const calcLang = useDebounceCallback(async () => {
  //   setLang(langs.tsx());
  // }, 1000);
  // useEffect(() => calcLang(), [v]);

  return <ReactCodeMirror
    value={value}
    theme={colorMode === 'light' ? githubLight : githubDark}
    extensions={[lang]}
    onChange={(value, viewUpdate) => {
      setV(value);
      onChange && onChange(value);
    }}
    {...props}
  />
  // const handleEditorDidMount: OnMount = (editor, monaco) => {
  //   refEditor.current = { editor, monaco };
  //   editor.getModel().updateOptions({ tabSize: 2 });
  //   editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
  //     onSave && onSave(refValue.current);
  //   });
  //   editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
  //       onClose && onClose();
  //   });
  //   editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Escape, () => {
  //     onExit && onExit();
  //   });
  //   onMount && onMount(editor, monaco);
  // }

  // return (<MonacoEditor
  //   options={{
  //     ...monacoEditorOptions,
  //     minimap: {
  //       enabled: minimap
  //     },
  //     // @ts-ignore
  //     lineNumbers: lineNumbers,
  //   }}
  //   height="100%"
  //   width="100%"
  //   theme={colorMode === 'light' ? 'light' : "vs-dark"}
  //   defaultLanguage={defaultLanguage}
  //   defaultValue={_.toString(value) || ''}
  //   onChange={onChange}
  //   onMount={handleEditorDidMount}
  // />)
})