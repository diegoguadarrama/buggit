import React, { useState } from "react";
import { TaskType } from "@/types/task";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isToday, 
  parseISO,
  addWeeks,
  subWeeks 
} from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CalendarIcon, ChevronLeft, ChevronRight, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface WeekViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  projectId?: string;
}

export const WeekView = ({ tasks, onTaskClick, projectId }: WeekViewProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : undefined;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch project members
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data: membersData, error } = await supabase
        .from('profiles_projects')
        .select(`
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project members:', error);
        throw error;
      }

      return (membersData
        ?.filter((member) => member.profile)
        .map((member) => ({
          id: member.profile.id,
          email: member.profile.email,
          full_name: member.profile.full_name,
          avatar_url: member.profile.avatar_url,
        })) || []) as Member[];
    },
    enabled: !!projectId,
  });

  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start, end });

  const previousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = parseISO(task.due_date);
      return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  // Get member details by ID
  const getMemberDetails = (assigneeId: string): Member | undefined => {
    return members.find(member => member.id === assigneeId);
  };

  // Avatar fallback based on member details
  const getAvatarContent = (member: Member | undefined) => {
    if (!member) {
      return {
        fallback: <Bug className="h-4 w-4" />,
        display: 'Unassigned'
      };
    }

    if (member.full_name) {
      const initials = member.full_name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase();
      return {
        fallback: initials,
        display: member.full_name
      };
    }

    return {
      fallback: <Bug className="h-4 w-4" />,
      display: member.email
    };
  };

  return (
    <div className="flex flex-col">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            {t('common.today')}
          </Button>
        </div>
        <div className="text-sm font-medium">
          {format(start, 'MMMM d')} - {format(end, 'MMMM d, yyyy')}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 p-4">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            if (dayTasks.length === 0) return null;

            return (
              <div key={day.toISOString()} className="space-y-2">
                {/* Day Header */}
                <div className={`
                  flex items-center gap-2 p-2 sticky top-0 bg-background z-10
                  ${isToday(day) ? 'text-primary font-medium' : 'text-muted-foreground'}
                `}>
                  <CalendarIcon className="h-5 w-5" />
                  <span className="text-lg">
                    {format(day, 'EEEE, MMMM d', { locale })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({dayTasks.length} {dayTasks.length === 1 ? t('task.single') : t('task.plural')})
                  </span>
                </div>

                {/* Tasks for the day */}
                <div className="space-y-2 pl-7">
                  {dayTasks.map((task) => {
                    const member = getMemberDetails(task.assignee);
                    const { fallback, display } = getAvatarContent(member);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`
                          p-3 rounded-lg cursor-pointer
                          ${task.stage === 'Done' 
                            ? 'bg-green-50 border-green-100'
                            : 'bg-card hover:bg-accent'
                          }
                          border transition-colors
                        `}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {task.stage === 'Done' && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                              <span className={`font-medium ${task.stage === 'Done' ? 'line-through text-green-700' : ''}`}>
                                {task.title}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className={`
                                px-2 py-0.5 rounded-full text-xs
                                ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                                ${task.priority === 'medium' ? 'bg-orange-100 text-orange-700' : ''}
                                ${task.priority === 'low' ? 'bg-gray-100 text-gray-700' : ''}
                              `}>
                                {t(`task.priority.${task.priority}`)}
                              </span>
                              <span>•</span>
                              <span>{t(`task.stage.${task.stage.toLowerCase()}`)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member?.avatar_url || undefined} />
                              <AvatarFallback className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black">
                                {fallback}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {display}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
