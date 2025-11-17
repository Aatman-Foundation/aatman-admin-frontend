import { Badge } from '@chakra-ui/react';

const statusMeta = {
  PENDING: { color: 'orange', label: 'Pending' },
  UNDER_REVIEW: { color: 'yellow', label: 'Under Review' },
  VERIFIED: { color: 'green', label: 'Verified' },
  REJECTED: { color: 'red', label: 'Rejected' }
};

const StatusPill = ({ status, ...rest }) => {
  const meta = statusMeta[status] || { color: 'gray', label: status };
  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      fontSize="sm"
      variant="subtle"
      colorScheme={meta.color}
      textTransform="capitalize"
      {...rest}
    >
      {meta.label}
    </Badge>
  );
};

export default StatusPill;
