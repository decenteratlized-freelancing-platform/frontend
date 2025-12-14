"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading || disabled} className={cn("relative", className)} {...props}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" className="text-current" />
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
    </Button>
  )
}
