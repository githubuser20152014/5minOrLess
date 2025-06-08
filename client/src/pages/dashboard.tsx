import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/project-card";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { DragDropContext, Droppable, type DropResult } from "react-beautiful-dnd";
import { useMoveTask, useReorderTasks } from "@/hooks/use-projects";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const moveTaskMutation = useMoveTask();
  const reorderTasksMutation = useReorderTasks();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the source and destination milestones
    const sourceMilestoneId = source.droppableId;
    const destinationMilestoneId = destination.droppableId;

    if (sourceMilestoneId === destinationMilestoneId) {
      // Reordering within the same milestone
      const project = projects?.find(p =>
        p.milestones.some(m => m.id === sourceMilestoneId)
      );
      const milestone = project?.milestones.find(m => m.id === sourceMilestoneId);
      
      if (milestone) {
        const reorderedTasks = Array.from(milestone.tasks);
        const [removed] = reorderedTasks.splice(source.index, 1);
        reorderedTasks.splice(destination.index, 0, removed);
        
        reorderTasksMutation.mutate({
          milestoneId: sourceMilestoneId,
          taskIds: reorderedTasks.map(task => task.id),
        });
      }
    } else {
      // Moving between different milestones
      moveTaskMutation.mutate({
        taskId: draggableId,
        newMilestoneId: destinationMilestoneId,
        newOrder: destination.index,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trello-bg">
        <header className="bg-white shadow-sm border-b border-trello-border">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-trello-blue rounded-lg flex items-center justify-center">
                  <ListTodo className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-semibold text-trello-dark">TaskFlow</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-trello-muted">Loading projects...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-trello-bg">
        <header className="bg-white shadow-sm border-b border-trello-border">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-trello-blue rounded-lg flex items-center justify-center">
                  <ListTodo className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-semibold text-trello-dark">TaskFlow</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="bg-trello-blue hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {projects?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              
              <div className="flex-shrink-0 w-80">
                <button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="w-full h-32 border-2 border-dashed border-trello-border rounded-xl bg-white hover:bg-trello-light hover:border-trello-blue transition-colors flex flex-col items-center justify-center space-y-2 text-trello-muted hover:text-trello-blue"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-medium">Add New Project</span>
                </button>
              </div>
            </div>

            {projects?.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-trello-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-8 h-8 text-trello-muted" />
                </div>
                <h3 className="text-lg font-medium text-trello-dark mb-2">
                  No projects yet
                </h3>
                <p className="text-trello-muted mb-6">
                  Create your first project to start organizing your tasks
                </p>
                <Button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="bg-trello-blue hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </main>

        <AddProjectDialog
          open={isAddProjectOpen}
          onOpenChange={setIsAddProjectOpen}
        />
      </div>
    </DragDropContext>
  );
}
