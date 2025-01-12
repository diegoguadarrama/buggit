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
        parseHTML: element => {
          const taskId = element.getAttribute('data-task-id');
          return taskId;
        },
        renderHTML: attributes => {
          if (!attributes.taskId) {
            return {};
          }

          return {
            'data-task-id': attributes.taskId,
            'role': 'button',
            'tabindex': '0',
          };
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-task-id]',
        getAttrs: element => {
          if (!(element instanceof HTMLElement)) return false;
          return element.hasAttribute('data-task-id') ? {} : false;
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
}) 