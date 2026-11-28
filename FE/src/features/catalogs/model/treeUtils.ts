export type TreeNode<T> = T & {
  depth: number;
  hasChildren: boolean;
};

interface HasParentId {
  id?: string;
  parentId?: string | null;
}

/**
 * Dựng danh sách phẳng dạng cây từ mảng đã sắp xếp theo sortOrder.
 */
export function buildTreeList<T extends HasParentId>(items: T[]): TreeNode<T>[] {
  const idSet = new Set(items.map((item) => item.id).filter((id): id is string => Boolean(id)));
  const childrenMap = new Map<string, T[]>();
  const roots: T[] = [];

  for (const item of items) {
    if (item.parentId && idSet.has(item.parentId)) {
      const list = childrenMap.get(item.parentId) ?? [];
      list.push(item);
      childrenMap.set(item.parentId, list);
    } else {
      roots.push(item);
    }
  }

  const result: TreeNode<T>[] = [];
  const visited = new Set<string>();

  const visit = (node: T, depth: number) => {
    if (node.id) {
      if (visited.has(node.id)) return;
      visited.add(node.id);
    }
    const children = node.id ? (childrenMap.get(node.id) ?? []) : [];
    result.push({
      ...node,
      depth,
      hasChildren: children.length > 0,
    });
    for (const child of children) {
      visit(child, depth + 1);
    }
  };

  for (const root of roots) {
    visit(root, 0);
  }

  return result;
}

/**
 * Lấy tập ID của chính node đó và toàn bộ con cháu để loại khỏi danh sách chọn mục cha.
 */
export function getDescendantIds<T extends HasParentId>(items: T[], rootId: string): Set<string> {
  const childrenMap = new Map<string, string[]>();
  for (const item of items) {
    if (item.id && item.parentId) {
      const list = childrenMap.get(item.parentId) ?? [];
      list.push(item.id);
      childrenMap.set(item.parentId, list);
    }
  }

  const excluded = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = childrenMap.get(current) ?? [];
    for (const childId of children) {
      if (!excluded.has(childId)) {
        excluded.add(childId);
        queue.push(childId);
      }
    }
  }

  return excluded;
}
