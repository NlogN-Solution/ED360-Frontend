import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, useUpdateTask } from "./hooks";
import { TASK_STATUS_COLUMNS, type TaskRead } from "./types";
import { TaskStatus } from "@/types/enums";
import { toneForStatus } from "@/utils/statusTone";
import { toTitleCase, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

const DOT: Record<string, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const PRIORITY_CLASS: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-info",
  high: "text-warning",
  urgent: "text-danger",
};

function TaskCard({ task }: { task: TaskRead }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 shadow-sm">
      <p className="text-[13px] font-medium text-foreground">{task.title}</p>
      <div className="mt-1.5 flex items-center justify-between">
        <span className={cn("text-[11px] font-medium", PRIORITY_CLASS[task.priority])}>{toTitleCase(task.priority)}</span>
        {task.due_date && (
          <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <CalendarClock className="h-2.5 w-2.5" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableTaskCard({ task }: { task: TaskRead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, data: { task } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("cursor-grab touch-none rounded-lg active:cursor-grabbing", isDragging && "opacity-0")}
    >
      <TaskCard task={task} />
    </div>
  );
}

function KanbanColumn({ status, items, isLoading }: { status: TaskStatus; items: TaskRead[]; isLoading: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const tone = toneForStatus(status);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-[280px] shrink-0 rounded-xl border border-border bg-muted/30 p-2.5 transition-colors",
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />
        <span className="text-[13px] font-medium text-foreground">{toTitleCase(status)}</span>
        <span className="ml-auto rounded-md bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {isLoading ? "—" : items.length}
        </span>
      </div>

      <div className="min-h-[80px] space-y-2">
        {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[76px] w-full rounded-lg" />)}

        {items.map((task) => (
          <DraggableTaskCard key={task.id} task={task} />
        ))}

        {!isLoading && items.length === 0 && <p className="px-1 py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>}
      </div>
    </div>
  );
}

export function TaskBoard({ search }: { search: string }) {
  const { data, isLoading } = useTasks({ limit: 100, search: search || undefined });
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = useState<TaskRead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byStatus = useMemo(() => {
    const map = new Map<string, TaskRead[]>(TASK_STATUS_COLUMNS.map((s) => [s, []]));
    for (const task of data?.items ?? []) {
      if (!map.has(task.status)) map.set(task.status, []);
      map.get(task.status)!.push(task);
    }
    return map;
  }, [data]);

  function handleDragStart(event: DragStartEvent) {
    setActiveTask((event.active.data.current as { task: TaskRead } | undefined)?.task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = (active.data.current as { task: TaskRead } | undefined)?.task;
    if (!task) return;

    const newStatus = over.id as TaskStatus;
    if (newStatus === task.status) return;

    updateTask.mutate({
      id: task.id,
      payload: {
        status: newStatus,
        completed_at: newStatus === TaskStatus.COMPLETED ? new Date().toISOString() : null,
      },
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TASK_STATUS_COLUMNS.map((status) => (
          <KanbanColumn key={status} status={status} items={byStatus.get(status) ?? []} isLoading={isLoading} />
        ))}
      </div>

      <DragOverlay>{activeTask ? <div className="w-[264px] rotate-2"><TaskCard task={activeTask} /></div> : null}</DragOverlay>
    </DndContext>
  );
}
