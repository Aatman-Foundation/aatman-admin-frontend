import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  GridItem,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Skeleton,
  Stack,
  Tag,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiAward,
  FiBriefcase,
  FiBookOpen,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUserCheck
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle.jsx';
import { getUserById } from '../api/index.js';
import { formatDate } from '../utils/format.js';

const SectionCard = ({ title, icon, description, actions, children }) => {
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');
  const iconBg = useColorModeValue('purple.50', 'whiteAlpha.100');
  return (
    <Card borderRadius="2xl" bg={useColorModeValue('white', 'gray.800')} borderWidth="1px" borderColor={borderColor}>
      <CardHeader display="flex" alignItems="center" justifyContent="space-between" gap={4}>
        <HStack spacing={4} align="flex-start">
          {icon ? (
            <Box
              bg={iconBg}
              borderRadius="lg"
              boxSize={10}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={icon} boxSize={4} color="purple.500" />
            </Box>
          ) : null}
          <Stack spacing={1}>
            <Text fontWeight="semibold">{title}</Text>
            {description ? (
              <Text fontSize="sm" color="gray.500">
                {description}
              </Text>
            ) : null}
          </Stack>
        </HStack>
        {actions || null}
      </CardHeader>
      <CardBody pt={0}>{children}</CardBody>
    </Card>
  );
};

