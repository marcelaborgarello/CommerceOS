export default function Loading() {
    return (
        <div className="min-h-screen pb-12 animate-pulse">
            <main className="w-full flex flex-col gap-12 pb-12">
                <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">

                    {/* Section 1: Sales Form Skeleton */}
                    <div className="glass-panel p-6 mt-4 border-t-2 border-slate-700/50">
                        <div className="flex flex-row justify-between items-center mb-8">
                            {/* Title Skeleton */}
                            <div className="h-8 w-48 bg-slate-700/50 rounded-lg"></div>
                            {/* Badge Skeleton */}
                            <div className="h-6 w-24 bg-slate-700/50 rounded-full"></div>
                        </div>

                        {/* Inputs Row Skeleton */}
                        <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
                            <div className="w-full md:w-48 h-12 bg-slate-700/30 rounded-lg"></div>
                            <div className="w-full md:flex-1 h-12 bg-slate-700/30 rounded-lg"></div>
                            <div className="w-full md:w-32 h-12 bg-slate-700/30 rounded-lg hidden md:block"></div>
                            <div className="h-12 w-32 bg-slate-700/50 rounded-lg hidden md:block"></div>
                        </div>
                    </div>

                    {/* Section 2: Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                        {/* We generate 6 skeleton cards to match likely layout */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass-panel flex flex-col items-center justify-center p-8 h-[220px] border border-slate-700/30">
                                {/* Icon Circle */}
                                <div className="w-16 h-16 bg-slate-700/50 rounded-full mb-4"></div>
                                {/* Title */}
                                <div className="h-6 w-32 bg-slate-700/50 rounded-lg mt-2 mb-2"></div>
                                {/* Subtitle */}
                                <div className="h-4 w-48 bg-slate-700/30 rounded-lg mt-2"></div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
}
