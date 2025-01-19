const editor = useEditor({
    extensions,
    content: currentNote?.content || "",
    editable: true,
    autofocus: true,
  });