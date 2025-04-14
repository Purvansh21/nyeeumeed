
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ResourceUploadForm from "@/components/admin/ResourceUploadForm";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ResourceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ResourceSidebar = ({ isOpen, onClose, onSuccess }: ResourceSidebarProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="absolute right-0 h-full w-full max-w-md bg-background shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Add Resource</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <ResourceUploadForm onSuccess={() => {
              onSuccess();
              onClose();
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSidebar;
