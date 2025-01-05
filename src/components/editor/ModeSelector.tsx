import { Button } from "@/components/ui/button"
import { Calendar, ListTodo, PenTool, Notebook } from 'lucide-react'

interface ModeSelectorProps {
  currentMode: string
  onModeChange: (mode: string) => void
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border-r h-full">
      <Button
        variant={currentMode === 'jots' ? 'secondary' : 'ghost'}
        className="justify-start gap-2"
        onClick={() => onModeChange('jots')}
      >
        <PenTool className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>Jots</span>
          <span className="text-xs text-muted-foreground">CAPTURE & WRITE</span>
        </div>
      </Button>
      <Button
        variant={currentMode === 'notes' ? 'secondary' : 'ghost'}
        className="justify-start gap-2"
        onClick={() => onModeChange('notes')}
      >
        <Notebook className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>Notes</span>
          <span className="text-xs text-muted-foreground">ORGANIZE & REVISE</span>
        </div>
      </Button>
      <Button
        variant={currentMode === 'tasks' ? 'secondary' : 'ghost'}
        className="justify-start gap-2"
        onClick={() => onModeChange('tasks')}
      >
        <ListTodo className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>Tasks</span>
          <span className="text-xs text-muted-foreground">PLAN & PRIORITIZE</span>
        </div>
      </Button>
      <Button
        variant={currentMode === 'calendar' ? 'secondary' : 'ghost'}
        className="justify-start gap-2"
        onClick={() => onModeChange('calendar')}
      >
        <Calendar className="h-4 w-4" />
        <div className="flex flex-col items-start">
          <span>Calendar</span>
          <span className="text-xs text-muted-foreground">SCHEDULE & COMPLETE</span>
        </div>
      </Button>
    </div>
  )
}