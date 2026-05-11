/**
 * Haramaya University — Colleges and their Departments
 * Source: Official HU academic structure
 */

export const HU_COLLEGES = [
  {
    name: 'College of Agriculture and Environmental Sciences',
    code: 'CAES',
    departments: [
      'Animal Sciences',
      'Crop Sciences',
      'Horticulture and Plant Sciences',
      'Natural Resources Management',
      'Rural Development and Agricultural Extension',
      'Soil and Water Management',
      'Agricultural Economics',
      'Food Science and Post-Harvest Technology',
    ],
  },
  {
    name: 'College of Computing and Informatics',
    code: 'CCI',
    departments: [
      'Computer Science',
      'Information Technology',
      'Information Systems',
      'Software Engineering',
      'Computer Engineering',
    ],
  },
  {
    name: 'College of Health and Medical Sciences',
    code: 'CHMS',
    departments: [
      'Medicine',
      'Nursing',
      'Pharmacy',
      'Public Health',
      'Medical Laboratory Sciences',
      'Midwifery',
      'Anesthesia',
      'Physiotherapy',
      'Environmental Health',
    ],
  },
  {
    name: 'College of Natural and Computational Sciences',
    code: 'CNCS',
    departments: [
      'Mathematics',
      'Statistics',
      'Physics',
      'Chemistry',
      'Biology',
      'Sport Science',
    ],
  },
  {
    name: 'College of Social Sciences and Humanities',
    code: 'CSSH',
    departments: [
      'English Language and Literature',
      'Afan Oromo',
      'History and Heritage Management',
      'Geography and Environmental Studies',
      'Sociology',
      'Psychology',
      'Journalism and Communication',
      'Political Science and International Relations',
    ],
  },
  {
    name: 'College of Law and Governance',
    code: 'CLG',
    departments: [
      'Law',
      'Public Administration and Development Management',
    ],
  },
  {
    name: 'College of Business and Economics',
    code: 'CBE',
    departments: [
      'Accounting and Finance',
      'Management',
      'Economics',
      'Marketing Management',
      'Logistics and Supply Chain Management',
    ],
  },
  {
    name: 'College of Engineering and Technology',
    code: 'CET',
    departments: [
      'Civil Engineering',
      'Electrical and Computer Engineering',
      'Mechanical Engineering',
      'Chemical Engineering',
      'Water Resources and Environmental Engineering',
      'Architecture',
    ],
  },
  {
    name: 'College of Veterinary Medicine',
    code: 'CVM',
    departments: [
      'Veterinary Medicine',
      'Veterinary Pathology and Microbiology',
      'Veterinary Pharmacology and Toxicology',
      'Veterinary Surgery and Diagnostic Imaging',
      'Animal Production and Technology',
    ],
  },
  {
    name: 'College of Education and Behavioral Sciences',
    code: 'CEBS',
    departments: [
      'Curriculum and Instruction',
      'Educational Planning and Management',
      'Special Needs and Inclusive Education',
      'Psychology',
      'Physical Education and Sport',
    ],
  },
];

/** Flat list of all department names (for simple dropdowns) */
export const ALL_DEPARTMENTS = HU_COLLEGES.flatMap(c => c.departments).sort();

/** Get departments for a specific college name */
export const getDepartmentsByCollege = (collegeName) => {
  if (!collegeName) return ALL_DEPARTMENTS;
  const college = HU_COLLEGES.find(
    c => c.name === collegeName || c.code === collegeName
  );
  return college ? college.departments : ALL_DEPARTMENTS;
};

/** Get college name from a department name */
export const getCollegeByDepartment = (deptName) => {
  return HU_COLLEGES.find(c => c.departments.includes(deptName)) || null;
};
