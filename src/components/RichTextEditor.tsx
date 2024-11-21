'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  initialContent = '',
  onUpdate,
  readOnly = false,
  placeholder = 'Start typing...',
  minHeight = '2.5rem',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc ml-4 space-y-0',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal ml-4 space-y-0',
          },
        },
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose focus:outline-none min-h-[${minHeight}] max-w-none`,
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        let content = editor.getHTML();
        content = content.replace(/\n\s*\n/g, '\n');
        content = content.replace(/<\/li>\s*<li>/g, '</li><li>');
        content = content.replace(/<\/ul>\s*<ul>/g, '</ul><ul>');
        content = content.replace(/<\/ol>\s*<ol>/g, '</ol><ol>');
        onUpdate(content);
      }
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="border rounded-md p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
