import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';
import { getCoreRowModel, getSortedRowModel, useReactTable, flexRender } from '@tanstack/react-table';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import { memo } from 'react';

const DataTable = memo(
  ({
    columns,
    data,
    total = 0,
    page = 1,
    pageSize = 10,
    pageCount = 0,
    onPageChange,
    onPageSizeChange,
    sorting,
    onSortingChange,
    rowSelection,
    onRowSelectionChange,
    isLoading,
    onExport,
    exportFilename,
    onRowClick
  }) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getRowId: (row, index) => row.id ?? row._id ?? `row-${index}`,
      manualPagination: true,
      manualSorting: true,
      state: {
        sorting,
        rowSelection
      },
      onSortingChange,
      onRowSelectionChange,
      pageCount
    });

    const headerBg = useColorModeValue('gray.100', 'gray.700');

    return (
      <Box borderRadius="2xl" bg={useColorModeValue('white', 'gray.800')} boxShadow="subtle" overflow="hidden">
        <Flex align="center" justify="space-between" px={6} py={4} borderBottomWidth="1px">
          <Flex fontWeight="medium" align="center" gap={2}>
            Showing {total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total)}-
            {total === 0 ? 0 : Math.min(page * pageSize, total)} of {total}
          </Flex>
          <Flex gap={2} align="center">
            {onExport ? (
              <Tooltip label="Export current view">
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<FiDownload />}
                  aria-label="Export CSV"
                  onClick={() => onExport({ rows: data, columns, filename: exportFilename })}
                />
              </Tooltip>
            ) : null}
            <Select
              size="sm"
              w="auto"
              value={pageSize}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={headerBg}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();
                    return (
                      <Th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        cursor={canSort ? 'pointer' : 'default'}
                        userSelect="none"
                        fontSize="xs"
                        textTransform="uppercase"
                        color="gray.500"
                      >
                        <Flex align="center" gap={2}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {sortState ? (
                            <Icon as={sortState === 'desc' ? FiChevronDown : FiChevronUp} boxSize={3} />
                          ) : null}
                        </Flex>
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody position="relative">
              {isLoading ? (
                <Tr>
                  <Td colSpan={columns.length} py={24} textAlign="center">
                    <Spinner thickness="4px" speed="0.6s" size="xl" />
                  </Td>
                </Tr>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <Tr
                    key={row.id}
                    _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}
                    cursor={onRowClick ? 'pointer' : 'default'}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={columns.length} py={20} textAlign="center" color="gray.400">
                    No records found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
        <Flex align="center" justify="space-between" px={6} py={4} borderTopWidth="1px">
          <Button
            size="sm"
            leftIcon={<FiChevronLeft />}
            onClick={() => onPageChange?.(page - 1)}
            isDisabled={page <= 1}
            variant="ghost"
          >
            Previous
          </Button>
          <Flex align="center" gap={3} fontSize="sm" color="gray.500">
            Page {page} of {Math.max(pageCount, 1)}
          </Flex>
          <Button
            size="sm"
            rightIcon={<FiChevronRight />}
            onClick={() => onPageChange?.(page + 1)}
            isDisabled={page >= pageCount}
            variant="ghost"
          >
            Next
          </Button>
        </Flex>
      </Box>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;
