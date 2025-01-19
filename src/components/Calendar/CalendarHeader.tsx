import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;

  return (
    <div className="flex items-center justify-center w-full">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
      </div>
    </div>
  );
};
