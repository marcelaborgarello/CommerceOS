export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-800/50 rounded-lg ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-panel p-5 border-l-[3px] border-l-slate-700 h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="h-6 w-24 bg-slate-700/50 rounded-full animate-pulse"></div>
                    <div className="flex gap-1">
                        <div className="w-6 h-6 bg-slate-700/50 rounded animate-pulse"></div>
                        <div className="w-6 h-6 bg-slate-700/50 rounded animate-pulse"></div>
                    </div>
                </div>

                <div className="h-7 w-3/4 bg-slate-700/50 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-1/2 bg-slate-700/50 rounded mb-4 animate-pulse"></div>

                <div className="flex justify-between items-end border-t border-slate-700/30 pt-3 mt-1">
                    <div className="flex flex-col gap-1">
                        <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                </div>
            </div>
            <div className="mt-5 w-full h-10 bg-slate-700/50 rounded animate-pulse"></div>
        </div>
    );
}
