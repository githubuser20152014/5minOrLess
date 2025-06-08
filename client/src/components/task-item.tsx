import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Check, Calendar, GripVertical, Edit2 } from "lucide-react";
import type { Task } from "@shared/schema";
import { useUpdateTask } from "@/hooks/use-projects";
import { Draggable } from "react-beautiful-dnd";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  index: number;
}

export function TaskItem({ task, index }: TaskItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const updateTaskMutation = useUpdateTask();

  const handleToggleComplete = () => {
    updateTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  const handleNameEdit = () => {
    if (editedName.trim() && editedName !== task.name) {
      updateTaskMutation.mutate({
        id: task.id,
        name: editedName.trim(),
      });
    }
    setEditedName(task.name);
    setIsEditingName(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    updateTaskMutation.mutate({
      id: task.id,
      dueDate: date?.toISOString().split('T')[0] || null,
    });
    setIsDatePickerOpen(false);
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
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleNameEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNameEdit();
                    } else if (e.key === "Escape") {
                      setEditedName(task.name);
                      setIsEditingName(false);
                    }
                  }}
                  className="text-sm bg-transparent border-none outline-none w-full text-trello-dark"
                  autoFocus
                />
              ) : (
                <p 
                  className={`text-sm cursor-pointer ${
                    task.completed 
                      ? 'text-trello-muted line-through' 
                      : 'text-trello-dark hover:text-trello-blue'
                  }`}
                  onClick={() => setIsEditingName(true)}
                >
                  {task.name}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-1">
                {task.dueDate ? (
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button className={`flex items-center text-xs hover:bg-gray-100 rounded px-1 py-0.5 ${getDueDateColor(task.dueDate)}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDateSelect(undefined)}
                          className="w-full text-xs text-trello-muted hover:text-trello-dark"
                        >
                          Remove due date
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-xs text-trello-muted hover:text-trello-dark hover:bg-gray-100 rounded px-1 py-0.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Add due date</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
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
