
export interface NeuralNode {
  id: string;
  label: string;
  category: string;
  content: string;
  criticality: number;
  outDegree: number;
  inDegree: number;
  isOrphan: boolean;
  x?: number;
  y?: number;
  z?: number;
}

export interface NeuralLink {
  source: string | NeuralNode;
  target: string | NeuralNode;
  violation: boolean;
}

export const colorMap: Record<string, string> = {
  'Domain': '#ef4444',
  'Application': '#a855f7',
  'Infrastructure': '#10b981',
  'Presentation': '#3b82f6',
  'Other': '#64748b'
};
