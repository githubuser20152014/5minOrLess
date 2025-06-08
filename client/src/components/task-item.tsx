import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, Calendar, GripVertical, Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import type { Task } from "@shared/schema";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-projects";
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
  const deleteTaskMutation = useDeleteTask();

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
    console.log('Date clicked:', date?.toISOString(), 'Local date:', date?.toDateString());
    let formattedDate = null;
    if (date) {
      // Format the selected date as YYYY-MM-DD in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
      console.log('Formatted:', formattedDate);
    }
    updateTaskMutation.mutate({
      id: task.id,
      dueDate: formattedDate,
    });
    setIsDatePickerOpen(false);
  };

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return "";
    
    // Get current EST time
    const nowEST = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
    const due = new Date(dueDate + "T00:00:00");
    const diffDays = Math.ceil((due.getTime() - nowEST.getTime()) / (1000 * 60 * 60 * 24));
    
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
                      <div className="p-3">
                        <input
                          type="date"
                          value={task.dueDate || ''}
                          onChange={(e) => {
                            const value = e.target.value || null;
                            console.log('Date input changed to:', value);
                            updateTaskMutation.mutate({
                              id: task.id,
                              dueDate: value,
                            });
                            setIsDatePickerOpen(false);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateTaskMutation.mutate({
                              id: task.id,
                              dueDate: null,
                            });
                            setIsDatePickerOpen(false);
                          }}
                          className="w-full text-xs text-trello-muted hover:text-trello-dark mt-2"
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
            
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-6 h-6 text-trello-muted hover:text-trello-dark">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{task.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete Task
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
              <div
                {...provided.dragHandleProps}
                className="text-trello-muted hover:text-trello-dark"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
