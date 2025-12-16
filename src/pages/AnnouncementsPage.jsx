import { useState } from 'react';
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
  Stack,
  Text,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';
import PageTitle from '../components/PageTitle.jsx';
import {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from '../api/index.js';

const initialForm = {
  title: '',
  message: '',
  audience: '',
  link: '',
  scheduledFor: ''
};

const AnnouncementsPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const listCardBg = useColorModeValue('gray.50', 'gray.700');
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: listAnnouncements
  });

  const { mutate: mutateAnnouncement, isPending } = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      toast({ status: 'success', title: 'Announcement created' });
      setFormData(initialForm);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) => {
      toast({
        status: 'error',
        title: 'Unable to create announcement',
        description: error.message
      });
    }
  });

  const { mutate: mutateUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }) => updateAnnouncement(id, payload),
    onSuccess: () => {
      toast({ status: 'success', title: 'Announcement updated' });
      setEditingId(null);
      setEditFormData(initialForm);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) =>
      toast({
        status: 'error',
        title: 'Unable to update announcement',
        description: error.message
      })
  });

  const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast({ status: 'success', title: 'Announcement deleted' });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (error) =>
      toast({
        status: 'error',
        title: 'Unable to delete announcement',
        description: error.message
      })
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({ status: 'warning', title: 'Title and message are required' });
      return;
    }
    mutateAnnouncement({
      ...formData,
      scheduledFor: formData.scheduledFor ? formData.scheduledFor : null
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (announcement) => {
    setEditingId(announcement.id);
    setEditFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      audience: announcement.audience || '',
      link: announcement.link || '',
      scheduledFor: announcement.scheduledFor ? announcement.scheduledFor.slice(0, 16) : ''
    });
    setTabIndex(1);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingId) return;
    if (!editFormData.title.trim() || !editFormData.message.trim()) {
      toast({ status: 'warning', title: 'Title and message are required' });
      return;
    }
    mutateUpdate({
      id: editingId,
      payload: {
        ...editFormData,
        scheduledFor: editFormData.scheduledFor ? editFormData.scheduledFor : null
      }
    });
  };

  const handleDelete = (id) => {
    if (!id) return;
    const confirmed = window.confirm('Delete this announcement?');
    if (!confirmed) return;
    setDeleteId(id);
    mutateDelete(id, {
      onSettled: () => setDeleteId(null)
    });
  };

  return (
    <Stack spacing={6}>
      <PageTitle
        title="Announcements"
        description="Create updates for admins and manage published items."
        icon={FiBell}
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
                <Text fontWeight="semibold">New announcement</Text>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input name="title" value={formData.title} onChange={handleChange} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Audience</FormLabel>
                      <Input
                        name="audience"
                        placeholder="All admins"
                        value={formData.audience}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                      <FormControl isRequired>
                        <FormLabel>Message</FormLabel>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={4}
                        />
                      </FormControl>
                    </GridItem>
                    <FormControl>
                      <FormLabel>Reference link</FormLabel>
                      <Input
                        name="link"
                        placeholder="https://example.com/documents"
                        value={formData.link}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Schedule (optional)</FormLabel>
                      <Input
                        type="datetime-local"
                        name="scheduledFor"
                        value={formData.scheduledFor}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </Grid>
                  <Button type="submit" colorScheme="brand" mt={6} isLoading={isPending}>
                    Publish announcement
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
                    <Text fontWeight="semibold">Edit announcement</Text>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleEditSubmit}>
                      <Grid
                        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
                        gap={6}
                      >
                        <FormControl isRequired>
                          <FormLabel>Title</FormLabel>
                          <Input name="title" value={editFormData.title} onChange={handleEditChange} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Audience</FormLabel>
                          <Input
                            name="audience"
                            value={editFormData.audience}
                            onChange={handleEditChange}
                          />
                        </FormControl>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <FormControl isRequired>
                            <FormLabel>Message</FormLabel>
                            <Textarea
                              name="message"
                              value={editFormData.message}
                              onChange={handleEditChange}
                              rows={4}
                            />
                          </FormControl>
                        </GridItem>
                        <FormControl>
                          <FormLabel>Reference link</FormLabel>
                          <Input
                            name="link"
                            value={editFormData.link}
                            onChange={handleEditChange}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Schedule (optional)</FormLabel>
                          <Input
                            type="datetime-local"
                            name="scheduledFor"
                            value={editFormData.scheduledFor}
                            onChange={handleEditChange}
                          />
                        </FormControl>
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
                  <Text fontWeight="semibold">All announcements</Text>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Text color="gray.500">Loading announcements...</Text>
                  ) : announcements.length ? (
                    <Stack spacing={3}>
                      {announcements.map((announcement) => (
                        <Box key={announcement.id} bg={listCardBg} borderRadius="xl" p={4}>
                          <Stack spacing={2}>
                            <Text fontWeight="semibold">{announcement.title}</Text>
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                              {announcement.message}
                            </Text>
                            <Stack direction="row" spacing={3}>
                              <Button size="sm" onClick={() => startEdit(announcement)} variant="outline">
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                isLoading={deleteId === announcement.id && isDeleting}
                                onClick={() => handleDelete(announcement.id)}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="gray.500">No announcements found.</Text>
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

export default AnnouncementsPage;
