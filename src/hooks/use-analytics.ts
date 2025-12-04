import { useNoteStore } from "@/stores/useNoteStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useNotebookStore } from "@/stores/useNotebookStore";

export interface Analytics {
    streak: {
        days: number;
    };
    noteStats: {
        total: number;
        thisWeek: number;
        thisMonth: number;
    }
    tasksStats: {
        total: number;
        completed: number;
        pending: number;
        completionRate: number;
    }
    notebookStats: {
        total: number;
        pagesTotal: number;
        notebooksWithPages: number;
        thisWeek: number;
        thisMonth: number;
    }
}

export function useAnalytics(): Analytics {
    const notes = useNoteStore(state => state.notes)
    const tasks = useTaskStore(state => state.tasks)
    const notebooks = useNotebookStore(state => state.notebooks)

    const calculateStreak = () => {
        const activityDates = new Set<string>()

        notes.forEach(note => {
            if (note.createdAt) activityDates.add(new Date(note.createdAt).toDateString())
            if (note.modifiedAt) activityDates.add(new Date(note.modifiedAt).toDateString())
        })

        tasks.forEach(task => {
            if (task.createdAt) activityDates.add(new Date(task.createdAt).toDateString())
            if (task.updatedAt) activityDates.add(new Date(task.updatedAt).toDateString())
        })

        // Include notebooks and their pages
        notebooks.forEach(nb => {
            if (nb.createdAt) activityDates.add(new Date(nb.createdAt).toDateString())
            if (nb.modifiedAt) activityDates.add(new Date(nb.modifiedAt).toDateString())
            nb.pages?.forEach(p => {
                if (p.createdAt) activityDates.add(new Date(p.createdAt).toDateString())
                if (p.modifiedAt) activityDates.add(new Date(p.modifiedAt).toDateString())
            })
        })

        const sortedDates = Array.from(activityDates).map(date => new Date(date)).sort((a, b) => b.getTime() - a.getTime())

        let streak = 0
        const today = new Date()
        today.setHours(0,0,0,0)

        for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)

            if(sortedDates.some(date => date.toDateString() === expectedDate.toDateString())) {
                streak ++
            } else {
                break
            }
        }

        return streak
    }

    const calculateNoteStats = () => {
        const now = new Date()
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)

        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)

        return {
            total: notes.length,
            thisWeek: notes.filter(note => new Date(note.createdAt) >= weekAgo).length,
            thisMonth: notes.filter(note => new Date(note.createdAt) >= monthAgo).length
        }
    }

    const calculateTaskStats = () => {
        const completed = tasks.filter(task => task.status === 'completed').length
        const total = tasks.length

        return {
            total,
            completed,
            pending: tasks.filter(task => task.status === 'pending').length,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
    }

    const calculateNotebookStats = () => {
        const now = new Date()
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)

        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)

        const totalNotebooks = notebooks.length
        let pagesTotal = 0
        let notebooksWithPages = 0

        notebooks.forEach(nb => {
            const len = nb.pages?.length ?? 0
            pagesTotal += len
            if (len > 0) notebooksWithPages++
        })

        const thisWeek = notebooks.reduce((acc, nb) => {
            const createdInWeek = nb.createdAt && new Date(nb.createdAt) >= weekAgo ? 1 : 0
            const modifiedInWeek = nb.modifiedAt && new Date(nb.modifiedAt) >= weekAgo ? 1 : 0
            const pagesInWeek = (nb.pages ?? []).filter(p => new Date(p.createdAt) >= weekAgo).length
            return acc + createdInWeek + modifiedInWeek + pagesInWeek
        }, 0)

        const thisMonth = notebooks.reduce((acc, nb) => {
            const createdInMonth = nb.createdAt && new Date(nb.createdAt) >= monthAgo ? 1 : 0
            const modifiedInMonth = nb.modifiedAt && new Date(nb.modifiedAt) >= monthAgo ? 1 : 0
            const pagesInMonth = (nb.pages ?? []).filter(p => new Date(p.createdAt) >= monthAgo).length
            return acc + createdInMonth + modifiedInMonth + pagesInMonth
        }, 0)

        return {
            total: totalNotebooks,
            pagesTotal,
            notebooksWithPages,
            thisWeek,
            thisMonth,
        }
    }

    return {
        streak: {
            days: calculateStreak()
        },
        noteStats: calculateNoteStats(),
        tasksStats: calculateTaskStats(),
        notebookStats: calculateNotebookStats()
    }
}