const InfoItem = ({ label, value, icon, tooltip }) => {
  const bg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const iconColor = useColorModeValue('purple.500', 'purple.300');
  const content = (
    <Stack
      spacing={2}
      bg={bg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
      p={3}
      h="full"
    >
      <HStack spacing={2} color="gray.500">
        {icon ? <Icon as={icon} boxSize={4} color={iconColor} /> : null}
        <Text fontSize="xs" textTransform="uppercase">
          {label}
        </Text>
      </HStack>
      <Text fontWeight="medium">{value || '—'}</Text>
    </Stack>
  );

  return tooltip ? <Tooltip label={tooltip}>{content}</Tooltip> : content;
};

const QuickStat = ({ icon, label, value }) => {
  const bg = useColorModeValue('purple.50', 'whiteAlpha.100');
  const border = useColorModeValue('purple.100', 'whiteAlpha.200');
  return (
    <HStack
      spacing={3}
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={border}
      px={4}
      py={3}
      minW="200px"
    >
      <Box
        bg={useColorModeValue('white', 'blackAlpha.400')}
        borderRadius="md"
        boxSize={9}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon as={icon} boxSize={4} color="purple.500" />
      </Box>
      <Stack spacing={1}>
        <Text fontSize="xs" textTransform="uppercase" color="purple.600" _dark={{ color: 'purple.200' }}>
          {label}
        </Text>
        <Text fontWeight="semibold">{value || '—'}</Text>
      </Stack>
    </HStack>
  );
};

const formatAddress = (address = {}) => {
  const parts = [address.houseNo, address.street, address.city, address.state, address.pinCode];
  return parts.filter(Boolean).join(', ') || '—';
};

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return (
      <Stack spacing={6}>
        <Skeleton height="120px" borderRadius="2xl" />
        <Skeleton height="240px" borderRadius="2xl" />
        <Skeleton height="320px" borderRadius="2xl" />
      </Stack>
    );
  }

  if (isError || !data) {
    return (
      <Stack spacing={4}>
        <Button leftIcon={<FiArrowLeft />} variant="ghost" onClick={() => navigate('/app/users')}>
          Back to users
        </Button>
        <Stack
          borderRadius="2xl"
          align="center"
          justify="center"
          spacing={3}
          py={20}
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <Text fontSize="lg" fontWeight="semibold">
            {error?.message || 'Unable to load user'}
          </Text>
          <Text color="gray.500">Please try again or return to the users list.</Text>
        </Stack>
      </Stack>
    );
  }

  const { professionalType = '', profile = {} } = data;
  const {
    fullname,
    personalPhoto,
    emailPrimary,
    phoneNumber,
    personalNationality,
    gender,
    dateOfBirth,
    createdAt,
    updatedAt,
    permanentAddress,
    academicQualifications = {},
    regulatoryDetails = {},
    practiceDetails = {},
    previousExperience = [],
    publicationDetails = [],
    researchInterests = [],
    traningDetails = [],
    digitalSocialPlatform = [],
    digitalSocialHandle = [],
    digitalSocialURL = [],
    consent_infoTrueAndCorrect,
    consent_authorizeDataUse,
    consent_agreeToNotifications,
    consent_timestamp
  } = profile;

  const socialProfiles = digitalSocialPlatform.map((platform, index) => ({
    platform,
    handle: digitalSocialHandle?.[index],
    url: digitalSocialURL?.[index]
  }));

  const locationLabel = permanentAddress?.city || permanentAddress?.state
    ? [permanentAddress?.city, permanentAddress?.state].filter(Boolean).join(', ')
    : '—';

  const quickStats = [
    {
      label: 'Experience',
      value:
        typeof practiceDetails.yearsExperience === 'number'
          ? `${practiceDetails.yearsExperience} yrs`
          : practiceDetails.yearsExperience || '—',
      icon: FiBriefcase
    },
    {
      label: 'Training',
      value: traningDetails.length ? `${traningDetails.length} completed` : 'None yet',
      icon: FiAward
    },
    {
      label: 'Publications',
      value: publicationDetails.length ? `${publicationDetails.length} shared` : 'None yet',
      icon: FiBookOpen
    },
    {
      label: 'Location',
      value: locationLabel,
      icon: FiMapPin
    }
  ];

  const timelineBorderColor = useColorModeValue('purple.200', 'purple.400');

  return (
    <Stack spacing={6}>
      <PageTitle
        title={fullname || 'User details'}
        description="Detailed information fetched from the admin API."
        action={
          <Button leftIcon={<FiArrowLeft />} variant="ghost" onClick={() => navigate('/app/users')}>
            Back to users
          </Button>
        }
      />

      <SectionCard
        title="Profile overview"
        icon={FiUserCheck}
        description="Snapshot of personal details and quick highlights."
        actions={
          professionalType ? (
            <Badge colorScheme="purple" borderRadius="lg" textTransform="capitalize">
              {professionalType.replace(/_/g, ' ')}
            </Badge>
          ) : null
        }
      >
        <Stack direction={{ base: 'column', lg: 'row' }} spacing={6} align="flex-start">
          <Avatar name={fullname} src={personalPhoto} size="2xl" borderRadius="2xl" />
          <Stack spacing={4} flex="1">
            <Stack spacing={1}>
              <Text fontSize="3xl" fontWeight="bold">
                {fullname || '—'}
              </Text>
              <Text color="gray.500">
                Member since {formatDate(createdAt)} · Updated {formatDate(updatedAt)}
              </Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <InfoItem label="Email" value={emailPrimary} icon={FiMail} />
              <InfoItem label="Phone" value={phoneNumber} icon={FiPhone} />
              <InfoItem label="Nationality" value={personalNationality} icon={FiGlobe} />
              <InfoItem label="Gender" value={gender} icon={FiUserCheck} />
              <InfoItem label="Date of birth" value={formatDate(dateOfBirth)} icon={FiBookOpen} />
            </SimpleGrid>
            <Wrap spacing={4}>
              {quickStats.map((stat) => (
                <WrapItem key={stat.label}>
                  <QuickStat {...stat} />
                </WrapItem>
              ))}
            </Wrap>
          </Stack>
        </Stack>
      </SectionCard>

      <Grid templateColumns={{ base: '1fr', xl: '1.6fr 1fr' }} gap={6}>
        <GridItem>
          <Stack spacing={6}>
            <SectionCard
              title="Contact & Address"
              icon={FiPhone}
              description="Ways to reach out and where the practitioner is based."
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem label="Primary email" value={emailPrimary} icon={FiMail} />
                <InfoItem label="Phone number" value={phoneNumber} icon={FiPhone} />
              </SimpleGrid>
              <Divider my={6} />
              <InfoItem
                label="Permanent address"
                value={formatAddress(permanentAddress)}
                icon={FiMapPin}
              />
            </SectionCard>

            <SectionCard
              title="Academic qualifications"
              icon={FiBookOpen}
              description="Formal education and specialisations."
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem
                  label="Undergraduate"
                  value={
                    academicQualifications.ug
                      ? `${academicQualifications.ug.qualification || '—'} · ${
                          academicQualifications.ug.college || '—'
                        } · ${academicQualifications.ug.yearOfPassing || '—'}`
                      : '—'
                  }
                />
                <InfoItem
                  label="Postgraduate"
                  value={
                    academicQualifications.pg
                      ? `${academicQualifications.pg.qualification || '—'} · ${
                          academicQualifications.pg.specialization || academicQualifications.pg.college || '—'
                        } · ${academicQualifications.pg.yearOfPassing || '—'}`
                      : '—'
                  }
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard
              title="Practice details"
              icon={FiBriefcase}
              description="Current work profile and areas of expertise."
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem
                  label="Designation"
                  value={practiceDetails.currentDesignation}
                  icon={FiBriefcase}
                />
                <InfoItem
                  label="Institution"
                  value={practiceDetails.currentInstitution}
                  icon={FiShield}
                />
                <InfoItem
                  label="Work address"
                  value={practiceDetails.workAddress}
                  icon={FiMapPin}
                />
                <InfoItem
                  label="Experience"
                  value={
                    typeof practiceDetails.yearsExperience === 'number'
                      ? `${practiceDetails.yearsExperience} yrs`
                      : practiceDetails.yearsExperience || '—'
                  }
                  icon={FiBriefcase}
                />
              </SimpleGrid>
              {practiceDetails.specializationAreas?.length ? (
                <>
                  <Divider my={6} />
                  <Wrap spacing={2}>
                    {practiceDetails.specializationAreas.map((specialization) => (
                      <WrapItem key={specialization}>
                        <Tag colorScheme="purple" borderRadius="full" px={3} py={1}>
                          {specialization}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Experience history"
              icon={FiBriefcase}
              description="Where the practitioner has contributed previously."
            >
              {previousExperience.length ? (
                <Stack spacing={4}>
                  {previousExperience.map((experience) => (
                    <Stack
                      key={experience._id || experience.designation}
                      spacing={2}
                      pl={4}
                      borderLeftWidth="2px"
                      borderLeftColor={timelineBorderColor}
                    >
                      <Text fontWeight="semibold">
                        {experience.designation || '—'} · {experience.organization || '—'}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(experience.startDate)} – {formatDate(experience.endDate)}
                      </Text>
                      {experience.description ? (
                        <Text fontSize="sm" color="gray.600">
                          {experience.description}
                        </Text>
                      ) : null}
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Text color="gray.500">No experience information provided.</Text>
              )}
            </SectionCard>

            <SectionCard
              title="Publications & research"
              icon={FiBookOpen}
              description="Thought leadership and interests."
            >
              {researchInterests.length ? (
                <Wrap spacing={2} mb={6}>
                  {researchInterests.map((interest) => (
                    <WrapItem key={interest}>
                      <Tag colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1}>
                        {interest}
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              ) : (
                <Text color="gray.500" mb={6}>
                  No research interests listed.
                </Text>
              )}
              {publicationDetails.length ? (
                <Stack spacing={4}>
                  {publicationDetails.map((publication) => (
                    <Stack key={publication._id || publication.title} spacing={1}>
                      <Text fontWeight="medium">{publication.title || '—'}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {publication.journal || '—'} · {publication.year || '—'}
                      </Text>
                      {publication.link ? (
                        <Text fontSize="sm" color="blue.500">
                          {publication.link}
                        </Text>
                      ) : null}
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Text color="gray.500">No publications shared.</Text>
              )}
            </SectionCard>

            <SectionCard
              title="Training"
              icon={FiAward}
              description="Workshops or continuous education programmes attended."
            >
              {traningDetails.length ? (
                <Stack spacing={4}>
                  {traningDetails.map((training) => (
                    <Stack key={training._id || training.traningName} spacing={1}>
                      <Text fontWeight="medium">{training.traningName || '—'}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {training.traningOrganizer || '—'} · {training.traningRole?.join(', ') || '—'}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(training.traningStartDate)} – {formatDate(training.traningEndDate)}
                      </Text>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Text color="gray.500">No training information provided.</Text>
              )}
            </SectionCard>
          </Stack>
        </GridItem>

        <GridItem>
          <Stack spacing={6}>
            <SectionCard
              title="Regulatory details"
              icon={FiShield}
              description="Registration information supplied by the practitioner."
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem
                  label="AYUSH registration no."
                  value={regulatoryDetails.regulatoryAyushRegNo}
                  icon={FiShield}
                />
                <InfoItem
                  label="Council name"
                  value={regulatoryDetails.councilName}
                  icon={FiAward}
                />
                <InfoItem
                  label="Registration date"
                  value={formatDate(regulatoryDetails.registrationDate)}
                  icon={FiBookOpen}
                />
                <InfoItem
                  label="Validity until"
                  value={formatDate(regulatoryDetails.regulatoryValidityUntil)}
                  icon={FiBookOpen}
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard
              title="Social presence"
              icon={FiGlobe}
              description="Where this practitioner engages online."
            >
              {socialProfiles.length ? (
                <Wrap spacing={4}>
                  {socialProfiles.map((profileItem, index) => (
                    <WrapItem key={`${profileItem.platform || 'social'}-${index}`}>
                      <Stack
                        spacing={1}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
                        bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                        px={4}
                        py={3}
                        minW="220px"
                      >
                        <Text fontWeight="medium">{profileItem.platform || '—'}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {profileItem.handle || '—'}
                        </Text>
                        <Link
                          fontSize="sm"
                          color="purple.500"
                          href={profileItem.url || '#'}
                          isExternal
                          pointerEvents={profileItem.url ? 'auto' : 'none'}
                        >
                          {profileItem.url || 'No link'}
                        </Link>
                      </Stack>
                    </WrapItem>
                  ))}
                </Wrap>
              ) : (
                <Text color="gray.500">No social platforms provided.</Text>
              )}
            </SectionCard>

            <SectionCard
              title="Consent"
              icon={FiUserCheck}
              description="Key declarations shared at the time of onboarding."
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <InfoItem
                  label="Information accurate"
                  value={
                    typeof consent_infoTrueAndCorrect === 'boolean'
                      ? consent_infoTrueAndCorrect
                        ? 'Yes'
                        : 'No'
                      : '—'
                  }
                  icon={FiUserCheck}
                />
                <InfoItem
                  label="Authorize data use"
                  value={
                    typeof consent_authorizeDataUse === 'boolean'
                      ? consent_authorizeDataUse
                        ? 'Yes'
                        : 'No'
                      : '—'
                  }
                  icon={FiShield}
                />
                <InfoItem
                  label="Agree to notifications"
                  value={
                    typeof consent_agreeToNotifications === 'boolean'
                      ? consent_agreeToNotifications
                        ? 'Yes'
                        : 'No'
                      : '—'
                  }
                  icon={FiGlobe}
                />
                <InfoItem
                  label="Consent timestamp"
                  value={formatDate(consent_timestamp)}
                  icon={FiBookOpen}
                />
              </SimpleGrid>
            </SectionCard>
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  );
};

export default UserDetailPage;
