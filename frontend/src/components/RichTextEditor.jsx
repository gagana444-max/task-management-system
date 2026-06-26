import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2, Quote, Undo, Redo } from 'lucide-react'

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const btnClass = (isActive) =>
    `p-1.5 rounded transition-all ${
      isActive
        ? 'bg-[#533afd] text-white shadow-sm'
        : 'text-[#64748d] hover:bg-[#f0efff] hover:text-[#533afd]'
    }`

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[#e3e8ee] p-2 bg-[#f8fafc] rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="Bold"
        type="button"
      >
        <Bold size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="Italic"
        type="button"
      >
        <Italic size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="Strikethrough"
        type="button"
      >
        <Strikethrough size={16} strokeWidth={2.5} />
      </button>
      
      <div className="w-px h-5 bg-[#e3e8ee] mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading"
        type="button"
      >
        <Heading2 size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Bullet List"
        type="button"
      >
        <List size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Numbered List"
        type="button"
      >
        <ListOrdered size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Quote"
        type="button"
      >
        <Quote size={16} strokeWidth={2.5} />
      </button>

      <div className="w-px h-5 bg-[#e3e8ee] mx-1"></div>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded text-[#64748d] hover:bg-[#f0efff] hover:text-[#533afd] transition-all disabled:opacity-30"
        title="Undo"
        type="button"
      >
        <Undo size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded text-[#64748d] hover:bg-[#f0efff] hover:text-[#533afd] transition-all disabled:opacity-30"
        title="Redo"
        type="button"
      >
        <Redo size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default function RichTextEditor({ content, onChange, editable = true }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[120px] max-h-[400px] overflow-y-auto p-3 text-[#0d253d] w-full max-w-none prose-p:text-[13px] prose-headings:text-[#0d253d] prose-p:leading-relaxed text-[13px]',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== undefined) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  return (
    <div className={`border rounded-xl bg-[var(--bg-card)] text-[var(--text)] shadow-sm transition-all ${editable ? 'border-[#d9d6fe] hover:border-[#533afd]' : 'border-transparent bg-transparent shadow-none'}`}>
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className={!editable ? 'prose prose-sm max-w-none prose-p:text-[13px] prose-p:leading-relaxed text-[#0d253d] text-[13px]' : ''} />
    </div>
  )
}
