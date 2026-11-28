import { Alert, Button, Group, List, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { AlertTriangle, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import type { CheckIssueItem } from '@/shared/api/model';

interface PeriodChecksPanelProps {
  hasAreas?: boolean;
  hasCounts?: boolean;
  issues?: CheckIssueItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefetch: () => void;
}

const ISSUE_KIND_LABELS: Record<string, string> = {
  PreviousPeriod: 'Lệch so với kỳ trước cộng biến động',
  AreaVsCount: 'Diện tích và số lượng chưa khớp',
};

export function PeriodChecksPanel({
  hasAreas,
  hasCounts,
  issues = [],
  isLoading,
  isFetching,
  onRefetch,
}: PeriodChecksPanelProps) {
  const groupedIssues = useMemo(() => {
    const groups = new Map<string, CheckIssueItem[]>();
    for (const issue of issues) {
      const kind = issue.kind ?? 'Other';
      const list = groups.get(kind) ?? [];
      list.push(issue);
      groups.set(kind, list);
    }
    return Array.from(groups.entries());
  }, [issues]);

  if (isLoading) {
    return (
      <Stack gap="sm">
        <Skeleton height={36} />
        <Skeleton height={160} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Đối chiếu số liệu B01, B02 và biến động so với kỳ liền trước
        </Text>
        <Button
          variant="default"
          size="xs"
          leftSection={<RefreshCw size={14} />}
          loading={isFetching}
          onClick={onRefetch}
        >
          Kiểm tra lại
        </Button>
      </Group>

      {!hasAreas && !hasCounts ? (
        <Alert color="blue" variant="light" icon={<Info size={16} />} title="Kỳ chưa có số liệu">
          Vui lòng nhập số liệu trực tiếp trên lưới B01/B02, nhập từ Excel hoặc khởi tạo từ kỳ trước để thực hiện kiểm
          tra.
        </Alert>
      ) : issues.length === 0 ? (
        <Alert color="teal" variant="light" icon={<CheckCircle2 size={16} />} title="Không phát hiện lệch">
          Số liệu hiện trạng và biến động của kỳ kiểm kê đã khớp.
        </Alert>
      ) : (
        <Stack gap="sm">
          {groupedIssues.map(([kind, list]) => (
            <Paper key={kind} withBorder p="md" radius="md">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="orange" variant="light" size="sm">
                  <AlertTriangle size={14} />
                </ThemeIcon>
                <Text size="sm" fw={600}>
                  {ISSUE_KIND_LABELS[kind] ?? kind} ({list.length})
                </Text>
              </Group>
              <List size="sm" spacing={4}>
                {list.map((issue) => (
                  <List.Item key={`${kind}-${issue.landTypeCode ?? ''}-${issue.message ?? ''}`}>
                    {issue.message}
                  </List.Item>
                ))}
              </List>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
