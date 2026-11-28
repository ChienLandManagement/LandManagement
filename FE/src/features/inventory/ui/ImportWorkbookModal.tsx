import { Alert, Button, FileInput, Group, List, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, FileSpreadsheet, Upload } from 'lucide-react';
import { useState } from 'react';
import {
  getCheckPeriodQueryKey,
  getGetEntriesQueryKey,
  getListLandChangesQueryKey,
  getListPeriodsQueryKey,
  useImportWorkbook,
} from '@/shared/api/generated/api';
import { showError, showSuccess } from '@/shared/api/utils';

interface ImportWorkbookModalProps {
  opened: boolean;
  onClose: () => void;
  periodId: string;
}

interface ImportResultSummary {
  areaCells?: number;
  countCells?: number;
  changeCount?: number;
  warnings?: string[];
}

export function ImportWorkbookModal({ opened, onClose, periodId }: ImportWorkbookModalProps) {
  const queryClient = useQueryClient();
  const importWorkbook = useImportWorkbook();

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResultSummary | null>(null);

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      const response = await importWorkbook.mutateAsync({
        periodId,
        data: { file },
      });
      const data = response.data;
      setResult({
        areaCells: data?.areaCells ?? 0,
        countCells: data?.countCells ?? 0,
        changeCount: data?.changeCount ?? 0,
        warnings: data?.warnings ?? [],
      });
      showSuccess('Nhập dữ liệu từ Excel thành công');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetEntriesQueryKey(periodId) }),
        queryClient.invalidateQueries({ queryKey: getCheckPeriodQueryKey(periodId) }),
        queryClient.invalidateQueries({ queryKey: getListLandChangesQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getListPeriodsQueryKey() }),
      ]);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Nhập số liệu từ Excel" size="lg" centered>
      <Stack gap="md">
        <Alert color="orange" variant="light" icon={<AlertTriangle size={16} />}>
          Nhập file sẽ thay số liệu B01, B02 và biến động nhập từ Excel trước đó của kỳ này.
        </Alert>

        <FileInput
          label="Chọn tệp Excel (.xlsx)"
          placeholder="Chọn tệp bảng tính..."
          accept=".xlsx"
          leftSection={<FileSpreadsheet size={16} />}
          value={file}
          onChange={(nextFile) => {
            setFile(nextFile);
            setResult(null);
          }}
          clearable
        />

        {result && (
          <Alert color="teal" variant="light" title="Kết quả nhập dữ liệu">
            <Stack gap="xs">
              <Text size="sm">
                Số ô diện tích (B01):{' '}
                <Text span fw={600}>
                  {result.areaCells}
                </Text>{' '}
                · Số ô số lượng (B02):{' '}
                <Text span fw={600}>
                  {result.countCells}
                </Text>{' '}
                · Số biến động:{' '}
                <Text span fw={600}>
                  {result.changeCount}
                </Text>
              </Text>
              {result.warnings && result.warnings.length > 0 && (
                <div>
                  <Text size="sm" fw={600} mb={4}>
                    Cảnh báo ({result.warnings.length}):
                  </Text>
                  <ScrollArea.Autosize mah={180}>
                    <List size="xs" spacing={2}>
                      {result.warnings.map((w) => (
                        <List.Item key={w}>{w}</List.Item>
                      ))}
                    </List>
                  </ScrollArea.Autosize>
                </div>
              )}
            </Stack>
          </Alert>
        )}

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={handleClose}>
            {result ? 'Đóng' : 'Hủy'}
          </Button>
          <Button
            leftSection={<Upload size={16} />}
            disabled={!file}
            loading={importWorkbook.isPending}
            onClick={handleImport}
          >
            Nhập
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
