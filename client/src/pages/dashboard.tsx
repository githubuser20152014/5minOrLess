import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/project-card";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";
import { useMoveTask, useReorderTasks, useReorderProjects } from "@/hooks/use-projects";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const moveTaskMutation = useMoveTask();
  const reorderTasksMutation = useReorderTasks();
  const reorderProjectsMutation = useReorderProjects();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle project reordering
    if (type === "PROJECT") {
      if (!projects) return;
      
      const reorderedProjects = Array.from(projects);
      const [removed] = reorderedProjects.splice(source.index, 1);
      reorderedProjects.splice(destination.index, 0, removed);
      
      reorderProjectsMutation.mutate(reorderedProjects.map(project => project.id));
      return;
    }

    // Handle task reordering within milestones
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
      <div className="min-h-screen">
        <header className="glass-zen shadow-zen-soft border-b border-zen-stone">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zen-accent-soft rounded-xl flex items-center justify-center transition-zen">
                  <ListTodo className="text-zen w-5 h-5" />
                </div>
                <h1 className="text-2xl font-light text-zen tracking-wide">5 mins or less</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-zen-soft">Loading your peaceful workspace...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen">
        <header className="glass-zen shadow-zen-soft border-b border-zen-stone">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zen-accent-soft rounded-xl flex items-center justify-center transition-zen hover:bg-zen-accent">
                  <ListTodo className="text-zen w-5 h-5" />
                </div>
                <h1 className="text-2xl font-light text-zen tracking-wide">5 mins or less</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="bg-zen-accent-soft hover:bg-zen-accent text-zen shadow-zen transition-zen border-0 px-6 py-2"
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
            <Droppable droppableId="project-board" direction="horizontal" type="PROJECT">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex space-x-6 overflow-x-auto pb-6 ${
                    snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                  }`}
                >
                  {projects?.map((project, index) => (
                    <Draggable key={project.id} draggableId={project.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'rotate-3 scale-105' : ''} transition-transform`}
                        >
                          <div {...provided.dragHandleProps}>
                            <ProjectCard project={project} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
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
              )}
            </Droppable>

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
