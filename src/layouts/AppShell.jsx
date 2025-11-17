import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spacer,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FiFileText,
  FiHome,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUsers
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', icon: FiHome, to: '/app' },
  { label: 'Users', icon: FiUsers, to: '/app/users' },
  { label: 'Documents', icon: FiFileText, to: '/app/documents' },
  { label: 'Settings', icon: FiSettings, to: '/app/settings' }
];

const SidebarContent = ({ onNavigate }) => {
  const location = useLocation();
  const activeBg = useColorModeValue('white', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  return (
    <VStack align="stretch" spacing={2} py={6} px={4} h="full">
      <HStack spacing={3} px={2} mb={6}>
        <Box bgGradient="linear(to-r, brand.500, purple.500)" w={10} h={10} borderRadius="xl" />
        <Stack spacing={0}>
          <Text fontWeight="bold">Aatman Admin</Text>
          <Text fontSize="xs" color="gray.500">
            Verification Console
          </Text>
        </Stack>
      </HStack>
      <VStack align="stretch" spacing={1} flex={1} overflowY="auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <Flex
              key={item.to}
              as={NavLink}
              to={item.to}
              align="center"
              gap={3}
              px={4}
              py={3}
              borderRadius="xl"
              fontWeight={isActive ? 'semibold' : 'medium'}
              bg={isActive ? activeBg : 'transparent'}
              color={isActive ? activeColor : 'inherit'}
              _hover={{ bg: hoverBg }}
              onClick={onNavigate}
            >
              <Icon as={item.icon} boxSize={5} />
              {item.label}
            </Flex>
          );
        })}
      </VStack>
      <Divider my={4} />
      <Text fontSize="xs" color="gray.500" textAlign="center">
        © {new Date().getFullYear()} Aatman AYUSH Council
      </Text>
    </VStack>
  );
};

const AppShell = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const disclosure = useDisclosure();
  const [globalSearch, setGlobalSearch] = useState('');
  const { user, logout } = useAuth();
  const isDark = colorMode === 'dark';

  const handleSearchChange = (event) => {
    setGlobalSearch(event.target.value);
  };

  return (
    <Flex h="100vh" overflow="hidden" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="280px"
        bg={useColorModeValue('white', 'gray.800')}
        borderRightWidth="1px"
        borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
      >
        <SidebarContent />
      </Box>

      <Drawer placement="left" onClose={disclosure.onClose} isOpen={disclosure.isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerBody>
            <SidebarContent onNavigate={disclosure.onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex={1} overflow="hidden">
        <Flex
          as="header"
          align="center"
          px={{ base: 4, md: 8 }}
          py={4}
          bg={useColorModeValue('white', 'gray.800')}
          borderBottomWidth="1px"
          borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <HStack spacing={3} display={{ base: 'flex', lg: 'none' }}>
            <IconButton
              icon={<FiMenu />}
              aria-label="Open navigation"
              variant="ghost"
              onClick={disclosure.onOpen}
            />
          </HStack>

          <InputGroup maxW="420px" display={{ base: 'none', md: 'flex' }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search users, documents or notes"
              value={globalSearch}
              onChange={handleSearchChange}
              borderRadius="xl"
              bg={useColorModeValue('gray.100', 'gray.700')}
              border="none"
              _focus={{ border: '1px solid', borderColor: 'brand.400', bg: useColorModeValue('white', 'gray.700') }}
            />
          </InputGroup>

          <Spacer />

          <HStack spacing={3}>
            <Tooltip label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
              <IconButton
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                icon={isDark ? <FiSun /> : <FiMoon />}
                variant="ghost"
                borderRadius="full"
              />
            </Tooltip>
            <Divider orientation="vertical" h={8} />
            <HStack spacing={3}>
              <Avatar size="sm" name={user?.displayName || user?.email || ''} />
              <Stack spacing={0} display={{ base: 'none', md: 'flex' }}>
                <Text fontSize="sm" fontWeight="medium">
                  {user?.displayName || user?.email || '—'}
                </Text>
                {user?.email ? (
                  <Text fontSize="xs" color="gray.500">
                    {user.email}
                  </Text>
                ) : null}
              </Stack>
            </HStack>
            <Button variant="outline" size="sm" onClick={logout}>
              Log out
            </Button>
          </HStack>
        </Flex>

        <Box as="main" flex={1} overflowY="auto" px={{ base: 4, md: 8 }} py={6}>
          <Outlet context={{ globalSearch }} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppShell;
