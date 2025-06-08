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
    let formattedDate = null;
    if (date) {
      // Format the selected date as YYYY-MM-DD in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
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
          className={`bg-white rounded-xl p-4 shadow-zen-soft hover:shadow-zen transition-zen cursor-pointer group border border-zen-stone/10 ${
            snapshot.isDragging ? 'shadow-zen-hover rotate-1' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleComplete}
              className={`mt-0.5 w-5 h-5 border-2 rounded-lg hover:border-zen-accent transition-zen ${
                task.completed 
                  ? 'bg-zen-accent border-zen-accent' 
                  : 'border-zen-stone'
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
                  className="text-sm bg-transparent border-none outline-none w-full text-zen"
                  autoFocus
                />
              ) : (
                <p 
                  className={`text-sm cursor-pointer transition-zen ${
                    task.completed 
                      ? 'text-zen-soft line-through' 
                      : 'text-zen hover:text-zen-sage'
                  }`}
                  onClick={() => setIsEditingName(true)}
                >
                  {task.name}
                </p>
              )}
              
              {task.details && (
                <p className="text-xs text-zen-soft mt-2 leading-relaxed bg-zen-stone-light/20 p-2 rounded border border-zen-stone/10">
                  {task.details}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-1">
                {task.dueDate ? (
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button className={`flex items-center text-xs hover:bg-gray-100 rounded px-1 py-0.5 ${getDueDateColor(task.dueDate)}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
                          min="2020-01-01"
                          max="2030-12-31"
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
                          className="w-full text-xs text-zen-soft hover:text-zen mt-2 transition-zen"
                        >
                          Remove due date
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-xs text-zen-soft hover:text-zen hover:bg-zen-stone-light rounded-lg px-2 py-1 transition-zen">
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
