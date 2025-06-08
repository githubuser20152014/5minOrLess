import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import type { ProjectWithMilestones } from "@shared/schema";
import { MilestoneColumn } from "./milestone-column";
import { useState } from "react";
import { useCreateMilestone, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { format } from "date-fns";

interface ProjectCardProps {
  project: ProjectWithMilestones;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const createMilestoneMutation = useCreateMilestone();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const totalTasks = project.milestones.reduce((sum, milestone) => sum + milestone.tasks.length, 0);
  const completedTasks = project.milestones.reduce(
    (sum, milestone) => sum + milestone.tasks.filter(task => task.completed).length,
    0
  );
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddMilestone = async () => {
    if (newMilestoneName.trim()) {
      try {
        await createMilestoneMutation.mutateAsync({
          projectId: project.id,
          name: newMilestoneName.trim(),
          order: project.milestones.length,
        });
        setNewMilestoneName("");
        setIsAddingMilestone(false);
      } catch (error) {
        console.error("Failed to create milestone:", error);
      }
    }
  };

  const handleProjectDateSelect = (date: Date | undefined) => {
    let formattedDate = null;
    if (date) {
      // Format the selected date as YYYY-MM-DD in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
    updateProjectMutation.mutate({
      id: project.id,
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
    <Card className="flex-shrink-0 w-80 glass-zen shadow-zen transition-zen hover:shadow-zen-hover border-0">
      {/* Project Header */}
      <div className="p-6 border-b border-zen-stone">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-light text-zen tracking-wide">{project.name}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zen-soft hover:text-zen transition-zen">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This will permanently delete the project and all its milestones and tasks. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteProjectMutation.mutate(project.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Project
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {project.dueDate ? (
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <button className={`flex items-center text-sm mb-3 hover:bg-gray-100 rounded px-2 py-1 ${getDueDateColor(project.dueDate)}`}>
                <Calendar className="w-3 h-3 mr-2" />
                <span>Due: {new Date(project.dueDate + 'T00:00:00').toLocaleDateString()}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <input
                  type="date"
                  value={project.dueDate || ''}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    updateProjectMutation.mutate({
                      id: project.id,
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
                    updateProjectMutation.mutate({
                      id: project.id,
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
              <button className="flex items-center text-sm text-trello-muted hover:text-trello-dark hover:bg-gray-100 rounded px-2 py-1 mb-3">
                <Calendar className="w-3 h-3 mr-2" />
                <span>Add due date</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={undefined}
                onSelect={handleProjectDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
        
        <div className="flex items-center justify-between text-xs text-trello-muted">
          <span>{project.milestones.length} Milestones • {totalTasks} Tasks</span>
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
              <div 
                className="bg-trello-success h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span>{completedTasks}/{totalTasks}</span>
          </div>
        </div>
      </div>

      {/* Milestones Container */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        <Droppable droppableId={`milestones-${project.id}`} type="MILESTONE">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-4 ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
              }`}
            >
              {project.milestones.map((milestone, index) => (
                <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'rotate-1 scale-105' : ''} transition-transform`}
                    >
                      <MilestoneColumn milestone={milestone} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        {/* Add Milestone */}
        {isAddingMilestone ? (
          <div className="bg-trello-light rounded-lg p-3">
            <input
              type="text"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              placeholder="Enter milestone name..."
              className="w-full text-sm font-medium text-trello-dark bg-transparent border-none outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddMilestone();
                } else if (e.key === "Escape") {
                  setIsAddingMilestone(false);
                  setNewMilestoneName("");
                }
              }}
              onBlur={() => {
                if (newMilestoneName.trim()) {
                  handleAddMilestone();
                } else {
                  setIsAddingMilestone(false);
                }
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddingMilestone(true)}
            className="w-full text-left text-sm text-trello-muted hover:text-trello-dark hover:bg-trello-light rounded-lg p-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Add a milestone
          </button>
        )}
      </div>
    </Card>
  );
}
