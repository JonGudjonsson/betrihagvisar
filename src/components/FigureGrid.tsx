import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FigureDefinition } from "../types";
import { useReducedMotion } from "../lib/hooks";
import { FigurePanel, type FigurePanelProps } from "./FigurePanel";
import type { MenuItem } from "./Menu";
import { IconGrip } from "./Icons";

interface Props {
  figures: FigureDefinition[];
  arrange: boolean;
  onReorder?: (ids: string[]) => void;
  variant?: "public" | "set";
  showChapter?: boolean;
  extraMenuItems?: (fig: FigureDefinition) => MenuItem[];
  label: string;
}

export function FigureGrid({ figures, arrange, onReorder, variant = "public", showChapter, extraMenuItems, label }: Props) {
  const ids = figures.map((f) => f.id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: string | number) => {
    const f = figures.find((x) => x.id === id);
    return f ? `${f.id} ${f.title}` : String(id);
  };
  const posOf = (id: string | number) => ids.indexOf(String(id)) + 1;

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Tók upp mynd ${titleOf(active.id)}. Hún er í sæti ${posOf(active.id)} af ${ids.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `Mynd ${titleOf(active.id)} færð í sæti ${posOf(over.id)} af ${ids.length}.` : `Mynd ${titleOf(active.id)} er ekki yfir sleppisvæði.`,
    onDragEnd: ({ active, over }) =>
      over ? `Mynd ${titleOf(active.id)} sleppt í sæti ${posOf(over.id)} af ${ids.length}.` : `Mynd ${titleOf(active.id)} sleppt.`,
    onDragCancel: ({ active }) => `Hætt við að færa ${titleOf(active.id)}.`,
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ids.length || from === to) return;
    onReorder?.(arrayMove(ids, from, to));
  };

  const arrangeItems = (index: number): MenuItem[] => [
    { label: "Færa fremst", onSelect: () => move(index, 0), disabled: index === 0 },
    { label: "Færa ofar", onSelect: () => move(index, index - 1), disabled: index === 0 },
    { label: "Færa neðar", onSelect: () => move(index, index + 1), disabled: index === ids.length - 1 },
    { label: "Færa aftast", onSelect: () => move(index, ids.length - 1), disabled: index === ids.length - 1 },
  ];

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  };

  const common: Partial<FigurePanelProps> = { variant, showChapter };

  if (!arrange) {
    return (
      <div className="fig-grid" role="list" aria-label={label}>
        {figures.map((f) => (
          <div role="listitem" key={f.id} className="fig-grid__cell">
            <FigurePanel figure={f} {...common} extraMenuItems={extraMenuItems?.(f)} />
          </div>
        ))}
      </div>
    );
  }

  const activeFig = figures.find((f) => f.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Til að taka upp mynd: ýttu á bil eða Enter. Notaðu örvalyklana til að færa hana, bil eða Enter til að sleppa, Escape til að hætta við.",
        },
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="fig-grid fig-grid--arrange" role="list" aria-label={`${label}: röðun`}>
          {figures.map((f, i) => (
            <SortableFigure key={f.id} figure={f} common={common} menuItems={arrangeItems(i)} reduced={reduced} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={reduced ? null : { duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeFig ? (
          <div className="drag-preview">
            <FigurePanel figure={activeFig} {...common} arrange overlay handle={<span className="drag-handle is-grabbing" aria-hidden="true"><IconGrip /></span>} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableFigure({
  figure,
  common,
  menuItems,
  reduced,
}: {
  figure: FigureDefinition;
  common: Partial<FigurePanelProps>;
  menuItems: MenuItem[];
  reduced: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: figure.id,
    transition: reduced ? null : { duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: reduced ? undefined : transition,
  };

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      className="drag-handle"
      aria-label={`Draga mynd ${figure.id} ${figure.title}`}
      {...attributes}
      {...listeners}
    >
      <IconGrip />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} role="listitem" className={`fig-grid__cell${isDragging ? " is-dragging" : ""}`}>
      <FigurePanel figure={figure} {...common} arrange handle={handle} arrangeMenuItems={menuItems} />
      {isDragging && (
        <div className="drop-placeholder" aria-hidden="true">
          <span>Slepptu hér</span>
        </div>
      )}
    </div>
  );
}
