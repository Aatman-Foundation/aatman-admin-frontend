import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { adminLogin } from '../api/auth.js';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email || !formData.password) {
      toast({ status: 'warning', title: 'Email and password are required' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { admin, email, token, message, displayName } = await adminLogin({
        email: formData.email,
        password: formData.password
      });
      login({
        email: email || formData.email,
        token,
        admin,
        displayName: displayName || admin?.fullname || admin?.name || formData.email
      });
      toast({
        status: 'success',
        title: 'Welcome back!',
        description: message
      });
      const redirectTo = location.state?.from?.pathname || '/app';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const description =
        error.response?.data?.message ||
        error.message ||
        'Unable to sign in. Please check your credentials.';
      toast({
        status: 'error',
        title: 'Sign in failed',
        description
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-r, brand.500, purple.500)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Card maxW="md" w="full" borderRadius="2xl" boxShadow="2xl">
        <CardHeader>
          <Heading size="lg">Aatman Admin Console</Heading>
          <Text color="gray.500" mt={2}>
            Sign in with your admin credentials to manage verification workflows.
          </Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </FormControl>
              <Button type="submit" colorScheme="brand" isLoading={isSubmitting}>
                Continue
              </Button>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Need an account?{' '}
                <Text as={RouterLink} to="/register" color="brand.500" fontWeight="semibold">
                  Register
                </Text>
              </Text>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default LoginPage;
