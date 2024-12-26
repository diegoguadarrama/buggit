import { Toaster } from "@/components/ui/toaster";
import { ProfileSidebar as NewProfileSidebar } from "./ProfileSidebar/index";

// This is a temporary wrapper to maintain backward compatibility
// while we migrate to the new refactored version
export const ProfileSidebar = NewProfileSidebar;