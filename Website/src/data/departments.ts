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
    id: "dept_nhai_01",
    name: "NHAI (National Highways Authority of India)",
    departmentName: "NHAI (National Highways Authority of India)",
    roadTypes: ["NH", "Expressway", "Toll"],
    truePortalLink: "https://pgportal.gov.in/",
    helplineEmail: "nhai1033@nhai.org",
    shortName: "NHAI",
    zone: "Central Zone",
    keywords: ["highway", "toll plaza", "national highway", "expressway", "nh"],
    applicabilityRationale: "Applicable ONLY for National Highways and Expressways.",
    totalForwarded: 15,
    responded: 10,
    pending: 5,
  },
  {
    id: "dept_pwd_02",
    name: "State PWD (Public Works Department)",
    departmentName: "State PWD (Public Works Department)",
    roadTypes: ["SH", "Major Roads", "Flyover"],
    truePortalLink: "https://pwd.mygov.in/",
    helplineEmail: "cpwd_dgw@nic.in",
    shortName: "PWD",
    zone: "North Zone",
    keywords: ["state road", "main road", "flyover", "bridge", "pwd"],
    applicabilityRationale: "Applicable for major city roads, state highways, and big flyovers.",
    totalForwarded: 12,
    responded: 8,
    pending: 4,
  },
]
