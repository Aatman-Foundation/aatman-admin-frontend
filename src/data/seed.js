const firstNames = [
  'Aarav',
  'Diya',
  'Vihaan',
  'Ishan',
  'Myra',
  'Kavya',
  'Rohan',
  'Anaya',
  'Arjun',
  'Ira',
  'Kabir',
  'Meera',
  'Dev',
  'Riya',
  'Shaan',
  'Tara',
  'Yash',
  'Zara',
  'Nikhil',
  'Saanvi'
];

const lastNames = [
  'Sharma',
  'Patel',
  'Iyer',
  'Nair',
  'Reddy',
  'Mehta',
  'Kapoor',
  'Chopra',
  'Bose',
  'Desai',
  'Kulkarni',
  'Joshi',
  'Verma',
  'Singh',
  'Gupta',
  'Khan',
  'Naidu',
  'Pillai',
  'Dutta',
  'Gokhale'
];

const citiesByState = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru'],
  TamilNadu: ['Chennai', 'Coimbatore', 'Madurai'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode'],
  Delhi: ['New Delhi', 'Dwarka', 'Saket'],
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur'],
  Punjab: ['Amritsar', 'Chandigarh', 'Ludhiana'],
  Telangana: ['Hyderabad', 'Warangal', 'Karimnagar'],
  WestBengal: ['Kolkata', 'Siliguri', 'Durgapur']
};

const statuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'];
const documentTypes = [
  'PHOTO',
  'ID_PROOF',
  'ADDRESS_PROOF',
  'UG_DEGREE',
  'PG_DEGREE',
  'PHD_CERT',
  'COUNCIL_REG',
  'OTHER'
];

const ugDegrees = ['BAMS', 'BHMS', 'BUMS', 'BSMS', 'BNYS'];
const pgDegrees = ['MD', 'MS', 'Other AYUSH PG'];

const genders = ['Male', 'Female', 'Other'];
const maritalStatuses = ['Single', 'Married', 'Divorced'];

const certificationsCatalog = [
  'Ayurvedic Nutrition',
  'Panchakarma Therapy',
  'Yoga Therapy',
  'Clinical Herbalism',
  'Wellness Coaching',
  'Holistic Counseling'
];

const loremNotes = [
  'Verified against original documents.',
  'Pending council confirmation.',
  'Need clearer scan of address proof.',
  'Audit trail reviewed and complete.',
  'User provided updated phone number.',
  'Follow-up call scheduled with verifier.'
];

const avatars = [
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=22',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=45',
  'https://i.pravatar.cc/150?img=51',
  'https://i.pravatar.cc/150?img=60',
  'https://i.pravatar.cc/150?img=68'
];

const sampleDocs = [
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    type: 'PHOTO'
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    type: 'ID_PROOF'
  },
  {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    type: 'ADDRESS_PROOF'
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    type: 'UG_DEGREE'
  },
  {
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'COUNCIL_REG'
  }
];

const randomOf = (array, index) => array[index % array.length];

const createDocument = (userIndex, docIndex, type, createdAt) => {
  const statusIndex = (userIndex + docIndex) % 3;
  const verifiedStatus = ['UNVERIFIED', 'VERIFIED', 'REJECTED'][statusIndex];
  return {
    id: `doc-${userIndex}-${docIndex}`,
    type,
    name: `${type.replace('_', ' ')} Document ${docIndex + 1}`,
    url: sampleDocs.find((d) => d.type === type)?.url || sampleDocs[docIndex % sampleDocs.length].url,
    uploadedAt: new Date(Date.parse(createdAt) + docIndex * 86400000).toISOString(),
    verifiedStatus,
    notes: verifiedStatus === 'REJECTED' ? randomOf(loremNotes, docIndex) : undefined
  };
};

const createAuditTrail = (createdAt, userName) => {
  const actors = ['system', 'verifier.ayush', 'superadmin', 'audit.bot'];
  return [
    {
      at: createdAt,
      actor: 'system',
      action: 'USER_CREATED',
      details: `User record for ${userName} created.`
    },
    {
      at: new Date(Date.parse(createdAt) + 3 * 86400000).toISOString(),
      actor: 'verifier.ayush',
      action: 'STATUS_UPDATED',
      details: 'Initial review completed.'
    },
    {
      at: new Date(Date.parse(createdAt) + 5 * 86400000).toISOString(),
      actor: randomOf(actors, userName.length),
      action: 'NOTE_ADDED',
      details: randomOf(loremNotes, userName.length)
    }
  ];
};

