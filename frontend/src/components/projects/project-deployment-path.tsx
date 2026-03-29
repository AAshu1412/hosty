// import { useEffect, useMemo, useState } from "react";
// import type { FormEvent } from "react";
// import {
//   FolderTree,
//   GitBranch,
//   GitFork,
//   LoaderCircle,
//   Rocket,
//   X,
// } from "lucide-react";

// import { Panel } from "@/components/shared/panel";
// import { Button } from "@/components/ui/button";
// import { useGithubStore } from "@/store/githubStore";
// import { useJenkinsStore } from "@/store/jenkinsStore";
// import type { GitHubRepo, GitHubRepoBranch } from "@/utils/userType";

// interface ProjectDeploymentPathProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//   }

//   export function ProjectDeploymentPath({
//   open,
//   onOpenChange,
// }: ProjectDeploymentPathProps) {

//     const getUserGithubReposContentPath = useGithubStore((state) => state.getUserGithubReposContentPath);

//     const [isSubmitting, setIsSubmitting] = useState(false);

    
//     useEffect(() => {
//         if (!open) {
//           return;
//         }
    
//         const handleEscape = (event: KeyboardEvent) => {
//           if (event.key === "Escape" && !isSubmitting) {
//             onOpenChange(false);
//           }
//         };
    
//         const previousOverflow = document.body.style.overflow;
//         document.body.style.overflow = "hidden";
//         window.addEventListener("keydown", handleEscape);
    
//         return () => {
//           document.body.style.overflow = previousOverflow;
//           window.removeEventListener("keydown", handleEscape);
//         };
//       }, [isSubmitting, onOpenChange, open]);


//       if (!open) {
//         return null;
//       }
    
//       const closeDialog = () => {
//         if (isSubmitting) {
//           return;
//         }
    
//         onOpenChange(false);
//       };
    
    

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
//       <button
//         aria-label="Close deployment dialog"
//         className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//         type="button"
//       />
//     </div>
//   );
// }