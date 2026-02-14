'use client';

import dynamic from 'next/dynamic';

const TaskMap = dynamic(() => import('../../components/tasks/TaskMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] w-full bg-gray-100 dark:bg-zinc-800 animate-pulse rounded-2xl flex items-center justify-center">
            <span className="text-gray-400">Karte wird geladen...</span>
        </div>
    )
});

export default function TaskMapClient(props: any) {
    return <TaskMap {...props} />;
}
