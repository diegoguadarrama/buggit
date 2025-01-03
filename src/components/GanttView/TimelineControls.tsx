import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TimelineControlsProps {
  startDate: Date;
  daysToShow: number;
  onTimelineMove: (direction: 'forward' | 'backward') => void;
}

export const TimelineControls = ({ startDate, daysToShow, onTimelineMove }: TimelineControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-4 px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTimelineMove('backward')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600">
          {format(startDate, 'MMM d, yyyy')} - {format(addDays(startDate, daysToShow), 'MMM d, yyyy')}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTimelineMove('forward')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};