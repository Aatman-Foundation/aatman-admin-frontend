import { useEffect, useState } from 'react';
import { Button, HStack, Icon, Input, InputGroup, InputLeftElement, Select, Stack, useColorModeValue } from '@chakra-ui/react';
import { FiFilter, FiSearch } from 'react-icons/fi';

const FilterBar = ({
  search,
  onSearchChange,
  status = 'ALL',
  onStatusChange,
  statusOptions = [],
  isLoading,
  onReset
}) => {
  const [localSearch, setLocalSearch] = useState(search || '');

  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange?.(localSearch);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [localSearch, onSearchChange, search]);

  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      spacing={4}
      align="stretch"
      justify="space-between"
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="2xl"
      px={6}
      py={4}
      boxShadow="subtle"
    >
      <InputGroup maxW={{ base: 'full', lg: '320px' }}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Search by email or phone number"
          borderRadius="xl"
        />
      </InputGroup>

      <HStack spacing={3} flexWrap="wrap">
        <Select
          value={status || 'ALL'}
          onChange={(event) => onStatusChange?.(event.target.value)}
          maxW="220px"
        >
          <option value="ALL">All Users</option>
          {statusOptions.map((statusValue) => (
            <option key={statusValue} value={statusValue}>
              {statusValue.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
      </HStack>

      <HStack spacing={3} justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <Button
          onClick={() => onReset?.()}
          leftIcon={<Icon as={FiFilter} />}
          variant="ghost"
          isDisabled={isLoading}
        >
          Reset filters
        </Button>
      </HStack>
    </Stack>
  );
};

export default FilterBar;
