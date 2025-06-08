import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useCreateProject } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createProjectMutation = useCreateProject();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createProjectMutation.mutateAsync({
        name: name.trim(),
        details: details.trim() || undefined,
        dueDate: dueDate?.toISOString().split('T')[0],
      });
      
      // Reset form
      setName("");
      setDetails("");
      setDueDate(undefined);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDueDate(undefined)}
                className="text-xs text-trello-muted hover:text-trello-dark"
              >
                Clear date
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-trello-blue hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-trello-muted hover:text-trello-dark"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
