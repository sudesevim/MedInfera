export interface HealthEntry {
  value: string;
  date: string;
}

export interface AccordionProps {
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
  emoji?: string;
  entriesCount: number;
}

export interface HistoryListProps {
  entries: HealthEntry[];
  unit?: string;
  onDelete?: (index: number) => void;
}


