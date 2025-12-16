import apiClient from './client.js';
import { seedUsers } from '../data/seed.js';


const delay = (ms = 240) => new Promise((resolve) => setTimeout(resolve, ms));
const USER_STATS_ENDPOINT = '/api/v1/admin/get-user-stats';
const USERS_ENDPOINT = '/api/v1/admin/get-all-users';
const DEFAULT_STATUS_COUNTS = { PENDING: 0, UNDER_REVIEW: 0, VERIFIED: 0, REJECTED: 0 };

const generateId = (prefix = 'user') => {
  try {
    const cryptoRef = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
    if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
      return cryptoRef.randomUUID();
    }
  } catch {
    // ignore and fall back to manual id generation
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const cloneUser = (user) => ({
  ...user,
  personal: { ...user.personal },
  contact: {
    ...user.contact,
    permanentAddress: { ...user.contact.permanentAddress },
    correspondenceAddress: { ...user.contact.correspondenceAddress }
  },
  qualifications: {
    ...user.qualifications,
    ug: { ...user.qualifications.ug },
    pg: user.qualifications.pg ? { ...user.qualifications.pg } : undefined,
    phd: user.qualifications.phd ? { ...user.qualifications.phd } : undefined,
    certifications: user.qualifications.certifications
      ? user.qualifications.certifications.map((cert) => ({ ...cert }))
      : []
  },
  regulatory: { ...user.regulatory },
  documents: user.documents.map((doc) => ({ ...doc })),
  audit: user.audit.map((entry) => ({ ...entry }))
});

let users = seedUsers.map((user) => cloneUser(user));
const announcementSeeds = [
  {
    id: 'announcement-1',
    title: 'Scheduled maintenance tonight',
    message: 'Verification console will undergo maintenance from 11 PM to 12 AM. Submissions remain safe.',
    status: 'SCHEDULED',
    audience: 'All admins',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    scheduledFor: new Date(Date.now() + 3600000 * 5).toISOString()
  },
  {
    id: 'announcement-2',
    title: 'New verification checklist',
    message: 'Updated checklist for AYUSH practitioner documents is now available in the knowledge base.',
    status: 'PUBLISHED',
    audience: 'Verification team',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  }
];

const gallerySeeds = [
  {
    id: 'gallery-1',
    title: 'Community wellness camp',
    description: 'Aatman volunteers conducting free check-ups and awareness sessions.',
    category: 'Events',
    imageUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'gallery-2',
    title: 'Training workshop',
    description: 'New verifiers learning the latest onboarding SOPs.',
    category: 'Training',
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

let announcements = [...announcementSeeds];
let galleryItems = [...gallerySeeds];

const buildDocumentIndex = () =>
  users.flatMap((user) =>
    user.documents.map((doc) => ({
      ...doc,
      userId: user.id,
      userName: user.personal.fullName
    }))
  );

const mapUserStatsResponse = (payload = {}) => {
  const totalUsers = payload.user?.total ?? 0;
  const verifiedUsers = payload.user?.verified ?? 0;
  const unverifiedUsers = payload.user?.unverified ?? 0;
  const medicalProfessionals = payload.profile?.medical ?? 0;
  const nonMedicalProfessionals = payload.profile?.nonMedical ?? 0;

  return {
    totalUsers,
    statusCounts: {
      ...DEFAULT_STATUS_COUNTS,
      VERIFIED: verifiedUsers,
      PENDING: unverifiedUsers
    },
    medicalProfessionals,
    nonMedicalProfessionals,
    nonVerifiedUsers: unverifiedUsers,
    documentsPending: 0,
    documentsFlagged: 0,
    updatedAt: new Date().toISOString()
  };
};

const normalizeRemoteUser = (item = {}) => {
  const id = item._id || item.id || item.email || generateId();
  const createdAt = item.createdAt || item.updatedAt || new Date().toISOString();
  const phoneNumber =
    item.phoneNumber != null && item.phoneNumber !== ''
      ? String(item.phoneNumber)
      : item.contact?.mobileNumber || '';
  const email = item.email || item.contact?.emailPrimary || '';
  const fullname = item.fullname || item.personal?.fullName || '';
  const isEmailVerified =
    typeof item.isEmailVerified === 'boolean'
      ? item.isEmailVerified
      : item.status
      ? item.status === 'VERIFIED'
      : false;

  return {
    id,
    fullname,
    email,
    phoneNumber,
    isEmailVerified,
    createdAt,
    role: item.role || '',
    registeredAs: item.registeredAs || '',
    status: isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'
  };
};

const buildLocalDashboardMetrics = () => {
  const totalUsers = users.length;
  const totals = users.reduce(
    (acc, user) => {
      acc.statusCounts[user.status] = (acc.statusCounts[user.status] || 0) + 1;
      if (user.qualifications?.pg) {
        acc.medicalProfessionals += 1;
      } else {
        acc.nonMedicalProfessionals += 1;
      }
      if (user.status !== 'VERIFIED') {
        acc.nonVerifiedUsers += 1;
      }
      return acc;
    },
    {
      statusCounts: { ...DEFAULT_STATUS_COUNTS },
      medicalProfessionals: 0,
      nonMedicalProfessionals: 0,
      nonVerifiedUsers: 0
    }
  );
  const docs = buildDocumentIndex();
  const documentsPending = docs.filter((doc) => doc.verifiedStatus === 'UNVERIFIED').length;
  const documentsFlagged = docs.filter((doc) => doc.verifiedStatus === 'REJECTED').length;
  return {
    totalUsers,
    statusCounts: totals.statusCounts,
    medicalProfessionals: totals.medicalProfessionals,
    nonMedicalProfessionals: totals.nonMedicalProfessionals,
    nonVerifiedUsers: totals.nonVerifiedUsers,
    documentsPending,
    documentsFlagged,
    updatedAt: new Date().toISOString()
  };
};

export const getDashboardMetrics = async () => {
  try {
    const { data: payload } = await apiClient.get(USER_STATS_ENDPOINT);
    if (!payload?.data) {
      throw new Error('User stats response missing data');
    }
    return mapUserStatsResponse(payload.data);
  } catch (error) {
    console.error('Falling back to local dashboard metrics:', error);
    return buildLocalDashboardMetrics();
  }
};

const auditEntry = (actor, action, details) => ({
  at: new Date().toISOString(),
  actor,
  action,
  details
});

const filterBySearch = (items, searchTerm) => {
  if (!searchTerm) return items;
  const query = searchTerm.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    const searchable = [item.fullname, item.email, item.phoneNumber]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(query);
  });
};

const applyUserFilters = (items, filters = {}) => {
  let output = [...items];
  if (filters.status && filters.status !== 'ALL') {
    const isVerifiedFilter = filters.status === 'VERIFIED';
    output = output.filter((item) => item.isEmailVerified === isVerifiedFilter);
  }
  if (filters.dateFrom) {
    output = output.filter((item) => new Date(item.createdAt) >= new Date(filters.dateFrom));
  }
  if (filters.dateTo) {
    output = output.filter((item) => new Date(item.createdAt) <= new Date(filters.dateTo));
  }
  return output;
};

const applySort = (items, sort = {}) => {
  if (!sort?.id) return items;
  const { id, desc } = sort;
  const sorted = [...items].sort((a, b) => {
    const aValue = id.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), a);
    const bValue = id.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), b);
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }
    const aString = aValue.toString().toLowerCase();
    const bString = bValue.toString().toLowerCase();
    if (aString < bString) return -1;
    if (aString > bString) return 1;
    return 0;
  });
  return desc ? sorted.reverse() : sorted;
};

