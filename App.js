import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ header: [1, 2, 3, false] }],
  [{ color: [] }, { background: [] }],
  ['clean'],
];

function App() {
  const editorRef = useRef();
  const socketRef = useRef();
  const quillRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    const editor = document.createElement('div');
    editorRef.current.append(editor);

    quillRef.current = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    quillRef.current.on('text-change', (delta, _, source) => {
      if (source !== 'user') return;
      socketRef.current.emit('send-changes', delta);
    });

    socketRef.current.on('receive-changes', (delta) => {
      quillRef.current.updateContents(delta);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h2 style={{ textAlign: 'center' }}>Collaborative Editor</h2>
      <div ref={editorRef} style={{ height: '50vh', padding: '20px' }}></div>
    </div>
  );
}

export default App;
