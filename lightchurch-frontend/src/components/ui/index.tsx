import React from 'react'
import { cn } from '../../lib/utils'

// BUTTON
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-primary hover:bg-primary/90 text-white',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            outline: 'border border-gray-600 bg-transparent hover:bg-secondary/10 text-white',
            ghost: 'hover:bg-secondary/10 text-white',
            danger: 'bg-error hover:bg-error/90 text-white',
        }
        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2',
            lg: 'h-12 px-8 text-lg',
        }
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

// INPUT
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-md border border-gray-700 bg-surface px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            />
        )
    }
)
Input.displayName = 'Input'

// LABEL
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200",
                className
            )}
            {...props}
        />
    )
)
Label.displayName = "Label"

// CARD
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('rounded-xl border border-gray-800 bg-surface/50 text-white shadow-sm backdrop-blur-sm', className)}
            {...props}
        />
    )
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
    )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight text-xl', className)} {...props} />
    )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    )
)
CardContent.displayName = 'CardContent'
// TEXTAREA
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-gray-700 bg-surface px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

// CHECKBOX
import { Check } from 'lucide-react'

export const Checkbox = React.forwardRef<HTMLButtonElement, { checked?: boolean, onCheckedChange?: (checked: boolean) => void, id?: string }>(
    ({ checked, onCheckedChange, id }, ref) => {
        return (
            <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                id={id}
                ref={ref}
                onClick={() => onCheckedChange?.(!checked)}
                className={cn(
                    "peer h-5 w-5 shrink-0 rounded-sm border border-gray-600 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                    checked ? "bg-primary text-white border-primary" : "bg-surface text-transparent"
                )}
            >
                <Check className="h-4 w-4" />
            </button>
        )
    }
)
Checkbox.displayName = "Checkbox"
