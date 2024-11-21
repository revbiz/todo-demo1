'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return {
                style: `font-size: ${attributes.fontSize}px`,
              }
            },
          },
        },
      },
    ]
  },
});

interface RichTextContentProps {
  content: string;
  className?: string;
}

const RichTextContent = ({ content, className = '' }: RichTextContentProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: DOMPurify.sanitize(content),
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(DOMPurify.sanitize(content));
    }
  }, [content, editor]);

  if (!mounted || !editor) {
    return <div className={`${className} min-h-[1.5rem]`} />;
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextContent;
