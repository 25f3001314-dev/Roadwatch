export interface DepartmentRecord {
  id: string
  name: string
  departmentName: string
  roadTypes: string[]
  truePortalLink: string
  helplineEmail: string
  keywords: string[]
  applicabilityRationale: string
  shortName: string
  zone: string
  totalForwarded: number
  responded: number
  pending: number
}

export const DEPARTMENTS: DepartmentRecord[] = [
  {
    id: 'dept_nhai_01',
    name: 'NHAI (National Highways Authority of India)',
    departmentName: 'NHAI (National Highways Authority of India)',
    roadTypes: ['NH', 'Expressway', 'Toll'],
    truePortalLink: 'https://pgportal.gov.in/',
    helplineEmail: 'nhai1033@nhai.org',
    shortName: 'NHAI',
    zone: 'Central Zone',
    keywords: ['highway', 'toll plaza', 'national highway', 'expressway', 'nh'],
    applicabilityRationale:
      'Applicable ONLY for National Highways and Expressways. Sensible because local city municipal corporations do not have the jurisdiction or budget to repair multi-lane national infrastructure. Complaints about highway tolls or major highway accidents must route here.',
    totalForwarded: 15,
    responded: 10,
    pending: 5,
  },
  {
    id: 'dept_pwd_02',
    name: 'State PWD (Public Works Department)',
    departmentName: 'State PWD (Public Works Department)',
    roadTypes: ['SH', 'Major Roads', 'Flyover'],
    truePortalLink: 'https://pwd.mygov.in/',
    helplineEmail: 'cpwd_dgw@nic.in',
    shortName: 'PWD',
    zone: 'North Zone',
    keywords: ['state road', 'main road', 'flyover', 'bridge', 'pwd'],
    applicabilityRationale:
      'Applicable for major city roads, state highways, and big flyovers. Sensible because these roads connect different districts and require heavy engineering, which falls under state PWD rather than small local bodies.',
    totalForwarded: 12,
    responded: 8,
    pending: 4,
  },
  {
    id: 'dept_ulb_03',
    name: 'Local Municipal Corporation (Nagar Nigam/Palika)',
    departmentName: 'Local Municipal Corporation (Nagar Nigam/Palika)',
    roadTypes: ['Colony Road', 'Street', 'Local Road'],
    truePortalLink: 'https://mohua.gov.in/',
    helplineEmail: 'smartcities-mohua@gov.in',
    shortName: 'ULB',
    zone: 'Central Zone',
    keywords: ['colony road', 'street', 'pothole', 'garbage', 'local park'],
    applicabilityRationale:
      'Applicable for internal colony roads, local potholes, and neighborhood sanitation. Sensible because urban local bodies (Nagar Nigam) collect local property taxes specifically to maintain daily civic amenities within city limits.',
    totalForwarded: 10,
    responded: 7,
    pending: 3,
  },
  {
    id: 'dept_jal_04',
    name: 'Jal Board / Water Supply & Sewerage',
    departmentName: 'Jal Board / Water Supply & Sewerage',
    roadTypes: ['Drainage', 'Waterlogging', 'Sewer'],
    truePortalLink: 'https://jalshakti-ddws.gov.in/',
    helplineEmail: 'ddws_nic@nic.in',
    shortName: 'JAL',
    zone: 'East Zone',
    keywords: ['waterlogging', 'sewer', 'drainage', 'pipe burst', 'manhole'],
    applicabilityRationale:
      'Applicable when road damage is caused by underground water issues. Sensible because fixing the road without fixing the bursting pipe below it will ruin the road again. This department must stop the leak before PWD can patch the road.',
    totalForwarded: 8,
    responded: 5,
    pending: 3,
  },
  {
    id: 'dept_traffic_05',
    name: 'Traffic Police Department',
    departmentName: 'Traffic Police Department',
    roadTypes: ['Traffic Control', 'Signal', 'Parking'],
    truePortalLink: 'https://echallan.parivahan.gov.in/',
    helplineEmail: 'helpdesk-echallan@gov.in',
    shortName: 'TP',
    zone: 'North Zone',
    keywords: ['traffic jam', 'signal kharab', 'illegal parking', 'wrong side'],
    applicabilityRationale:
      'Applicable for moving traffic issues, non-functioning signals, or blockades. Sensible because they have the immediate manpower on the ground to clear physical obstructions or redirect traffic, even if they do not repair the road itself.',
    totalForwarded: 6,
    responded: 4,
    pending: 2,
  },
  {
    id: 'dept_electric_06',
    name: 'State Electricity Board / DISCOM',
    departmentName: 'State Electricity Board / DISCOM',
    roadTypes: ['Street Light', 'Power Line', 'Pole'],
    truePortalLink: 'https://powermin.gov.in/',
    helplineEmail: 'opm-power@gov.in',
    shortName: 'DISCOM',
    zone: 'South Zone',
    keywords: ['streetlight', 'hanging wire', 'sparking', 'dark street', 'pole'],
    applicabilityRationale:
      'Applicable for electrical hazards on the road. Sensible because only certified linemen can safely handle high-voltage street lights and hanging cables; other road workers could be electrocuted.',
    totalForwarded: 4,
    responded: 2,
    pending: 2,
  },
];
