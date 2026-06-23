export interface TextEditorRef {
	undo: () => void
}

export interface BlockNoteInternals {
	_prosemirrorView?: { dom: HTMLElement }
	editorView?: { dom: HTMLElement }
}
