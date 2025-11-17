import { Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';

const PageTitle = ({ title, description, icon, action }) => (
  <HStack justify="space-between" align={{ base: 'flex-start', md: 'center' }} spacing={4} mb={8} flexWrap="wrap">
    <HStack spacing={4} align="center">
      {icon ? <Icon as={icon} boxSize={8} color="brand.500" /> : null}
      <VStack align="flex-start" spacing={1} maxW="2xl">
        <Heading size="lg">{title}</Heading>
        {description ? (
          <Text color="gray.500" fontSize="sm">
            {description}
          </Text>
        ) : null}
      </VStack>
    </HStack>
    {action || null}
  </HStack>
);

export default PageTitle;
