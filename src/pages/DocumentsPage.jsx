import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FiFileText, FiFilter, FiSearch } from 'react-icons/fi';
import PageTitle from '../components/PageTitle.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import DocumentPreview from '../components/DocumentPreview.jsx';
import DocumentActionDialog from '../components/DocumentActionDialog.jsx';
import { DOC_STATUSES, DOC_TYPES } from '../utils/constants.js';
import { listDocuments, verifyDocument, rejectDocument } from '../api/index.js';

const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [selectedDocument, setSelectedDocument] = useState(null);
  const previewDisclosure = useDisclosure();
  const actionDisclosure = useDisclosure();
  const [documentAction, setDocumentAction] = useState(null);

  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '12');
  const type = searchParams.get('type') || 'ALL';
  const status = searchParams.get('status') || 'ALL';
  const search = searchParams.get('search') || '';

  const queryParams = useMemo(
    () => ({ page, pageSize, type, status, search }),
    [page, pageSize, type, status, search]
  );

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['documents', queryParams],
    queryFn: () =>
      listDocuments({
        page,
        pageSize,
        type: type !== 'ALL' ? type : undefined,
        status: status !== 'ALL' ? status : undefined,
        search
      }),
    keepPreviousData: true
  });

  const { mutate: mutateDocument, isLoading: isUpdating } = useMutation({
    mutationFn: ({ action, docId, note }) =>
      action === 'VERIFY' ? verifyDocument({ docId, note }) : rejectDocument({ docId, note }),
    onMutate: async ({ action, docId, note, userId }) => {
      const nextStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
      const key = ['documents', queryParams];
      await queryClient.cancelQueries({ queryKey: key });
      const previousDocs = queryClient.getQueryData(key);
      if (previousDocs) {
        queryClient.setQueryData(key, {
          ...previousDocs,
          data: previousDocs.data.map((doc) =>
            doc.id === docId ? { ...doc, verifiedStatus: nextStatus, notes: note || doc.notes } : doc
          )
        });
      }
      if (userId) {
        const userKey = ['user', userId];
        const previousUser = queryClient.getQueryData(userKey);
        if (previousUser) {
          queryClient.setQueryData(userKey, {
            ...previousUser,
            documents: previousUser.documents.map((doc) =>
              doc.id === docId ? { ...doc, verifiedStatus: nextStatus, notes: note || doc.notes } : doc
            )
          });
        }
        return { previousDocs, key, userKey, previousUser };
      }
      return { previousDocs, key };
    },
    onError: (error, _variables, context) => {
      if (context?.key && context.previousDocs) {
        queryClient.setQueryData(context.key, context.previousDocs);
      }
      if (context?.userKey && context.previousUser) {
        queryClient.setQueryData(context.userKey, context.previousUser);
      }
      toast({ status: 'error', title: 'Document update failed', description: error.message });
    },
    onSuccess: (result) => {
      if (result?.user) {
        queryClient.setQueryData(['user', result.user.id], result.user);
      }
      toast({ status: 'success', title: 'Document updated' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const documents = data?.data ?? [];
  const pageCount = data?.totalPages ?? 1;

  const updateSearchParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'ALL') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const openPreview = (document) => {
    setSelectedDocument(document);
    previewDisclosure.onOpen();
  };

  const openAction = (action, document) => {
    setDocumentAction({ action, document });
    actionDisclosure.onOpen();
  };

  const handleConfirmAction = (note) => {
    if (!documentAction) return;
    mutateDocument({
      action: documentAction.action,
      docId: documentAction.document.id,
      note,
      userId: documentAction.document.userId
    });
    actionDisclosure.onClose();
    setDocumentAction(null);
  };

  return (
    <Stack spacing={6}>
      <PageTitle
        title="Documents"
        description="Review and verify practitioner documents across the platform."
        icon={FiFileText}
      />

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        bg="white"
        _dark={{ bg: 'gray.800' }}
        borderRadius="2xl"
        px={6}
        py={4}
        align="center"
      >
        <InputGroup maxW={{ base: 'full', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search documents or practitioners"
            value={search}
            onChange={(event) => updateSearchParams({ search: event.target.value })}
          />
        </InputGroup>
        <Select
          value={type}
          onChange={(event) => updateSearchParams({ type: event.target.value })}
          maxW="200px"
        >
          <option value="ALL">All types</option>
          {DOC_TYPES.map((typeValue) => (
            <option key={typeValue} value={typeValue}>
              {typeValue.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => updateSearchParams({ status: event.target.value })}
          maxW="200px"
        >
          <option value="ALL">All statuses</option>
          {DOC_STATUSES.map((statusValue) => (
            <option key={statusValue} value={statusValue}>
              {statusValue}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          leftIcon={<FiFilter />}
          onClick={() => setSearchParams(new URLSearchParams({ page: '1', pageSize: String(pageSize) }))}
        >
          Reset
        </Button>
      </Stack>

      {isLoading ? (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height="280px" borderRadius="2xl" />
          ))}
        </Grid>
      ) : documents.length ? (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }} gap={6}>
          {documents.map((document) => (
            <GridItem key={document.id}>
              <DocumentCard
                document={document}
                onPreview={openPreview}
                onVerify={(doc) => openAction('VERIFY', doc)}
                onReject={(doc) => openAction('REJECT', doc)}
                isProcessing={isUpdating}
              />
              <Text fontSize="sm" color="gray.500" mt={2}>
                {document.userName}
              </Text>
            </GridItem>
          ))}
        </Grid>
      ) : (
        <Box
          borderRadius="2xl"
          bg="white"
          _dark={{ bg: 'gray.800' }}
          py={16}
          textAlign="center"
        >
          <Text fontWeight="semibold">No documents match the current filters.</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Adjust the filters or reset to view all submissions.
          </Text>
        </Box>
      )}

      <HStack justify="space-between">
        <Button
          variant="ghost"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', String(Math.max(page - 1, 1)));
            setSearchParams(params);
          }}
          isDisabled={page <= 1}
        >
          Previous
        </Button>
        <Text fontSize="sm" color="gray.500">
          Page {page} of {pageCount}
        </Text>
        <Button
          variant="ghost"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', String(Math.min(page + 1, pageCount)));
            setSearchParams(params);
          }}
          isDisabled={page >= pageCount}
        >
          Next
        </Button>
      </HStack>

      <DocumentPreview
        document={selectedDocument}
        isOpen={previewDisclosure.isOpen}
        onClose={previewDisclosure.onClose}
      />

      <DocumentActionDialog
        title={`${documentAction?.action === 'VERIFY' ? 'Verify' : 'Reject'} document`}
        description={`Add a note for ${documentAction?.document?.name ?? 'this document'}.`}
        isOpen={actionDisclosure.isOpen}
        onClose={() => {
          actionDisclosure.onClose();
          setDocumentAction(null);
        }}
        onConfirm={handleConfirmAction}
        confirmLabel={documentAction?.action === 'VERIFY' ? 'Verify' : 'Reject'}
        isLoading={isUpdating}
      />
    </Stack>
  );
};

export default DocumentsPage;
