import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Bell, BellDot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: 'new_task' | 'task_assigned' | 'new_note' | 'member_joined';
  content: {
    task_id?: string;
    task_title?: string;
    note_id?: string;
    note_title?: string;
    project_id: string;
    member_id?: string;
  };
  read: boolean;
  created_at: string;
  sender_id: string;
}

export function NotificationTray() {
  const [hasUnread, setHasUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      // Transform the data to match our Notification interface
      return (data as any[]).map(notification => ({
        ...notification,
        content: notification.content as Notification['content']
      })) as Notification[];
    },
  });

  // Subscribe to new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('New notification:', payload);
          refetch();
          toast({
            title: "New notification",
            description: "You have a new notification",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  // Check for unread notifications
  useEffect(() => {
    setHasUnread(notifications.some(n => !n.read));
  }, [notifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'new_task':
      case 'task_assigned':
        navigate(`/dashboard?project=${notification.content.project_id}&task=${notification.content.task_id}`);
        break;
      case 'new_note':
        navigate(`/notes?project=${notification.content.project_id}&note=${notification.content.note_id}`);
        break;
      case 'member_joined':
        navigate(`/dashboard?project=${notification.content.project_id}`);
        break;
    }

    setOpen(false);
    refetch();
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'new_task':
        return `New task created: ${notification.content.task_title}`;
      case 'task_assigned':
        return `Task assigned to you: ${notification.content.task_title}`;
      case 'new_note':
        return `New note shared: ${notification.content.note_title}`;
      case 'member_joined':
        return 'New member joined the project';
      default:
        return 'New notification';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative">
          {hasUnread ? (
            <BellDot className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center space-y-2">
              <div className="font-medium">You're all caught up! 🎉</div>
              <div className="text-sm text-muted-foreground">
                No new notifications right now. Take a breather or check your tasks to stay ahead!
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 space-y-1 cursor-pointer ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="text-sm font-medium">
                  {getNotificationText(notification)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}