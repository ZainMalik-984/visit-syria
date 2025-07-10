export default function DashboardPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
        <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white/80 dark:bg-zinc-800/75 backdrop-blur shadow-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 p-8 animate-fadeIn">
            <h1 className="text-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Dashboard
            </h1>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Welcome to your dashboard!
            </p>
        </div>
        </main>
    );
    }