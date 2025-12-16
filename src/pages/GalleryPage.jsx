import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FiImage } from 'react-icons/fi';
import PageTitle from '../components/PageTitle.jsx';
import {
  addGalleryItem,
  listGalleryItems,
  updateGalleryItem,
  deleteGalleryItem
} from '../api/index.js';

const initialForm = {
  title: '',
  imageUrl: '',
  description: '',
  category: 'Events'
};

const GalleryPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [editFormData, setEditFormData] = useState(initialForm);
  const [editFileName, setEditFileName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const listCardBg = useColorModeValue('gray.50', 'gray.700');
  const queryClient = useQueryClient();

  const { data: gallery = [], isLoading } = useQuery({
    queryKey: ['gallery-items'],
    queryFn: listGalleryItems
  });

  const { mutate: mutateGallery, isPending } = useMutation({
    mutationFn: addGalleryItem,
    onSuccess: () => {
      toast({ status: 'success', title: 'Gallery item added' });
      setFormData(initialForm);
      setSelectedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
    },
    onError: (error) =>
      toast({
        status: 'error',
        title: 'Unable to add item',
        description: error.message
      })
  });

  const { mutate: mutateUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }) => updateGalleryItem({ id, ...payload }),
    onSuccess: () => {
      toast({ status: 'success', title: 'Gallery item updated' });
      setEditingId(null);
      setEditFormData(initialForm);
      setEditFileName('');
      if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
      }
      queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
    },
    onError: (error) =>
      toast({
        status: 'error',
        title: 'Unable to update item',
        description: error.message
      })
  });

  const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      toast({ status: 'success', title: 'Gallery item deleted' });
      queryClient.invalidateQueries({ queryKey: ['gallery-items'] });
    },
    onError: (error) =>
      toast({
        status: 'error',
        title: 'Unable to delete item',
        description: error.message
      })
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast({ status: 'warning', title: 'Title and image are required' });
      return;
    }
    mutateGallery(formData);
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        toast({ status: 'error', title: 'Unable to read file' });
        return;
      }
      setFormData((prev) => ({ ...prev, imageUrl: result }));
      setSelectedFileName(file.name);
    };
    reader.onerror = () => {
      toast({ status: 'error', title: 'Failed to load image file' });
    };
    reader.readAsDataURL(file);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFilePick = () => {
    editFileInputRef.current?.click();
  };

  const handleEditFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        toast({ status: 'error', title: 'Unable to read file' });
        return;
      }
      setEditFormData((prev) => ({ ...prev, imageUrl: result }));
      setEditFileName(file.name);
    };
    reader.onerror = () => {
      toast({ status: 'error', title: 'Failed to load image file' });
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditFormData({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      description: item.description || '',
      category: item.category || 'General'
    });
    setEditFileName('');
    setTabIndex(1);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingId) return;
    if (!editFormData.title.trim() || !editFormData.imageUrl.trim()) {
      toast({ status: 'warning', title: 'Title and image are required' });
      return;
    }
    mutateUpdate({
      id: editingId,
      payload: editFormData
    });
  };

  const handleDelete = (id) => {
    if (!id) return;
    const confirmed = window.confirm('Delete this gallery item?');
    if (!confirmed) return;
    setDeleteId(id);
    mutateDelete(id, {
      onSettled: () => setDeleteId(null)
    });
  };

  return (
    <Stack spacing={6}>
      <PageTitle
        title="Gallery"
        description="Add highlight images and keep a visual log of activities."
        icon={FiImage}
      />

      <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="brand">
        <TabList>
          <Tab>Create</Tab>
          <Tab>Manage</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Card borderRadius="2xl" bg={cardBg}>
              <CardHeader pb={0}>
                <Text fontWeight="semibold">Add gallery item</Text>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input name="title" value={formData.title} onChange={handleChange} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Image</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        display="none"
                      />
                      <Button onClick={handleFilePick} variant="outline">
                        {selectedFileName ? 'Change image' : 'Upload image'}
                      </Button>
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        {selectedFileName || 'No file selected'}
                      </Text>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Category</FormLabel>
                      <Select name="category" value={formData.category} onChange={handleChange}>
                        <option value="Events">Events</option>
                        <option value="Training">Training</option>
                        <option value="Press">Press</option>
                        <option value="Community">Community</option>
                        <option value="General">General</option>
                      </Select>
                    </FormControl>
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  <Button type="submit" colorScheme="brand" mt={6} isLoading={isPending}>
                    Add to gallery
                  </Button>
                </form>
              </CardBody>
            </Card>
          </TabPanel>
          <TabPanel px={0}>
            <Stack spacing={4}>
              {editingId ? (
                <Card borderRadius="2xl" bg={cardBg}>
                  <CardHeader pb={0}>
                    <Text fontWeight="semibold">Edit gallery item</Text>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleEditSubmit}>
                      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
                        <FormControl isRequired>
                          <FormLabel>Title</FormLabel>
                          <Input name="title" value={editFormData.title} onChange={handleEditChange} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Image</FormLabel>
                          <Input
                            type="file"
                            accept="image/*"
                            ref={editFileInputRef}
                            onChange={handleEditFileChange}
                            display="none"
                          />
                          <Button onClick={handleEditFilePick} variant="outline">
                            {editFileName ? 'Change image' : 'Upload image'}
                          </Button>
                          <Text fontSize="sm" color="gray.500" mt={2}>
                            {editFileName || 'Using current image'}
                          </Text>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Category</FormLabel>
                          <Select name="category" value={editFormData.category} onChange={handleEditChange}>
                            <option value="Events">Events</option>
                            <option value="Training">Training</option>
                            <option value="Press">Press</option>
                            <option value="Community">Community</option>
                            <option value="General">General</option>
                          </Select>
                        </FormControl>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditChange}
                              rows={3}
                            />
                          </FormControl>
                        </GridItem>
                      </Grid>
                      <Stack direction="row" spacing={3} mt={6}>
                        <Button type="submit" colorScheme="brand" isLoading={isUpdating}>
                          Save changes
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditFormData(initialForm);
                            setEditFileName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </form>
                  </CardBody>
                </Card>
              ) : null}

              <Card borderRadius="2xl" bg={cardBg}>
                <CardHeader pb={0}>
                  <Text fontWeight="semibold">All uploads</Text>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Text color="gray.500">Loading gallery...</Text>
                  ) : gallery.length ? (
                    <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={4}>
                      {gallery.map((item) => (
                        <Box key={item.id} bg={listCardBg} borderRadius="xl" overflow="hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            h="180px"
                            w="full"
                            objectFit="cover"
                            fallbackSrc="https://via.placeholder.com/600x400?text=Gallery"
                          />
                          <Box p={4}>
                            <Stack spacing={2}>
                              <Text fontWeight="semibold">{item.title}</Text>
                              {item.description ? (
                                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                                  {item.description}
                                </Text>
                              ) : null}
                              <Stack direction="row" spacing={3}>
                                <Button size="sm" onClick={() => startEdit(item)} variant="outline">
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  isLoading={deleteId === item.id && isDeleting}
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        </Box>
                      ))}
                    </Grid>
                  ) : (
                    <Text color="gray.500">No gallery items found.</Text>
                  )}
                </CardBody>
              </Card>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default GalleryPage;
