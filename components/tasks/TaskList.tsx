'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Calendar, 
  Flag,
  CheckCircle,
  Circle,
  Clock
} from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const { toggleTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTask(taskId, !completed);
      toast.success(completed ? 'Task marked as pending' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    try {
      await deleteTask(taskId);
      toast.success(`"${title}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !task.completed;
    const isDueToday = task.due_date && isToday(new Date(task.due_date));

    return (
      <Card className={`transition-all hover:shadow-md ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 pt-0.5">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${
                  task.completed 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {task.title}
                </h3>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {task.description && (
                <p className={`text-sm mt-1 ${
                  task.completed 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                
                {task.category && (
                  <Badge variant="outline">
                    {task.category}
                  </Badge>
                )}
                
                {task.due_date && (
                  <Badge 
                    variant="outline" 
                    className={`${
                      isOverdue 
                        ? 'border-red-500 text-red-600 dark:text-red-400' 
                        : isDueToday 
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : ''
                    }`}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(task.due_date), 'MMM d')}
                    {isOverdue && ' (Overdue)'}
                    {isDueToday && ' (Today)'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
              My Tasks
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              {tasks.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center">
                <Circle className="h-4 w-4 mr-2" />
                All ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed ({completedTasks.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No tasks found. Create your first task to get started!
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No pending tasks. Great job staying on top of things!
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No completed tasks yet. Keep working towards your goals!
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}