import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Icon,
  Image,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FiEye } from 'react-icons/fi';
import { formatDateTime } from '../utils/format.js';

const statusColor = {
  UNVERIFIED: 'orange',
  VERIFIED: 'green',
  REJECTED: 'red'
};

const DocumentCard = ({ document, onPreview, onVerify, onReject, isProcessing }) => {
  const isPdf = document.url?.toLowerCase().endsWith('.pdf');
  const previewSrc = isPdf
    ? 'https://images.unsplash.com/photo-1588345921523-3825a0e8d126?auto=format&fit=crop&w=600&q=80'
    : document.url;

  const showActions = document.verifiedStatus !== 'VERIFIED';

  return (
    <Card variant="outline" borderRadius="2xl" bg={useColorModeValue('white', 'gray.800')}>
      <CardHeader pb={0}>
        <Stack spacing={2}>
          <HStack justify="space-between" align="center">
            <Text fontWeight="semibold">{document.name}</Text>
            <Badge colorScheme={statusColor[document.verifiedStatus] || 'gray'} borderRadius="full" px={3} py={1}>
              {document.verifiedStatus}
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Uploaded {formatDateTime(document.uploadedAt)}
          </Text>
        </Stack>
      </CardHeader>
      <CardBody>
        <Box
          borderRadius="xl"
          overflow="hidden"
          h="180px"
          bg={useColorModeValue('gray.100', 'gray.700')}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {isPdf ? (
            <Stack spacing={1} align="center">
              <Icon as={FiEye} boxSize={10} color="brand.400" />
              <Text fontSize="sm">PDF Document</Text>
            </Stack>
          ) : (
            <Image src={previewSrc} alt={document.name} objectFit="cover" w="full" h="full" />
          )}
        </Box>
        {document.notes ? (
          <Text fontSize="sm" color="gray.600" mt={3}>
            Notes: {document.notes}
          </Text>
        ) : null}
      </CardBody>
      <CardFooter justify="space-between" align="center" pt={0}>
        <Button variant="ghost" size="sm" leftIcon={<FiEye />} onClick={() => onPreview?.(document)}>
          Preview
        </Button>
        {showActions ? (
          <ButtonGroup size="sm" variant="outline">
            <Button onClick={() => onVerify?.(document)} isLoading={isProcessing}>
              Verify
            </Button>
            <Button colorScheme="red" onClick={() => onReject?.(document)} isLoading={isProcessing}>
              Reject
            </Button>
          </ButtonGroup>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
