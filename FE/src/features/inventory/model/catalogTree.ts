import { LandHolderKind, type LandHolderTypeItem, type LandTypeItem } from '@/shared/api/model';

export type GridMode = 'B01' | 'B02';

export interface LandTypeRow {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  isMemo: boolean;
  depth: number;
  isLeaf: boolean;
  /** Các ID loại đất lá (không-memo) thuộc nhánh này để tính tổng cho dòng cha */
  leafDescendantIds: string[];
}

export interface HolderLeaf {
  id: string;
  code: string;
  name: string;
  kind: string;
  parentId: string | null;
}

export interface HolderGroup {
  id: string;
  label: string;
  kind: string;
  leaves: HolderLeaf[];
}

export interface HolderColumnsResult {
  userLeaves: HolderLeaf[];
  managerLeaves: HolderLeaf[];
  allLeaves: HolderLeaf[];
  groups: HolderGroup[];
}

export function cellKey(landTypeId: string, holderTypeId: string): string {
  return `${landTypeId}|${holderTypeId}`;
}

export function buildLandTypeRows(landTypes: LandTypeItem[], mode: GridMode): LandTypeRow[] {
  const filtered = landTypes
    .filter((lt): lt is LandTypeItem & { id: string } => Boolean(lt.id) && (mode === 'B01' || lt.inB02 === true))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const byId = new Map<string, LandTypeItem & { id: string }>();
  const childrenMap = new Map<string, (LandTypeItem & { id: string })[]>();

  for (const item of filtered) {
    byId.set(item.id, item);
  }

  for (const item of filtered) {
    if (item.parentId && byId.has(item.parentId)) {
      const list = childrenMap.get(item.parentId) ?? [];
      list.push(item);
      childrenMap.set(item.parentId, list);
    }
  }

  const depthCache = new Map<string, number>();
  const getDepth = (id: string, visited = new Set<string>()): number => {
    const cached = depthCache.get(id);
    if (cached !== undefined) return cached;
    if (visited.has(id)) return 0;
    visited.add(id);

    const item = byId.get(id);
    const parentId = item?.parentId;
    const depth = parentId && byId.has(parentId) ? getDepth(parentId, visited) + 1 : 0;
    depthCache.set(id, depth);
    return depth;
  };

  const hasNonMemoDescendant = (id: string): boolean => {
    const children = childrenMap.get(id) ?? [];
    for (const child of children) {
      if (!child.isMemo) return true;
      if (hasNonMemoDescendant(child.id)) return true;
    }
    return false;
  };

  const collectNonMemoLeaves = (id: string): string[] => {
    const children = childrenMap.get(id) ?? [];
    const nonMemoChildren = children.filter((c) => !c.isMemo);
    if (nonMemoChildren.length === 0) {
      const self = byId.get(id);
      return self && !self.isMemo ? [id] : [];
    }
    const result: string[] = [];
    for (const child of nonMemoChildren) {
      result.push(...collectNonMemoLeaves(child.id));
    }
    return result;
  };

  return filtered.map((item) => {
    const isLeaf = !hasNonMemoDescendant(item.id);
    const leafDescendantIds = isLeaf ? (item.isMemo ? [] : [item.id]) : collectNonMemoLeaves(item.id);

    return {
      id: item.id,
      code: item.code ?? '',
      name: item.name ?? '',
      parentId: item.parentId ?? null,
      isMemo: Boolean(item.isMemo),
      depth: getDepth(item.id),
      isLeaf,
      leafDescendantIds,
    };
  });
}

export function buildHolderColumns(holderTypes: LandHolderTypeItem[]): HolderColumnsResult {
  const valid = holderTypes
    .filter((ht): ht is LandHolderTypeItem & { id: string } => Boolean(ht.id))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const byId = new Map<string, LandHolderTypeItem & { id: string }>();
  const parentIdsWithChildren = new Set<string>();

  for (const item of valid) {
    byId.set(item.id, item);
    if (item.parentId) {
      parentIdsWithChildren.add(item.parentId);
    }
  }

  const leaves: HolderLeaf[] = valid
    .filter((item) => !parentIdsWithChildren.has(item.id))
    .map((item) => ({
      id: item.id,
      code: item.code ?? '',
      name: item.name ?? '',
      kind: item.kind ?? LandHolderKind.User,
      parentId: item.parentId ?? null,
    }));

  const userLeaves = leaves.filter((l) => l.kind === LandHolderKind.User);
  const managerLeaves = leaves.filter((l) => l.kind === LandHolderKind.Manager);
  const allLeaves = [...userLeaves, ...managerLeaves];

  const groups: HolderGroup[] = [];
  const groupIndexById = new Map<string, number>();

  for (const leaf of allLeaves) {
    const parent = leaf.parentId ? byId.get(leaf.parentId) : undefined;
    const groupId = parent ? parent.id : leaf.id;
    const groupLabel = parent ? (parent.name ?? parent.code ?? '') : leaf.name || leaf.code;

    const existingIdx = groupIndexById.get(groupId);
    if (existingIdx !== undefined) {
      groups[existingIdx].leaves.push(leaf);
    } else {
      groupIndexById.set(groupId, groups.length);
      groups.push({
        id: groupId,
        label: groupLabel,
        kind: leaf.kind,
        leaves: [leaf],
      });
    }
  }

  return { userLeaves, managerLeaves, allLeaves, groups };
}

export function formatNumberVi(value: number, mode: GridMode): string {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: mode === 'B01' ? 5 : 0,
  }).format(value);
}