export const getUsers = async ({
  page = 1,
  pageSize = 10,
  search,
  filters,
  sort
} = {}) => {
  let sourceUsers = [];
  try {
    const { data: payload } = await apiClient.get(USERS_ENDPOINT);
    const remoteItems = Array.isArray(payload?.data) ? payload.data : [];
    sourceUsers = remoteItems.map((item) => normalizeRemoteUser(item));
  } catch (error) {
    console.error('Failed to load remote users, falling back to seed data:', error);
    await delay();
    sourceUsers = users.map((user) =>
      normalizeRemoteUser({
        id: user.id,
        fullname: user.personal?.fullName,
        email: user.contact?.emailPrimary,
        phoneNumber: user.contact?.mobileNumber,
        isEmailVerified: user.status === 'VERIFIED',
        createdAt: user.createdAt,
        role: user.role,
        registeredAs: user.qualifications?.ug?.degree
      })
    );
  }

  const start = (page - 1) * pageSize;
  const filtered = applyUserFilters(filterBySearch(sourceUsers, search), filters);
  const sorted = applySort(filtered, sort);
  const pageData = sorted.slice(start, start + pageSize);
  return {
    data: pageData,
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
    availableStates: [],
    degrees: []
  };
};

export const getUserById = async (id) => {
  if (!id) {
    throw new Error('User id is required');
  }
  try {
    const { data: payload } = await apiClient.get(`/api/v1/admin/get-user/${id}`);
    if (!payload?.data) {
      throw new Error('User detail response missing data');
    }
    const detail = payload.data;
    return {
      id: detail?.data?.userId || detail?.data?._id || id,
      professionalType: detail?.professionalType || detail?.data?.professionalType || '',
      profile: detail?.data || {}
    };
  } catch (error) {
    console.error('Failed to load remote user detail, falling back to seed data:', error);
    await delay();
    const user = users.find((item) => item.id === id);
    if (!user) {
      throw error;
    }
    return {
      id: user.id,
      professionalType: user.qualifications?.pg ? 'medical_prof' : 'non_medical',
      profile: {
        permanentAddress: user.contact?.permanentAddress,
        academicQualifications: {
          ug: {
            qualification: user.qualifications?.ug?.degree,
            college: user.qualifications?.ug?.institution,
            yearOfPassing: user.qualifications?.ug?.year
          },
          pg: user.qualifications?.pg
            ? {
                qualification: user.qualifications?.pg?.degree,
                college: user.qualifications?.pg?.institution,
                yearOfPassing: user.qualifications?.pg?.year
              }
            : undefined
        },
        regulatoryDetails: {
          regulatoryAyushRegNo: user.regulatory?.ayushCouncilRegNo,
          councilName: user.regulatory?.councilName
        },
        practiceDetails: {},
        userId: user.id,
        fullname: user.personal?.fullName,
        dateOfBirth: user.personal?.dob,
        personalNationality: user.personal?.nationality,
        personalPhoto: user.personal?.photoUrl,
        gender: user.personal?.gender,
        phoneNumber: user.contact?.mobileNumber,
        emailPrimary: user.contact?.emailPrimary,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        previousExperience: [],
        researchInterests: [],
        publicationDetails: [],
        traningDetails: [],
        digitalSocialPlatform: [],
        digitalSocialHandle: [],
        digitalSocialURL: [],
        consent_infoTrueAndCorrect: true,
        consent_authorizeDataUse: true,
        consent_agreeToNotifications: true,
        consent_timestamp: user.updatedAt
      }
    };
  }
};

