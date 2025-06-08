import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Calendar, MoreHorizontal, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { MilestoneWithTasks } from "@shared/schema";
import { TaskItem } from "./task-item";
import { useState } from "react";
import { useCreateTask, useUpdateMilestone, useDeleteMilestone } from "@/hooks/use-projects";
import { Droppable } from "react-beautiful-dnd";
import { format } from "date-fns";

interface MilestoneColumnProps {
  milestone: MilestoneWithTasks;
}

export function MilestoneColumn({ milestone }: MilestoneColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default
  const [isEditingMilestoneName, setIsEditingMilestoneName] = useState(false);
  const [editedMilestoneName, setEditedMilestoneName] = useState(milestone.name);
  const createTaskMutation = useCreateTask();
  const updateMilestoneMutation = useUpdateMilestone();
  const deleteMilestoneMutation = useDeleteMilestone();

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      try {
        await createTaskMutation.mutateAsync({
          milestoneId: milestone.id,
          name: newTaskName.trim(),
          order: milestone.tasks.length,
        });
        setNewTaskName("");
        setIsAddingTask(false);
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    }
  };

  const handleMilestoneNameEdit = () => {
    if (editedMilestoneName.trim() && editedMilestoneName !== milestone.name) {
      updateMilestoneMutation.mutate({
        id: milestone.id,
        name: editedMilestoneName.trim(),
      });
    }
    setEditedMilestoneName(milestone.name);
    setIsEditingMilestoneName(false);
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
    updateMilestoneMutation.mutate({
      id: milestone.id,
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
    
    if (diffDays < 0) return "bg-red-100 text-red-700";
    if (diffDays <= 3) return "bg-yellow-100 text-yellow-700";
    if (diffDays <= 7) return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="bg-zen-lavender-light rounded-xl p-4 shadow-zen-soft transition-zen hover:shadow-zen border border-zen-stone/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-1 hover:bg-zen-stone-light rounded-lg px-2 py-1 transition-zen"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-zen-soft" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zen-soft" />
            )}
          </button>
          {isEditingMilestoneName ? (
            <input
              type="text"
              value={editedMilestoneName}
              onChange={(e) => setEditedMilestoneName(e.target.value)}
              onBlur={handleMilestoneNameEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMilestoneNameEdit();
                } else if (e.key === "Escape") {
                  setEditedMilestoneName(milestone.name);
                  setIsEditingMilestoneName(false);
                }
              }}
              className="font-medium text-zen text-base tracking-wide bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium text-zen text-base tracking-wide cursor-pointer hover:text-zen-sage transition-zen"
              onClick={() => setIsEditingMilestoneName(true)}
            >
              {milestone.name}
            </h3>
          )}
          {milestone.tasks.length > 0 && (
            <span className="text-xs bg-zen-accent-soft text-zen px-3 py-1 rounded-full font-medium">
              {milestone.tasks.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {milestone.dueDate ? (
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className={`text-xs px-2 py-1 rounded hover:bg-gray-100 ${getDueDateColor(milestone.dueDate)}`}>
                  Due: {new Date(milestone.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <input
                    type="date"
                    value={milestone.dueDate || ''}
                    onChange={(e) => {
                      const value = e.target.value || null;
                      updateMilestoneMutation.mutate({
                        id: milestone.id,
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
                      updateMilestoneMutation.mutate({
                        id: milestone.id,
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
                <button className="text-xs text-trello-muted hover:text-trello-dark hover:bg-gray-100 rounded px-2 py-1">
                  <Calendar className="w-3 h-3 mr-1 inline" />
                  Add due date
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
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 text-zen-soft hover:text-zen hover:bg-zen-stone-light transition-zen"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-zen-soft hover:text-zen hover:bg-zen-stone-light transition-zen">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Milestone
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{milestone.name}"? This will permanently delete the milestone and all its tasks. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMilestoneMutation.mutate(milestone.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Milestone
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <Droppable droppableId={milestone.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-md p-1' : ''}`}
              >
                {milestone.tasks.map((task, index) => (
                  <TaskItem key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Task */}
          {isAddingTask ? (
            <div className="bg-white rounded-lg p-3 mt-2 shadow-sm">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter task name..."
                className="w-full text-sm text-trello-dark bg-transparent border-none outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTask();
                  } else if (e.key === "Escape") {
                    setIsAddingTask(false);
                    setNewTaskName("");
                  }
                }}
                onBlur={() => {
                  if (newTaskName.trim()) {
                    handleAddTask();
                  } else {
                    setIsAddingTask(false);
                  }
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full text-left text-sm text-trello-muted hover:text-trello-dark hover:bg-white rounded-lg p-2 transition-colors mt-2"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add a task
            </button>
          )}
        </>
      )}
    </div>
  );
}
