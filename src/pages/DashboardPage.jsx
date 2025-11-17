import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardBody,
  Grid,
  GridItem,
  HStack,
  Icon,
  Progress,
  Spinner,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FiUsers, FiCheckCircle, FiAlertTriangle, FiUserCheck, FiUserMinus } from 'react-icons/fi';
import PageTitle from '../components/PageTitle.jsx';
import { getDashboardMetrics } from '../api/index.js';
import { formatDateTime, formatCount } from '../utils/format.js';

const MetricCard = ({ icon, title, value, subtitle, color }) => (
  <Card borderRadius="2xl" bg={useColorModeValue('white', 'gray.800')}>
    <CardBody>
      <HStack align="start" spacing={4}>
        <Box
          w={12}
          h={12}
          borderRadius="xl"
          bg={useColorModeValue(`${color}.100`, 'whiteAlpha.100')}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
        </Box>
        <Stack spacing={1} flex={1}>
          <Text fontSize="sm" color="gray.500">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="semibold">
            {value}
          </Text>
          {subtitle ? (
            <Text fontSize="xs" color="gray.400">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
      </HStack>
    </CardBody>
  </Card>
);

const defaultStatusCounts = { PENDING: 0, UNDER_REVIEW: 0, VERIFIED: 0, REJECTED: 0 };

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics
  });
  const dashboardCardBg = useColorModeValue('white', 'gray.800');

  const totalUsers = data?.totalUsers ?? 0;
  const statusCounts = {
    ...defaultStatusCounts,
    ...(data?.statusCounts ?? {})
  };
  const nonVerifiedUsers =
    data?.nonVerifiedUsers ??
    statusCounts.PENDING + statusCounts.UNDER_REVIEW + statusCounts.REJECTED;
  const percentOfTotal = (value) => (totalUsers ? Math.round(((value ?? 0) / totalUsers) * 100) : 0);

  const cards = data
    ? [
        {
          icon: FiUsers,
          title: 'Total Practitioners',
          value: formatCount(totalUsers),
          subtitle: `Updated ${formatDateTime(data.updatedAt)}`,
          color: 'brand'
        },
        {
          icon: FiCheckCircle,
          title: 'Verified',
          value: formatCount(statusCounts.VERIFIED),
          subtitle: `${percentOfTotal(statusCounts.VERIFIED)}% of total`,
          color: 'green'
        },
        {
          icon: FiUserCheck,
          title: 'Medical Professionals',
          value: formatCount(data.medicalProfessionals),
          subtitle: `${percentOfTotal(data.medicalProfessionals)}% of practitioners`,
          color: 'teal'
        },
        {
          icon: FiUserMinus,
          title: 'Non Medical Professionals',
          value: formatCount(data.nonMedicalProfessionals),
          subtitle: `${percentOfTotal(data.nonMedicalProfessionals)}% of practitioners`,
          color: 'purple'
        },
        {
          icon: FiAlertTriangle,
          title: 'Non Verified Users',
          value: formatCount(nonVerifiedUsers),
          subtitle: `${formatCount(nonVerifiedUsers)} awaiting verification`,
          color: 'orange'
        }
      ]
    : [];

  return (
    <Stack spacing={8}>
      <PageTitle
        title="Dashboard"
        description="Monitor verification progress and outstanding actions."
        icon={FiUsers}
      />
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={24}>
          <Spinner size="xl" thickness="6px" speed="0.6s" />
        </Box>
      ) : (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={6}>
          {cards.map((card) => (
            <GridItem key={card.title}>
              <MetricCard {...card} />
            </GridItem>
          ))}
        </Grid>
      )}

      {data ? (
        <Card borderRadius="2xl" overflow="hidden" bg={dashboardCardBg}>
          <CardBody>
            <Stack spacing={8}>
              {[
                {
                  title: 'Professional Mix',
                  items: [
                    {
                      label: 'Medical Professionals',
                      count: data.medicalProfessionals,
                      colorScheme: 'teal'
                    },
                    {
                      label: 'Non Medical Professionals',
                      count: data.nonMedicalProfessionals,
                      colorScheme: 'purple'
                    }
                  ]
                },
                {
                  title: 'Verification Status',
                  items: [
                    {
                      label: 'Verified Users',
                      count: statusCounts.VERIFIED,
                      colorScheme: 'green'
                    },
                    {
                      label: 'Non Verified Users',
                      count: nonVerifiedUsers,
                      colorScheme: 'orange'
                    }
                  ]
                }
              ].map((section) => (
                <Stack key={section.title} spacing={3}>
                  <Text fontWeight="semibold">{section.title}</Text>
                  {section.items.map((item) => {
                    const percent = percentOfTotal(item.count);
                    return (
                      <Stack key={item.label} spacing={1}>
                        <HStack justify="space-between">
                          <Text fontSize="sm">{item.label}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatCount(item.count)} ({percent}%)
                          </Text>
                        </HStack>
                        <Progress value={percent} borderRadius="full" colorScheme={item.colorScheme} />
                      </Stack>
                    );
                  })}
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      ) : null}
    </Stack>
  );
};

export default DashboardPage;
