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
  InputGroup,
  InputLeftAddon,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { adminRegister } from '../api/auth.js';

const initialFormState = {
  fullname: '',
  email: '',
  phoneNumber: '',
  password: ''
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.fullname || !formData.email || !formData.phoneNumber || !formData.password) {
      toast({ status: 'warning', title: 'All fields are required' });
      return;
    }

    const cleanedPhone = formData.phoneNumber.toString().replace(/\D/g, '');
    if (!cleanedPhone) {
      toast({ status: 'warning', title: 'Enter a valid phone number' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        phoneNumber: Number(cleanedPhone),
        password: formData.password
      };
      const result = await adminRegister(payload);
      toast({
        status: 'success',
        title: 'Registration successful',
        description: result?.message || 'You can now sign in with your credentials.'
      });
      navigate('/login', { replace: true });
    } catch (error) {
      const description = error.response?.data?.message || error.message || 'Registration failed.';
      toast({
        status: 'error',
        title: 'Unable to register',
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
      <Card maxW="lg" w="full" borderRadius="2xl" boxShadow="2xl">
        <CardHeader>
          <Heading size="lg">Create Admin Account</Heading>
          <Text color="gray.500" mt={2}>
            Provide your details to request access to the Aatman Admin Console.
          </Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="fullname" isRequired>
                <FormLabel>Full name</FormLabel>
                <Input
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Shashank Srivastava"
                />
              </FormControl>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info.openocean@gmail.com"
                  autoComplete="email"
                />
              </FormControl>
              <FormControl id="phoneNumber" isRequired>
                <FormLabel>Phone number</FormLabel>
                <InputGroup>
                  <InputLeftAddon>+91</InputLeftAddon>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="8299523424"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </InputGroup>
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </FormControl>
              <Button type="submit" colorScheme="brand" isLoading={isSubmitting}>
                Register
              </Button>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Already have an account?{' '}
                <Text as={RouterLink} to="/login" color="brand.500" fontWeight="semibold">
                  Sign in
                </Text>
              </Text>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default RegisterPage;
