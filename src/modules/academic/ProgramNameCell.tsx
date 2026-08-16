import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgram } from "./hooks";

export function ProgramNameCell({
  programId,
  linkToDetail = true,
}: {
  programId: string | null;
  /** Set false when this cell is nested inside a row that already navigates
   * somewhere else on click (e.g. an applications list row) — a nested link
   * would otherwise steal the click via stopPropagation. */
  linkToDetail?: boolean;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useProgram(programId ?? undefined);

  if (!programId) return <span className="text-muted-foreground">—</span>;
  if (isLoading) return <Skeleton className="h-4 w-28" />;
  if (!data) return <span className="font-mono text-xs text-muted-foreground">#{programId.slice(0, 8)}</span>;

  if (!linkToDetail) return <span className="text-foreground">{data.name}</span>;

  return (
    <button
      className="text-foreground hover:text-primary hover:underline"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/academic/programs/${programId}`);
      }}
    >
      {data.name}
    </button>
  );
}
