import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'processing':
        return '🔄';
      case 'shipped':
        return '📦';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '🔔';
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              {notifications.length > 0 && (
                <CardDescription className="text-xs">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </CardDescription>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs" 
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              </div>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0 max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  When there are updates to your orders, they will appear here
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors",
                      !notification.read && "bg-blue-50/30"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-1 w-8 h-8 bg-primary/10 flex items-center justify-center rounded-full text-primary">
                      {getStatusIcon(notification.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <span className="sr-only">Delete</span>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {notifications.length > 0 && (
            <>
              <Separator />
              <CardFooter className="py-2 px-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={clearAllNotifications}
                >
                  Clear all
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}