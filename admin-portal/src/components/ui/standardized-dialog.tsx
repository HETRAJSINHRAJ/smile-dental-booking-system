"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const StandardizedDialog = DialogPrimitive.Root;

const StandardizedDialogTrigger = DialogPrimitive.Trigger;

const StandardizedDialogPortal = DialogPrimitive.Portal;

const StandardizedDialogClose = DialogPrimitive.Close;

const StandardizedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
StandardizedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const StandardizedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "full";
  }
>(({ className, children, showCloseButton = true, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    full: "sm:max-w-[90vw]",
  };

  return (
    <StandardizedDialogPortal>
      <StandardizedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]",
          "max-w-[calc(100%-2rem)] gap-6 bg-white rounded-2xl p-6 shadow-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "duration-300",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute right-6 top-6 rounded-full p-1.5 opacity-70 ring-offset-white transition-all hover:opacity-100 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </StandardizedDialogPortal>
  );
});
StandardizedDialogContent.displayName = DialogPrimitive.Content.displayName;

const StandardizedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-left",
      className
    )}
    {...props}
  />
);
StandardizedDialogHeader.displayName = "StandardizedDialogHeader";

const StandardizedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0 pt-4 border-t border-gray-100",
      className
    )}
    {...props}
  />
);
StandardizedDialogFooter.displayName = "StandardizedDialogFooter";

const StandardizedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-tight tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
));
StandardizedDialogTitle.displayName = DialogPrimitive.Title.displayName;

const StandardizedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600 leading-relaxed", className)}
    {...props}
  />
));
StandardizedDialogDescription.displayName = DialogPrimitive.Description.displayName;

const StandardizedDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("space-y-4 py-2", className)}
    {...props}
  />
);
StandardizedDialogBody.displayName = "StandardizedDialogBody";

export {
  StandardizedDialog,
  StandardizedDialogPortal,
  StandardizedDialogOverlay,
  StandardizedDialogTrigger,
  StandardizedDialogClose,
  StandardizedDialogContent,
  StandardizedDialogHeader,
  StandardizedDialogFooter,
  StandardizedDialogTitle,
  StandardizedDialogDescription,
  StandardizedDialogBody,
};

