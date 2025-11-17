import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  FormControl,
  FormLabel,
  Textarea
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

const DocumentActionDialog = ({
  title,
  description,
  isOpen,
  onClose,
  onConfirm,
  confirmLabel,
  isLoading
}) => {
  const cancelRef = useRef();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNote('');
    }
  }, [isOpen]);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>
            {description}
            <FormControl mt={4}>
              <FormLabel fontSize="sm">Add note (optional)</FormLabel>
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
            </FormControl>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={() => onConfirm(note)} ml={3} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DocumentActionDialog;
