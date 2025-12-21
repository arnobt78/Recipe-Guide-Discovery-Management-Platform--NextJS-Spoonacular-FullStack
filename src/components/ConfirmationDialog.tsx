/**
 * Reusable Confirmation Dialog Component
 *
 * Features:
 * - ShadCN Dialog component
 * - Consistent confirmation UI
 * - Reusable across the app
 * - Memoized for performance
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, optimized performance
 */

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

/**
 * Confirmation Dialog Component (Memoized for performance)
 *
 * Reusable confirmation dialog for delete/remove actions
 */
const ConfirmationDialog = memo(({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glow-card border-purple-500/30 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
            aria-label={cancelText}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "glow-button"
            }
            aria-label={confirmText}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ConfirmationDialog.displayName = "ConfirmationDialog";

export default ConfirmationDialog;

