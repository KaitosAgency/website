import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200", className)}
            {...props}
        />
    )
}

// Skeleton spécialisés pour le dashboard
export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-9 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
        </div>
    )
}

export function ProfileCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <Skeleton className="w-32 h-32 rounded-full shrink-0" />

                <div className="flex-1 space-y-4">
                    {/* Nom */}
                    <Skeleton className="h-7 w-48" />
                    {/* Username */}
                    <Skeleton className="h-5 w-32" />
                    {/* Description */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    {/* Lien profil */}
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>

            {/* Section Token Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-4 w-44" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>

            {/* Section Automation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>
            </div>

            {/* Section Déconnexion */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-80 mt-2" />
            </div>
        </div>
    )
}

export function ConnectionStatusSkeleton() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
        </div>
    )
}
