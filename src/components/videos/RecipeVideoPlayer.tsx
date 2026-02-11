/**
 * Recipe Video Player Component
 *
 * Features:
 * - Display recipe videos (YouTube, Vimeo, custom)
 * - Add new videos to recipes
 * - Delete videos
 * - Video thumbnail previews
 * - Responsive video embeds
 * - Video metadata display
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Play,
  Plus,
  Trash2,
  Youtube,
  Video,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import {
  useRecipeVideos,
  useAddRecipeVideo,
  useRemoveRecipeVideo,
} from "../../hooks/useRecipeVideos";
import { RecipeVideo } from "../../types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ConfirmationDialog from "../common/ConfirmationDialog";
import EmptyState from "../common/EmptyState";
import { Skeleton } from "../ui/skeleton";

interface RecipeVideoPlayerProps {
  recipeId: number;
  className?: string;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoId(url: string): string | null {
  const patterns = [/vimeo\.com\/(\d+)/, /vimeo\.com\/video\/(\d+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Get YouTube embed URL
 */
function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get Vimeo embed URL
 */
function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

/**
 * Get YouTube thumbnail URL (hqdefault is more reliable than maxresdefault which often 404s)
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Recipe Video Player Component (Memoized for performance)
 *
 * Displays and manages recipe videos
 */
