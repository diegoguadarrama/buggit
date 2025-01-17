import { Mark, mergeAttributes } from '@tiptap/core'

export const TaskHighlight = Mark.create({
  name: 'taskHighlight',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'task-highlight',
      },
    }
  },

  addAttributes() {
    return {
      taskId: {
        default: null,
        parseHTML: element => element.getAttribute('data-task-id'),
        renderHTML: attributes => {
          if (!attributes.taskId) {
            return {}
          }

          return {
            'data-task-id': attributes.taskId,
            'role': 'button',
            'tabindex': '0',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        class: 'task-highlight',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
}) 