import { useCallback, useEffect, useMemo, useState } from 'react';
import { HStack, IconButton, Stack, Text, Tooltip, useToast } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiEye, FiTrash2, FiUsers } from 'react-icons/fi';
import DataTable from '../components/DataTable.jsx';
import FilterBar from '../components/FilterBar.jsx';
import PageTitle from '../components/PageTitle.jsx';
import { deleteUser, getUsers } from '../api/index.js';
import { exportRowsToCsv } from '../utils/csv.js';
import { formatDate } from '../utils/format.js';

const UsersPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sorting, setSorting] = useState([]);

  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'ALL';
  const sortByParam = searchParams.get('sortBy');
  const sortDirParam = searchParams.get('sortDir') || 'asc';

  useEffect(() => {
    if (!sortByParam) {
      if (sorting.length) {
        setSorting([]);
      }
      return;
    }
    const nextSorting = [{ id: sortByParam, desc: sortDirParam === 'desc' }];
    const current = sorting[0];
    if (!current || current.id !== nextSorting[0].id || current.desc !== nextSorting[0].desc) {
      setSorting(nextSorting);
    }
  }, [sortByParam, sortDirParam, sorting]);

  const queryFilters = useMemo(
    () => ({
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    }),
    [statusFilter]
  );

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      search,
      filters: queryFilters,
      sort: sorting[0] ? { id: sorting[0].id, desc: sorting[0].desc } : undefined
    }),
    [page, pageSize, search, queryFilters, sorting]
  );

  const { data, isFetching } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => getUsers(queryParams),
    keepPreviousData: true
  });

  const tableData = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const statusOptions = useMemo(() => ['VERIFIED', 'UNVERIFIED'], []);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (_, id) => {
      toast({ status: 'success', title: 'User deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
    onError: (error) => {
      toast({
        status: 'error',
        title: 'Failed to delete user',
        description: error?.response?.data?.message || error.message
      });
    }
  });

  const {
    mutate: mutateDeleteUser,
    isPending: isDeletePending,
    variables: deleteVariables
  } = deleteMutation;

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params);
  };

  const handlePageSizeChange = (nextSize) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', String(nextSize));
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearchChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleStatusChange = (nextStatus) => {
    const params = new URLSearchParams(searchParams);
    if (!nextStatus || nextStatus === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', nextStatus);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', String(pageSize));
    setSearchParams(params);
  };

  const handleSortingChange = (nextSorting) => {
    const appliedSorting = typeof nextSorting === 'function' ? nextSorting(sorting) : nextSorting;
    setSorting(appliedSorting);
    const params = new URLSearchParams(searchParams);
    if (appliedSorting?.length) {
      params.set('sortBy', appliedSorting[0].id);
      params.set('sortDir', appliedSorting[0].desc ? 'desc' : 'asc');
    } else {
      params.delete('sortBy');
      params.delete('sortDir');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleExport = ({ rows, columns }) => {
    exportRowsToCsv({ rows, columns, filename: 'users.csv' });
  };

  const handleDeleteUser = useCallback(
    (user) => {
      if (!user?.id) return;
      const label = user.fullname || user.email || 'this user';
      const confirmDelete = window.confirm(`Are you sure you want to delete ${label}?`);
      if (!confirmDelete) return;
      mutateDeleteUser(user.id);
    },
    [mutateDeleteUser]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullname',
        header: 'Full Name',
        cell: ({ row }) => <Text fontWeight="semibold">{row.original.fullname || '—'}</Text>,
        enableSorting: true
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <Text fontSize="sm" color="gray.600">
            {row.original.email || '—'}
          </Text>
        ),
        enableSorting: true
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        cell: ({ row }) => <Text fontSize="sm">{row.original.phoneNumber || '—'}</Text>,
        enableSorting: true
      },
      {
        accessorKey: 'isEmailVerified',
        header: 'Email Verified',
        cell: ({ row }) => (
          <Text fontSize="sm" color={row.original.isEmailVerified ? 'green.600' : 'orange.600'}>
            {row.original.isEmailVerified ? 'Verified' : 'Unverified'}
          </Text>
        ),
        enableSorting: true
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => <Text fontSize="sm">{formatDate(row.original.createdAt)}</Text>,
        enableSorting: true
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        meta: { exportable: false },
        cell: ({ row }) => (
          <HStack spacing={2} justify="flex-end">
            <Tooltip label="View details">
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FiEye />}
                aria-label="View user"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/app/users/${row.original.id}`);
                }}
              />
            </Tooltip>
            <Tooltip label="Delete user">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<FiTrash2 />}
                aria-label="Delete user"
                isLoading={deleteVariables === row.original.id && isDeletePending}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteUser(row.original);
                }}
              />
            </Tooltip>
          </HStack>
        )
      }
    ],
    [navigate, deleteVariables, handleDeleteUser, isDeletePending]
  );

  return (
    <Stack spacing={6}>
      <PageTitle
        title="Users"
        description="Overview of all registered users."
        icon={FiUsers}
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={statusFilter}
        onStatusChange={handleStatusChange}
        statusOptions={statusOptions}
        onReset={handleResetFilters}
        isLoading={isFetching}
      />

      <DataTable
        columns={columns}
        data={tableData}
        total={total}
        page={page}
        pageSize={pageSize}
        pageCount={pageCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={isFetching}
        onExport={handleExport}
        exportFilename="users.csv"
      />
    </Stack>
  );
};

export default UsersPage;
