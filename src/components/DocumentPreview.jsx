import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Image,
  Box,
  Text,
  Stack
} from '@chakra-ui/react';
import { formatDateTime } from '../utils/format.js';

const DocumentPreview = ({ document, isOpen, onClose }) => {
  if (!document) return null;
  const isPdf = document.url?.toLowerCase().includes('.pdf');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader>{document.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={4}>
            <Text fontSize="sm" color="gray.500">
              Uploaded {formatDateTime(document.uploadedAt)} • Status: {document.verifiedStatus}
            </Text>
            <Box borderRadius="xl" overflow="hidden" borderWidth="1px" h="480px">
              {isPdf ? (
                <iframe
                  src={document.url}
                  title={document.name}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              ) : (
                <Image src={document.url} alt={document.name} objectFit="contain" w="full" h="full" />
              )}
            </Box>
            {document.notes ? (
              <Box p={4} borderRadius="xl" bg="gray.50" _dark={{ bg: 'gray.700' }}>
                <Text fontSize="sm">Notes: {document.notes}</Text>
              </Box>
            ) : null}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DocumentPreview;
