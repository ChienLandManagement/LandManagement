import { Alert, Button, CloseButton, Group, List, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useState } from 'react';
import {
  getCheckPeriodQueryKey,
  getGetEntriesQueryKey,
  getListLandChangesQueryKey,
  getListPeriodsQueryKey,
  useImportWorkbook,
} from '@/shared/api/generated/api';
import { showError, showSuccess } from '@/shared/api/utils';
import { env } from '@/shared/config/env';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// File mẫu rỗng do BE phục vụ từ wwwroot/templates.
const TEMPLATE_URL = `${env.VITE_API_URL ?? ''}/templates/mau-nhap-kiem-ke.xlsx`;

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

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

        <Dropzone
          onDrop={(files) => {
            setFile(files[0] ?? null);
            setResult(null);
          }}
          onReject={() => showError(new Error('Chỉ nhận một file .xlsx, tối đa 10 MB'))}
          accept={[XLSX_MIME]}
          maxSize={MAX_FILE_SIZE}
          multiple={false}
        >
          <Group justify="center" gap="md" mih={120} style={{ pointerEvents: 'none' }}>
            <FileSpreadsheet size={40} />
            <div>
              <Text size="md" inline>
                Kéo file Excel vào đây hoặc bấm để chọn
              </Text>
              <Text size="xs" c="dimmed" inline mt={7}>
                Chỉ nhận .xlsx, tối đa 10 MB
              </Text>
            </div>
          </Group>
        </Dropzone>

        {file && (
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <FileSpreadsheet size={16} />
              <Text size="sm" fw={500} lineClamp={1}>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                {formatFileSize(file.size)}
              </Text>
            </Group>
            <CloseButton
              aria-label="Bỏ file đã chọn"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            />
          </Group>
        )}

        <Button
          component="a"
          href={TEMPLATE_URL}
          download
          variant="subtle"
          size="xs"
          leftSection={<Download size={14} />}
          style={{ alignSelf: 'flex-start' }}
        >
          Tải file mẫu (.xlsx)
        </Button>

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