const createUser = (index) => {
  const firstName = randomOf(firstNames, index);
  const lastName = randomOf(lastNames, index * 7);
  const fullName = `${firstName} ${lastName}`;
  const stateKeys = Object.keys(citiesByState);
  const state = stateKeys[index % stateKeys.length];
  const cityOptions = citiesByState[state];
  const city = randomOf(cityOptions, index * 3);
  const status = randomOf(statuses, index * 5);
  const createdAt = new Date(Date.now() - index * 86400000 * 3).toISOString();
  const ugDegree = randomOf(ugDegrees, index * 2);
  const pgDegree = index % 3 === 0 ? randomOf(pgDegrees, index * 4) : null;
  const hasPhd = index % 7 === 0;
  const docCount = 3 + (index % 5);
  const documents = Array.from({ length: docCount }).map((_, docIndex) =>
    createDocument(index, docIndex, randomOf(documentTypes, index + docIndex), createdAt)
  );

  const auditTrail = createAuditTrail(createdAt, fullName);

  return {
    id: `user-${index}`,
    createdAt,
    status,
    personal: {
      fullName,
      gender: randomOf(genders, index),
      dob: new Date(1985 + (index % 10), (index * 3) % 12, (index * 7) % 28 + 1)
        .toISOString()
        .split('T')[0],
      parentsName: `${randomOf(firstNames, index + 4)} ${randomOf(lastNames, index + 2)}`,
      maritalStatus: randomOf(maritalStatuses, index),
      nationality: 'Indian',
      photoUrl: randomOf(avatars, index)
    },
    contact: {
      permanentAddress: {
        houseNo: `${100 + index}`,
        street: `${randomOf(['MG Road', 'Church Street', 'Ring Road', 'Lake View'], index)} ${index}`,
        city,
        state,
        pinCode: `${560000 + index}`
      },
      correspondenceAddress: {
        houseNo: `${120 + index}`,
        street: `${randomOf(['Residency Road', 'Hill View', 'Garden Street'], index)} ${index}`,
        city,
        state,
        pinCode: `${560100 + index}`
      },
      mobileNumber: `+91-98${(index * 37 + 1234).toString().padStart(8, '0')}`,
      altContactNumber: index % 4 === 0 ? `+91-99${(index * 41 + 4321).toString().padStart(8, '0')}` : undefined,
      emailPrimary: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ayushmail.com`,
      emailAlternate: index % 5 === 0 ? `${firstName.toLowerCase()}_${lastName.toLowerCase()}@altmail.com` : undefined
    },
    qualifications: {
      ug: {
        degree: ugDegree,
        college: `${randomOf(['National AYUSH College', 'Herbal Sciences Institute', 'Ayurveda University'], index)} ${city}`,
        yearOfPassing: 2005 + (index % 10)
      },
      pg: pgDegree
        ? {
            degree: pgDegree,
            specialization: randomOf(
              ['Kayachikitsa', 'Panchakarma', 'Dravyaguna', 'Rachana Sharir'],
              index + 2
            ),
            college: `${randomOf(['Institute of Advanced AYUSH', 'Global Ayurvedic Academy'], index)} ${state}`,
            yearOfPassing: 2012 + (index % 8)
          }
        : undefined,
      phd: hasPhd
        ? {
            title: `Research on ${randomOf(['Medicinal Herbs', 'Yoga Therapy', 'Holistic Medicine'], index)}`,
            institute: `${randomOf(['Central AYUSH Research Institute', 'Global Wellness University'], index)}`,
            year: 2018 + (index % 4)
          }
        : undefined,
      certifications: Array.from({ length: index % 4 }).map((_, certIndex) => ({
        name: randomOf(certificationsCatalog, index + certIndex),
        issuer: `${randomOf(['AYUSH Council', 'Wellness Board', 'Holistic Assoc.'], certIndex)}`,
        year: 2016 + ((index + certIndex) % 6)
      }))
    },
    regulatory: {
      ayushCouncilRegNo: `AYUSH-${(100000 + index * 97).toString()}`,
      councilName: `${randomOf(['Central Council of Indian Medicine', 'State AYUSH Council', 'AYUSH National Board'], index)} ${state}`,
      dateOfRegistration: new Date(Date.now() - index * 86400000 * 120).toISOString(),
      validity: new Date(Date.now() + 86400000 * (365 * 5 - index * 20)).toISOString()
    },
    documents,
    audit: auditTrail
  };
};

export const seedUsers = Array.from({ length: 36 }).map((_, index) => createUser(index + 1));

export const seedDocuments = seedUsers.flatMap((user) =>
  user.documents.map((doc) => ({
    ...doc,
    userId: user.id,
    userName: user.personal.fullName,
    status: doc.verifiedStatus
  }))
);
