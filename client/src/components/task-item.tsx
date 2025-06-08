import { Button } from "@/components/ui/button";
import { Check, Calendar, GripVertical } from "lucide-react";
import type { Task } from "@shared/schema";
import { useUpdateTask } from "@/hooks/use-projects";
import { Draggable } from "react-beautiful-dnd";

interface TaskItemProps {
  task: Task;
  index: number;
}

export function TaskItem({ task, index }: TaskItemProps) {
  const updateTaskMutation = useUpdateTask();

  const handleToggleComplete = () => {
    updateTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return "";
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600";
    if (diffDays <= 3) return "text-yellow-600";
    return "text-trello-muted";
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-trello-hover transition-shadow cursor-pointer group ${
            snapshot.isDragging ? 'shadow-trello-hover rotate-2' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleComplete}
              className={`mt-0.5 w-4 h-4 border-2 rounded hover:border-trello-blue transition-colors ${
                task.completed 
                  ? 'bg-trello-success border-trello-success' 
                  : 'border-gray-300'
              }`}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </Button>
            
            <div className="flex-1">
              <p className={`text-sm ${
                task.completed 
                  ? 'text-trello-muted line-through' 
                  : 'text-trello-dark'
              }`}>
                {task.name}
              </p>
              
              {task.dueDate && (
                <div className={`flex items-center mt-1 text-xs ${getDueDateColor(task.dueDate)}`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
            
            <div
              {...provided.dragHandleProps}
              className="opacity-0 group-hover:opacity-100 text-trello-muted hover:text-trello-dark transition-opacity"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
