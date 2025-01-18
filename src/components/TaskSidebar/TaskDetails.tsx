// src/components/TaskSidebar/TaskDetails.tsx

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FileUpload } from '@/components/ui/fileupload';
import { TaskMemberSelect } from '@/components/TaskMemberSelect';
import { formatFileSize, MAX_FILE_SIZE } from '@/lib/utils';
import type { TaskType, Stage, Priority } from '@/types/task';

interface TaskDetailsProps {
  title: string;
  description: string;
  priority: Priority;
  stage: Stage;
  responsible: string;
  attachments: string[];
  dueDate: string;
  uploading: boolean;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPriority: (priority: Priority) => void;
  setStage: (stage: Stage) => void;
  setResponsible: (responsible: string) => void;
  setDueDate: (dueDate: string) => void;
  handleFileUpload: (file: File) => Promise<void>;
  removeAttachment: (url: string) => Promise<void>;
  projectId?: string;
  task?: TaskType | null;
}

export const TaskDetails = ({
  title,
  description,
  priority,
  stage,
  responsible,
  attachments,
  dueDate,
  uploading,
  setTitle,
  setDescription,
  setPriority,
  setStage,
  setResponsible,
  setDueDate,
  handleFileUpload,
  removeAttachment,
  projectId,
  task,
}: TaskDetailsProps) => {
  const formattedDueDate = dueDate ? new Date(dueDate).toISOString().split('T')[0] : '';
  
  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          maxLength={100}
        />
      </div>

      {/* Description Textarea */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          className="min-h-[100px]"
        />
      </div>

      {/* Priority Select */}
      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                Low
              </span>
            </SelectItem>
            <SelectItem value="medium">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2" />
                Medium
              </span>
            </SelectItem>
            <SelectItem value="high">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-400 mr-2" />
                High
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stage Select */}
      <div className="space-y-2">
        <label htmlFor="stage" className="text-sm font-medium">
          Stage
        </label>
        <Select value={stage} onValueChange={(value: Stage) => setStage(value)}>
          <SelectTrigger id="stage">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date Input */}
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Due Date
        </label>
        <Input
          id="dueDate"
          type="date"
          value={formattedDueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Assignee Select */}
      <div className="space-y-2">
        <label htmlFor="assignee" className="text-sm font-medium">
          Assign To
        </label>
        <TaskMemberSelect
          projectId={projectId}
          value={responsible}
          onValueChange={setResponsible}
        />
      </div>

      {/* Attachments Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Attachments</label>
        </div>
        
        <div className="space-y-4">
          {/* Existing Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md group"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm truncate max-w-[200px] hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {decodeURIComponent(url.split('/').pop() || '')}
                  </a>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(url)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File Upload Component */}
          <FileUpload
            onFileUpload={handleFileUpload}
            uploading={uploading}
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'text/plain': ['.txt'],
            }}
          />
        </div>
      </div>
    </div>
  );
};
