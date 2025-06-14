'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Database } from '@/lib/supabase';
import { format, subDays, eachDayOfInterval, isToday, isPast } from 'date-fns';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  const overdueTasks = tasks.filter(task => 
    task.due_date && isPast(new Date(task.due_date)) && !task.completed
  );
  const todayTasks = tasks.filter(task => 
    task.due_date && isToday(new Date(task.due_date))
  );

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Priority distribution data
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10B981' },
  ].filter(item => item.value > 0);

  // Category distribution
  const categoryData = tasks.reduce((acc, task) => {
    const category = task.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    completed: tasks.filter(t => (t.category || 'Uncategorized') === name && t.completed).length
  }));

  // Daily completion trend (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const dailyCompletionData = last7Days.map(date => {
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return taskDate.toDateString() === date.toDateString();
    });
    
    return {
      date: format(date, 'MMM dd'),
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.completed).length
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-sm text-gray-600">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedTasks.length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pendingTasks.length}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Priority Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of tasks by priority level
          </CardDescription>
        </CardHeader>
        <CardContent>
          {priorityData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4">
                {priorityData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tasks to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Performance */}
      {categoryChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-purple-600" />
              Category Performance
            </CardTitle>
            <CardDescription>
              Task completion by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Total" />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Daily Trend
          </CardTitle>
          <CardDescription>
            Task creation over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Total Tasks"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdueTasks.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-400">
                  {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
                </span>
              </div>
              <Badge variant="destructive">{overdueTasks.length}</Badge>
            </div>
          )}
          
          {todayTasks.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  {todayTasks.length} task{todayTasks.length > 1 ? 's' : ''} due today
                </span>
              </div>
              <Badge variant="secondary">{todayTasks.length}</Badge>
            </div>
          )}
          
          {highPriorityTasks.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  {highPriorityTasks.length} high priority task{highPriorityTasks.length > 1 ? 's' : ''}
                </span>
              </div>
              <Badge variant="secondary">{highPriorityTasks.length}</Badge>
            </div>
          )}
          
          {overdueTasks.length === 0 && todayTasks.length === 0 && highPriorityTasks.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">All caught up! No urgent tasks.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}