const RecipeVideoPlayer = memo(
  ({ recipeId, className = "" }: RecipeVideoPlayerProps) => {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<RecipeVideo | null>(
      null,
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<RecipeVideo | null>(
      null,
    );
    const [thumbnailFailedIds, setThumbnailFailedIds] = useState<Set<string>>(
      () => new Set(),
    );

    // Form state
    const [videoUrl, setVideoUrl] = useState("");
    const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "custom">(
      "youtube",
    );
    const [videoTitle, setVideoTitle] = useState("");
    const [videoDescription, setVideoDescription] = useState("");

    const { data: videos = [], isLoading } = useRecipeVideos(recipeId, true);
    const addVideo = useAddRecipeVideo();
    const removeVideo = useRemoveRecipeVideo();

    // Handle add video
    const handleAddVideo = useCallback(() => {
      if (!videoUrl.trim()) {
        toast.error("Please enter a video URL");
        return;
      }

      // Auto-detect video type if not specified
      let detectedType: "youtube" | "vimeo" | "custom" = videoType;
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        detectedType = "youtube";
      } else if (videoUrl.includes("vimeo.com")) {
        detectedType = "vimeo";
      }

      // Extract video ID for thumbnail
      let thumbnailUrl: string | undefined;
      if (detectedType === "youtube") {
        const youtubeId = extractYouTubeId(videoUrl);
        if (youtubeId) {
          thumbnailUrl = getYouTubeThumbnail(youtubeId);
        }
      }

      addVideo.mutate(
        {
          recipeId,
          videoUrl: videoUrl.trim(),
          videoType: detectedType,
          title: videoTitle.trim() || undefined,
          description: videoDescription.trim() || undefined,
          thumbnailUrl,
        },
        {
          onSuccess: () => {
            setAddDialogOpen(false);
            setVideoUrl("");
            setVideoTitle("");
            setVideoDescription("");
            setVideoType("youtube");
          },
        },
      );
    }, [videoUrl, videoType, videoTitle, videoDescription, recipeId, addVideo]);

    // Handle delete video
    const handleDeleteVideo = useCallback((video: RecipeVideo) => {
      setVideoToDelete(video);
      setDeleteDialogOpen(true);
    }, []);

    // Confirm delete
    const confirmDelete = useCallback(() => {
      if (videoToDelete) {
        const deletedId = videoToDelete.id;
        removeVideo.mutate(
          { videoId: videoToDelete.id, recipeId },
          {
            onSuccess: () => {
              setDeleteDialogOpen(false);
              setVideoToDelete(null);
              if (selectedVideo?.id === deletedId) {
                setSelectedVideo(null);
              }
            },
          },
        );
      }
    }, [videoToDelete, selectedVideo?.id, recipeId, removeVideo]);

    // Get embed URL for video
    const getEmbedUrl = useCallback((video: RecipeVideo): string | null => {
      if (video.videoType === "youtube") {
        const videoId = extractYouTubeId(video.videoUrl);
        return videoId ? getYouTubeEmbedUrl(videoId) : null;
      }
      if (video.videoType === "vimeo") {
        const videoId = extractVimeoId(video.videoUrl);
        return videoId ? getVimeoEmbedUrl(videoId) : null;
      }
      return video.videoUrl; // Custom video URL
    }, []);

    // Get thumbnail URL
    const getThumbnailUrl = useCallback((video: RecipeVideo): string | null => {
      if (video.thumbnailUrl) return video.thumbnailUrl;
      if (video.videoType === "youtube") {
        const videoId = extractYouTubeId(video.videoUrl);
        return videoId ? getYouTubeThumbnail(videoId) : null;
      }
      return null;
    }, []);

    // Show YouTube/embed directly when videos load (no overlay click required)
    useEffect(() => {
      if (videos.length > 0 && selectedVideo === null) {
        const firstWithEmbed = videos.find((v) => getEmbedUrl(v));
        setSelectedVideo(firstWithEmbed ?? videos[0]);
      }
    }, [videos, selectedVideo, getEmbedUrl]);

    return (
      <Card
        className={`group rounded-[28px] border border-purple-400/30 bg-gradient-to-br from-purple-500/25 via-purple-500/10 to-purple-500/5 p-4 sm:p-6 shadow-[0_30px_80px_rgba(168,85,247,0.35)] transition hover:border-purple-300/50 backdrop-blur-sm min-w-0 overflow-hidden ${className}`}
      >
        <CardContent className="p-0 bg-transparent">
          <div className="space-y-4 min-w-0">
            {/* Header: icon+title inline; Add Video stacks on phone */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-tight break-words">
                    Recipe Videos
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5 break-words">
                    Add video tutorials or cooking demonstrations for this
                    recipe.
                  </p>
                </div>
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className="glow-button w-fit self-start sm:self-center"
                    aria-label="Add video to recipe"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Recipe Video</DialogTitle>
                    <DialogDescription>
                      Add a video tutorial or cooking demonstration for this
                      recipe. Supports YouTube, Vimeo, or custom video URLs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video Type</label>
                      <Select
                        value={videoType}
                        onValueChange={(value) =>
                          setVideoType(value as "youtube" | "vimeo" | "custom")
                        }
                      >
                        <SelectTrigger className="bg-slate-900/30 border-slate-400/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">
                            <div className="flex items-center gap-2">
                              <Youtube className="h-4 w-4 text-red-500" />
                              YouTube
                            </div>
                          </SelectItem>
                          <SelectItem value="vimeo">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-blue-500" />
                              Vimeo
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Custom URL
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video URL *</label>
                      <Input
                        type="url"
                        placeholder={
                          videoType === "youtube"
                            ? "https://www.youtube.com/watch?v=..."
                            : videoType === "vimeo"
                              ? "https://vimeo.com/..."
                              : "https://example.com/video.mp4"
                        }
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Title (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Step-by-step cooking tutorial"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="Brief description of the video"
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        className="bg-slate-900/30 border-slate-400/30 text-white"
                        maxLength={500}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleAddVideo}
                        disabled={!videoUrl.trim() || addVideo.isPending}
                        className="flex-1 bg-gradient-to-r from-purple-500/70 via-purple-500/50 to-purple-500/30 hover:from-purple-500/80 hover:via-purple-500/60 hover:to-purple-500/40"
                      >
                        {addVideo.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Add Video
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setAddDialogOpen(false)}
                        className="border-slate-400/30"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Content from start */}
            <div className="min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <EmptyState
                  message="No videos added yet!"
                  subtitle="Add video tutorials or cooking demonstrations for this recipe"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                  <AnimatePresence>
                    {videos.map((video) => {
                      const embedUrl = getEmbedUrl(video);
                      const thumbnailUrl = getThumbnailUrl(video);
                      const isSelected = selectedVideo?.id === video.id;

                      return (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <Card className="glow-card border-purple-500/30 overflow-hidden">
                            {isSelected && embedUrl ? (
                              <CardContent className="p-0">
                                <div className="relative w-full aspect-video">
                                  <iframe
                                    src={embedUrl}
                                    title={video.title || "Recipe Video"}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="p-4 space-y-2">
                                  {video.title && (
                                    <h4 className="font-semibold text-white">
                                      {video.title}
                                    </h4>
                                  )}
                                  {video.description && (
                                    <p className="text-sm text-gray-400">
                                      {video.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-4">
                                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                        {video.videoType}
                                      </Badge>
                                      {video.duration && (
                                        <div className="flex items-center gap-1 text-sm text-gray-400">
                                          <Clock className="h-4 w-4" />
                                          {formatDuration(video.duration)}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedVideo(null)}
                                      className="text-gray-400 hover:text-white"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            ) : (
                              <CardContent className="p-0">
                                <div
                                  className="relative w-full aspect-video cursor-pointer group"
                                  onClick={() =>
                                    embedUrl && setSelectedVideo(video)
                                  }
                                >
                                  {thumbnailUrl &&
                                  !thumbnailFailedIds.has(video.id) ? (
                                    <Image
                                      src={thumbnailUrl}
                                      alt={video.title || "Video thumbnail"}
                                      fill
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                      className="object-cover"
                                      onError={() =>
                                        setThumbnailFailedIds((prev) =>
                                          new Set(prev).add(video.id),
                                        )
                                      }
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                                      <Video className="h-16 w-16 text-purple-400" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="p-4 bg-black/60 rounded-full group-hover:scale-110 transition-transform">
                                      <Play
                                        className="h-12 w-12 text-white"
                                        fill="white"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4 space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      {video.title && (
                                        <h4 className="font-semibold text-white mb-1">
                                          {video.title}
                                        </h4>
                                      )}
                                      {video.description && (
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                          {video.description}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVideo(video);
                                      }}
                                      disabled={removeVideo.isPending}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                      {video.videoType}
                                    </Badge>
                                    {video.duration && (
                                      <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(video.duration)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={confirmDelete}
              title="Delete Video"
              description={`Are you sure you want to delete this video? This action cannot be undone.`}
            />
          </div>
        </CardContent>
      </Card>
    );
  },
);

RecipeVideoPlayer.displayName = "RecipeVideoPlayer";

export default RecipeVideoPlayer;
