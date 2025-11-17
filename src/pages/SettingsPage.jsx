import { Card, CardBody, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import PageTitle from '../components/PageTitle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime } from '../utils/format.js';

const SettingsPage = () => {
  const { user } = useAuth();
  const profile = user?.admin ?? {};
  const infoItems = [
    {
      label: 'Full name',
      value: profile.fullname || user?.displayName || '—'
    },
    {
      label: 'Email',
      value: profile.email || user?.email || '—'
    },
    {
      label: 'Phone number',
      value: profile.phoneNumber ? profile.phoneNumber.toString() : '—'
    },
    {
      label: 'Joined on',
      value: profile.createdAt ? formatDateTime(profile.createdAt) : '—'
    },
    {
      label: 'Last updated',
      value: profile.updatedAt ? formatDateTime(profile.updatedAt) : '—'
    }
  ];

  return (
    <Stack spacing={6}>
      <PageTitle
        title="Settings"
        description="Review your account details and update administrative preferences."
        icon={FiSettings}
      />
      <Card borderRadius="2xl">
        <CardBody>
          <Heading size="md" mb={4}>
            Account overview
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {infoItems.map((item) => (
              <Stack key={item.label} spacing={1}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.08em">
                  {item.label}
                </Text>
                <Text fontWeight="semibold">{item.value}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
      <Card borderRadius="2xl">
        <CardBody>
          <Heading size="md" mb={4}>
            Administrative access
          </Heading>
          <Text color="gray.500">
            This console is configured for a single administrator account. Contact the Aatman support
            team if you need to update the account holder or extend access to additional team members.
          </Text>
        </CardBody>
      </Card>
    </Stack>
  );
};

export default SettingsPage;
