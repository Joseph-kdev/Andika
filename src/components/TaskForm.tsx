import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { v4 as uuid4 } from "uuid"
import { useTaskStore } from "@/stores/useTaskStore";
import { Priority, Task } from "@/types";

interface FormData {
  title: string;
  priority: Priority | '';
  dueDate: string;
  description: string;
}

export default function TaskForm({ setOpenTaskDialog }: { setOpenTaskDialog:Dispatch<SetStateAction<boolean>> }) {
   const addTask = useTaskStore((state) => state.addTask);
    const [formData, setFormData] = useState<FormData>({
      title: '',
      priority: '',
      dueDate: new Date().toISOString().split('T')[0],
      description: ''
    })

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
      field: keyof typeof formData
    ) => {
      // Handle both direct string values (from Select) and event objects
      const value = typeof e === 'string' ? e : e.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    const createNewTask = () => {
      if(formData.title === '') {
        throw new Error("Task cannot be blank");
      }
      
      const taskId = uuid4();
      const now = new Date();

      addTask({
        id: taskId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        priority: formData.priority as Priority, // Type assertion since we know it won't be empty when creating
        status: 'pending',
        createdAt: now,
        updatedAt: now
      } satisfies Task);

      setOpenTaskDialog(false);
    }      

  return (
    <div className="bg-background p-6 rounded-lg relative">
      <FieldSet>
        <FieldLegend>Task Details</FieldLegend>
        <FieldDescription>
          Provide details for your task below.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel>Task title</FieldLabel>
            <Input
              id="title"
              autoComplete="off"
              placeholder="Enter your task"
              value={formData.title}
              onChange={(e) => handleInputChange(e, 'title')}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Select 
              value={formData.priority}
              onValueChange={(value) => handleInputChange(value, 'priority')}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Due date</FieldLabel>
            <Input 
              type="date" 
              value={formData.dueDate}
              onChange={(e) => handleInputChange(e, 'dueDate')}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Description <span>(optional)</span></FieldLabel>
            <Textarea
              id="checkout-7j9-optional-comments"
              placeholder="What are you up to?"
              className="resize-none"
              value={formData.description}
              onChange={(e) => handleInputChange(e, 'description')}
            />
          </Field>
          <Field orientation="horizontal">
            <Button className="shadow-[0_4px_0_var(--foreground)] active:shadow-none active:translate-y-1" onClick={createNewTask}>
                Add
            </Button>
            <Button variant={"outline"} className="shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button variant={"outline"} className="absolute top-4 right-5 cursor-pointer shadow-[0_4px_0_var(--ring)] active:shadow-none active:translate-y-1" onClick={() => setOpenTaskDialog(false)}>
        <X width={12} height={12}/>
      </Button>
    </div>
  );
}
