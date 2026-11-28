import { ActionIcon, CloseButton, Group, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface AdminSearchProps {
  value?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  testId?: string;
}

export function AdminSearch({
  value = '',
  onSearch,
  placeholder = 'Tìm kiếm...',
  label = 'Tìm kiếm',
  disabled = false,
  testId = 'admin',
}: Readonly<AdminSearchProps>) {
  const isDesktop = useMediaQuery('(min-width: 75em)') ?? true;
  const [keyword, setKeyword] = useState<string>(value ?? '');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setKeyword(value ?? '');
  }, [value]);

  const isFilled = keyword.trim() !== '';
  const isCollapsed = !isDesktop && !isFilled && !isExpanded;

  const handleSearch = () => {
    onSearch(keyword.trim());
  };

  const handleButtonClick = () => {
    if (isCollapsed) {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return;
    }
    handleSearch();
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={{
        width: isCollapsed ? 36 : 260,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <TextInput
        ref={inputRef}
        value={keyword}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label}
        data-testid={`search-${testId}`}
        onChange={(e) => setKeyword(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        }}
        onBlur={() => {
          if (keyword.trim() === '') {
            setIsExpanded(false);
          }
        }}
        rightSection={
          keyword && !disabled ? (
            <CloseButton
              size="sm"
              aria-label="Xóa từ khóa"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
            />
          ) : null
        }
        style={{
          flex: isCollapsed ? '0 0 0px' : '1 1 auto',
          width: isCollapsed ? 0 : undefined,
          opacity: isCollapsed ? 0 : 1,
          pointerEvents: isCollapsed ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
        }}
        styles={{
          input: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      />

      <ActionIcon
        size={36}
        variant={isCollapsed ? 'default' : 'filled'}
        disabled={disabled}
        title={label}
        aria-label={label}
        data-testid={`${testId}-search-btn`}
        onClick={handleButtonClick}
        style={{
          borderTopLeftRadius: isCollapsed ? undefined : 0,
          borderBottomLeftRadius: isCollapsed ? undefined : 0,
          flexShrink: 0,
        }}
      >
        <Search size={16} />
      </ActionIcon>
    </Group>
  );
}
