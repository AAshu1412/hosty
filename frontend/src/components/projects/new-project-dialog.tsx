import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FolderTree,
  GitBranch,
  GitFork,
  LoaderCircle,
  Rocket,
  X,
} from "lucide-react";

import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { useGithubStore } from "@/store/githubStore";
import { useJenkinsStore } from "@/store/jenkinsStore";
import type { GitHubRepo, GitHubRepoBranch, GitHubRepoContent } from "@/utils/userType";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeploymentSuccessState {
  buildNumber: number;
  branch: string;
  repoFullName: string;
  subDirectory: string | null;
}

const fieldClassName =
  "w-full rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/30";

export function NewProjectDialog({
  open,
  onOpenChange,
}: NewProjectDialogProps) {
  const getUserGithubRepos = useGithubStore((state) => state.getUserGithubRepos);
  const getUserGithubReposBranch = useGithubStore(
    (state) => state.getUserGithubReposBranch
  );
  const getUserGithubReposContent = useGithubStore(
    (state) => state.getUserGithubReposContent
  );
  const getUserGithubReposContentPath = useGithubStore(
    (state) => state.getUserGithubReposContentPath
  );
  const jenkinsStartBuild = useJenkinsStore((state) => state.jenkins_start_build);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubRepoBranch[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [subDirectory, setSubDirectory] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [directories, setDirectories] = useState<GitHubRepoContent[]>([]);
  const [isLoadingDirs, setIsLoadingDirs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<DeploymentSuccessState | null>(null);

  const selectedRepo = useMemo(
    () =>
      (Array.isArray(repos) ? repos : []).find(
        (repo) => String(repo.id) === selectedRepoId
      ) ?? null,
    [repos, selectedRepoId]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onOpenChange(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isSubmitting, onOpenChange, open]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(null);
      setIsSubmitting(false);
      return;
    }

    if (repos.length > 0) {
      return;
    }

    let isActive = true;

    const loadRepos = async () => {
      setIsLoadingRepos(true);
      setError(null);

      try {
        const response = await getUserGithubRepos();

        if (!isActive) {
          return;
        }

        const nextRepos = Array.isArray(response.data) ? response.data : [];
        setRepos(nextRepos);

        if (nextRepos.length > 0) {
          setSelectedRepoId(String(nextRepos[0].id));
        }
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your GitHub repositories."
        );
      } finally {
        if (isActive) {
          setIsLoadingRepos(false);
        }
      }
    };

    void loadRepos();

    return () => {
      isActive = false;
    };
  }, [getUserGithubRepos, open, repos.length]);

  useEffect(() => {
    if (!open || !selectedRepo) {
      return;
    }

    let isActive = true;

    const loadBranches = async () => {
      setIsLoadingBranches(true);
      setError(null);
      setBranches([]);
      setSelectedBranch(selectedRepo.default_branch);

      try {
        const response = await getUserGithubReposBranch(selectedRepo.name);

        if (!isActive) {
          return;
        }

        const nextBranches = Array.isArray(response.data) ? response.data : [];
        setBranches(nextBranches);

        const hasDefaultBranch = nextBranches.some(
          (branch) => branch.name === selectedRepo.default_branch
        );

        setSelectedBranch(
          hasDefaultBranch
            ? selectedRepo.default_branch
            : nextBranches[0]?.name ?? selectedRepo.default_branch
        );
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load branches for the selected repository."
        );
      } finally {
        if (isActive) {
          setIsLoadingBranches(false);
        }
      }
    };

    void loadBranches();

    return () => {
      isActive = false;
    };
  }, [getUserGithubReposBranch, open, selectedRepo]);

  useEffect(() => {
    if (!open || !selectedRepo) {
      return;
    }

    let isActive = true;

    const loadDirectories = async () => {
      setIsLoadingDirs(true);
      setDirectories([]);
      
      try {
        let response;
        if (!subDirectory || subDirectory.trim() === "") {
          response = await getUserGithubReposContent(selectedRepo.name);
        } else {
          response = await getUserGithubReposContentPath(selectedRepo.name, subDirectory.trim());
        }

        if (!isActive) return;

        const contents = response.data?.repo_content ?? [];
        const dirs = contents.filter((item) => item.type === "dir" || item.type === "symlink");
        setDirectories(dirs);
      } catch (loadError) {
        if (!isActive) return;
        console.error("Failed to load directories", loadError);
      } finally {
        if (isActive) {
          setIsLoadingDirs(false);
        }
      }
    };

    void loadDirectories();

    return () => {
      isActive = false;
    };
  }, [open, selectedRepo, subDirectory, getUserGithubReposContent, getUserGithubReposContentPath]);

  if (!open) {
    return null;
  }

  const closeDialog = () => {
    if (isSubmitting) {
      return;
    }

    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRepo) {
      setError("Select a repository before starting a deployment.");
      return;
    }

    if (!selectedBranch) {
      setError("Select a branch before starting a deployment.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const normalizedSubDirectory = subDirectory.trim();
      const response = await jenkinsStartBuild(
        selectedRepo.clone_url,
        selectedBranch,
        normalizedSubDirectory || undefined
      );

      setSuccess({
        buildNumber: response.data?.build_number ?? 0,
        branch: selectedBranch,
        repoFullName: selectedRepo.full_name,
        subDirectory: normalizedSubDirectory || null,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to start the deployment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        aria-label="Close deployment dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeDialog}
        type="button"
      />

      <Panel className="relative z-10 w-full max-w-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/10 px-6 py-5">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Deploy Project
            </p>
            <div>
              <h3 className="text-2xl font-bold tracking-[-0.04em] text-on-surface">
                New project
              </h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Pick a GitHub repo, choose the branch, and keep the deployment
                path visible if the build should run from a nested folder.
              </p>
            </div>
          </div>

          <Button
            aria-label="Close deployment dialog"
            onClick={closeDialog}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 rounded-[24px] border border-outline-variant/10 bg-surface-container-low px-4 py-4 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                <GitFork className="h-3.5 w-3.5" />
                Repo Source
              </div>
              <p className="text-sm text-on-surface">
                Existing GitHub server flow
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                <GitBranch className="h-3.5 w-3.5" />
                Branch
              </div>
              <p className="text-sm text-on-surface">
                Sent directly to Jenkins build params
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                <FolderTree className="h-3.5 w-3.5" />
                Deploy Path
              </div>
              <p className="text-sm text-on-surface">
                Maps to the server’s `subDirectory`
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                Repository
              </span>
              <select
                className={fieldClassName}
                disabled={isLoadingRepos || isSubmitting || repos.length === 0}
                onChange={(event) => {
                  setSelectedRepoId(event.target.value);
                  setSuccess(null);
                }}
                value={selectedRepoId}
              >
                {isLoadingRepos ? (
                  <option value="">Loading repositories...</option>
                ) : repos.length === 0 ? (
                  <option value="">No repositories available</option>
                ) : null}
                {(Array.isArray(repos) ? repos : []).map((repo) => (
                  <option key={repo.id} value={String(repo.id)}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant">
                The popup uses your existing GitHub server routes to list repos.
              </p>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  Branch
                </span>
                <select
                  className={fieldClassName}
                  disabled={
                    !selectedRepo || isLoadingBranches || isSubmitting
                  }
                  onChange={(event) => setSelectedBranch(event.target.value)}
                  value={selectedBranch}
                >
                  {isLoadingBranches ? (
                    <option value="">Loading branches...</option>
                  ) : (Array.isArray(branches) ? branches : []).length === 0 ? (
                    <option value={selectedBranch || ""}>
                      {selectedBranch || "No branches available"}
                    </option>
                  ) : (
                    (Array.isArray(branches) ? branches : []).map((branch) => (
                      <option key={branch.name} value={branch.name}>
                        {branch.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                  Deployment Path
                </span>
                <select
                  className={fieldClassName}
                  disabled={isSubmitting || !selectedRepo}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "--SELECT-CURRENT--") return;
                    if (value === "--GO-BACK--") {
                      const pathParts = subDirectory.split("/").filter(Boolean);
                      pathParts.pop();
                      setSubDirectory(pathParts.join("/"));
                      return;
                    }
                    setSubDirectory(value);
                  }}
                  value="--SELECT-CURRENT--"
                >
                  <option value="--SELECT-CURRENT--">
                    📂 {subDirectory ? `/${subDirectory}` : "/ (Root)"} {isLoadingDirs ? "(Loading...)" : ""}
                  </option>
                  
                  {subDirectory ? (
                    <option value="--GO-BACK--">👈 Go up a level</option>
                  ) : null}
                  
                  {directories.length > 0 && (
                    <option value="--SELECT-CURRENT--" disabled>
                      --- Select a folder to enter ---
                    </option>
                  )}
                  
                  {directories.map((dir) => (
                    <option key={dir.path} value={dir.path}>
                      📁 {dir.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-on-surface-variant">
                  Optional. Select a nested folder inside your repo where your source code is structured.
                </p>
              </label>
            </div>

            {selectedRepo ? (
              <div className="rounded-[24px] border border-outline-variant/10 bg-surface-container-low px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Deployment Summary
                </p>
                <div className="mt-3 space-y-2 text-sm text-on-surface">
                  <p>{selectedRepo.full_name}</p>
                  <p className="text-on-surface-variant">
                    Branch: <span className="text-on-surface">{selectedBranch || "Select a branch"}</span>
                  </p>
                  <p className="text-on-surface-variant">
                    Path: <span className="text-on-surface">{subDirectory.trim() || "/"}</span>
                  </p>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[20px] border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-[24px] border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-on-surface">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  Deployment queued
                </p>
                <p className="mt-2 font-semibold">
                  {success.repoFullName} is now deploying on build #{success.buildNumber}.
                </p>
                <p className="mt-1 text-on-surface-variant">
                  Branch: {success.branch}
                </p>
                <p className="mt-1 text-on-surface-variant">
                  Path: {success.subDirectory || "/"}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={closeDialog}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                disabled={
                  isSubmitting ||
                  isLoadingRepos ||
                  isLoadingBranches ||
                  !selectedRepo ||
                  !selectedBranch
                }
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Starting deployment
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Deploy project
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Panel>
    </div>
  );
}