export const updateUserStatus = async ({ id, status, note, actor = 'superadmin' }) => {
  await delay();
  const user = users.find((item) => item.id === id);
  if (!user) throw new Error('User not found');
  user.status = status;
  if (note) {
    user.audit.unshift(auditEntry(actor, 'NOTE_ADDED', note));
  }
  user.audit.unshift(auditEntry(actor, 'STATUS_UPDATED', `Status changed to ${status}`));
  return cloneUser(user);
};

export const deleteUser = async (id) => {
  if (!id) {
    throw new Error('User id is required');
  }
  try {
    await apiClient.delete(`/api/v1/admin/users/${id}`);
    users = users.filter((user) => user.id !== id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete remote user, attempting local removal:', error);
    await delay();
    const nextUsers = users.filter((user) => user.id !== id);
    if (nextUsers.length === users.length) {
      throw error;
    }
    users = nextUsers;
    return { success: true, fallback: true };
  }
};

export const listDocuments = async ({
  page = 1,
  pageSize = 12,
  type,
  status,
  search
} = {}) => {
  await delay();
  const start = (page - 1) * pageSize;
  let docs = buildDocumentIndex();
  if (type && type !== 'ALL') {
    docs = docs.filter((doc) => doc.type === type);
  }
  if (status && status !== 'ALL') {
    docs = docs.filter((doc) => doc.verifiedStatus === status || doc.status === status);
  }
  if (search) {
    const query = search.trim().toLowerCase();
    docs = docs.filter((doc) =>
      [doc.name, doc.userName, doc.type, doc.verifiedStatus].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }
  const pageData = docs.slice(start, start + pageSize);
  return {
    data: pageData,
    page,
    pageSize,
    total: docs.length,
    totalPages: Math.ceil(docs.length / pageSize)
  };
};

const setDocumentStatus = async ({ docId, status, note, actor, actionType }) => {
  await delay(160);
  let updatedDoc;
  let updatedUser;
  let responsePayload;
  const nextUsers = users.map((user) => {
    const docIndex = user.documents.findIndex((doc) => doc.id === docId);
    if (docIndex === -1) return user;
    const currentDoc = user.documents[docIndex];
    updatedDoc = {
      ...currentDoc,
      verifiedStatus: status,
      notes: note || currentDoc.notes
    };
    updatedUser = {
      ...user,
      documents: user.documents.map((doc, idx) => (idx === docIndex ? updatedDoc : doc)),
      audit: [
        auditEntry(actor, actionType, `${currentDoc.name} marked as ${status}${
          note ? ` – ${note}` : ''
        }`),
        ...user.audit
      ]
    };
    responsePayload = {
      document: { ...updatedDoc, userId: user.id, userName: user.personal.fullName },
      user: cloneUser(updatedUser)
    };
    return updatedUser;
  });

  if (!updatedUser || !updatedDoc) {
    throw new Error('Document not found');
  }
  users = nextUsers;
  return responsePayload;
};

export const verifyDocument = ({ docId, note, actor = 'verifier' }) =>
  setDocumentStatus({ docId, status: 'VERIFIED', note, actor, actionType: 'DOCUMENT_VERIFIED' });

export const rejectDocument = ({ docId, note, actor = 'verifier' }) =>
  setDocumentStatus({ docId, status: 'REJECTED', note, actor, actionType: 'DOCUMENT_REJECTED' });

export const bulkUpdateUsers = async ({ ids, status, actor = 'superadmin' }) => {
  await delay(220);
  const updated = [];
  ids.forEach((id) => {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    user.status = status;
    user.audit.unshift(auditEntry(actor, 'STATUS_UPDATED', `Bulk status change to ${status}`));
    updated.push(cloneUser(user));
  });
  return updated;
};

export const listAnnouncements = async () => {
  await delay(160);
  return announcements
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const createAnnouncement = async ({
  title,
  message,
  audience,
  link,
  scheduledFor
} = {}) => {
  if (!title?.trim() || !message?.trim()) {
    throw new Error('Title and message are required to create an announcement');
  }
  await delay(200);
  const createdAt = new Date().toISOString();
  const formattedSchedule = scheduledFor ? new Date(scheduledFor).toISOString() : null;
  const newAnnouncement = {
    id: generateId('announcement'),
    title: title.trim(),
    message: message.trim(),
    audience: audience?.trim() || 'All admins',
    link: link?.trim() || '',
    status: formattedSchedule ? 'SCHEDULED' : 'PUBLISHED',
    scheduledFor: formattedSchedule,
    createdAt
  };
  announcements = [newAnnouncement, ...announcements];
  return newAnnouncement;
};

export const updateAnnouncement = async (id, updates = {}) => {
  if (!id) {
    throw new Error('Announcement id is required');
  }
  await delay(160);
  const index = announcements.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Announcement not found');
  }
  const nextAnnouncement = {
    ...announcements[index],
    ...updates,
    title: updates.title?.trim() || announcements[index].title,
    message: updates.message?.trim() || announcements[index].message,
    audience: updates.audience?.trim() || announcements[index].audience,
    link: updates.link?.trim() || announcements[index].link,
    scheduledFor: updates.scheduledFor ? new Date(updates.scheduledFor).toISOString() : null,
    status: updates.scheduledFor ? 'SCHEDULED' : 'PUBLISHED',
    updatedAt: new Date().toISOString()
  };
  announcements[index] = nextAnnouncement;
  return nextAnnouncement;
};

export const deleteAnnouncement = async (id) => {
  if (!id) {
    throw new Error('Announcement id is required');
  }
  await delay(120);
  const next = announcements.filter((item) => item.id !== id);
  if (next.length === announcements.length) {
    throw new Error('Announcement not found');
  }
  announcements = next;
  return { success: true };
};

export const listGalleryItems = async () => {
  await delay(140);
  return galleryItems
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

export const addGalleryItem = async ({ title, imageUrl, description, category } = {}) => {
  if (!title?.trim() || !imageUrl?.trim()) {
    throw new Error('Title and image URL are required to add a gallery item');
  }
  await delay(200);
  const newItem = {
    id: generateId('gallery'),
    title: title.trim(),
    description: description?.trim() || '',
    category: category?.trim() || 'General',
    imageUrl: imageUrl.trim(),
    createdAt: new Date().toISOString()
  };
  galleryItems = [newItem, ...galleryItems];
  return newItem;
};

export const updateGalleryItem = async ({ id, title, imageUrl, description, category } = {}) => {
  if (!id) {
    throw new Error('Gallery item id is required');
  }
  await delay(160);
  const index = galleryItems.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Gallery item not found');
  }
  const nextItem = {
    ...galleryItems[index],
    title: title?.trim() || galleryItems[index].title,
    imageUrl: imageUrl?.trim() || galleryItems[index].imageUrl,
    description: description?.trim() ?? galleryItems[index].description,
    category: category?.trim() || galleryItems[index].category,
    updatedAt: new Date().toISOString()
  };
  galleryItems[index] = nextItem;
  return nextItem;
};

export const deleteGalleryItem = async (id) => {
  if (!id) {
    throw new Error('Gallery item id is required');
  }
  await delay(120);
  const next = galleryItems.filter((item) => item.id !== id);
  if (next.length === galleryItems.length) {
    throw new Error('Gallery item not found');
  }
  galleryItems = next;
  return { success: true };
};

export const resetStore = () => {
  users = seedUsers.map((user) => cloneUser(user));
  announcements = [...announcementSeeds];
  galleryItems = [...gallerySeeds];
};
