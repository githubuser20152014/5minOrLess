import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Plus, Calendar, MoreHorizontal } from "lucide-react";
import type { MilestoneWithTasks } from "@shared/schema";
import { TaskItem } from "./task-item";
import { useState } from "react";
import { useCreateTask, useUpdateMilestone } from "@/hooks/use-projects";
import { Droppable } from "react-beautiful-dnd";
import { format } from "date-fns";

interface MilestoneColumnProps {
  milestone: MilestoneWithTasks;
}

export function MilestoneColumn({ milestone }: MilestoneColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const createTaskMutation = useCreateTask();
  const updateMilestoneMutation = useUpdateMilestone();

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

  const handleDateSelect = (date: Date | undefined) => {
    updateMilestoneMutation.mutate({
      id: milestone.id,
      dueDate: date?.toISOString().split('T')[0] || null,
    });
    setIsDatePickerOpen(false);
  };

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return "";
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "bg-red-100 text-red-700";
    if (diffDays <= 3) return "bg-yellow-100 text-yellow-700";
    if (diffDays <= 7) return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="bg-trello-light rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-trello-dark text-sm">{milestone.name}</h3>
        <div className="flex items-center space-x-2">
          {milestone.dueDate ? (
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className={`text-xs px-2 py-1 rounded hover:bg-gray-100 ${getDueDateColor(milestone.dueDate)}`}>
                  Due: {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={milestone.dueDate ? new Date(milestone.dueDate) : undefined}
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6 text-trello-muted hover:text-trello-dark"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
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
    </div>
  );
}
