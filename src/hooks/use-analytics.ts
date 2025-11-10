import { useNoteStore } from "@/stores/useNoteStore";
import { useTaskStore } from "@/stores/useTaskStore";

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
}

export function useAnalytics(): Analytics {
    const notes = useNoteStore(state => state.notes)
    const tasks = useTaskStore(state => state.tasks)

    const calculateStreak = () => {
        const activityDates = new Set<string>()

        notes.forEach(note => {
            activityDates.add(new Date(note.createdAt).toDateString())
            activityDates.add(new Date(note.modifiedAt).toDateString())
        })

        tasks.forEach(task => {
            activityDates.add(new Date(task.createdAt).toDateString())
            activityDates.add(new Date(task.updatedAt).toDateString())
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

    return {
        streak: {
            days: calculateStreak()
        },
        noteStats: calculateNoteStats(),
        tasksStats: calculateTaskStats()
    }
}