export const LOCATIONS = [
  'All Locations',
  'Bellerive',
  'Brighton',
  'Burnie',
  'Claremont',
  'Cygnet',
  'Devonport',
  'George Town',
  'Glenorchy',
  'Hobart',
  'Howrah',
  'Huonville',
  'Invermay',
  'Kingston',
  'Latrobe',
  'Lauderdale',
  'Launceston',
  'Legana',
  'Longford',
  'Margate',
  'New Norfolk',
  'Newstead',
  'North West Coast',
  'Outreach Services',
  'Penguin',
  'Ravenswood',
  'Remote',
  'Richmond',
  'Rosny',
  'Smithton',
  'Sorell',
  'Statewide (Telehealth)',
  'Telehealth',
  'Trevallyn',
  'Ulverstone',
  'Wynyard'
] as const

export const PROFESSIONS = [
  'Clinical Psychologist',
  'Psychologist',
  'Psychiatrist',
  'Counsellor',
  'Social Worker',
  'Mental Health Nurse',
  'Occupational Therapist',
  'Other'
] as const

export const SPECIALTIES = [
  'Anxiety',
  'Depression',
  'Trauma',
  'PTSD',
  'Sleep Disorders',
  'Eating Disorders',
  'Addiction',
  'Grief and Loss',
  'Relationship Issues',
  'Family Therapy',
  'Child and Adolescent',
  'LGBTIQ+',
  'Neurodiversity',
  'ADHD',
  'Autism',
  'Bipolar Disorder',
  'Schizophrenia',
  'Personality Disorders',
  'Workplace Stress',
  'Chronic Pain',
  'Neuromodulation',
  'CBT',
  'ACT',
  'DBT',
  'EMDR',
  'Other'
] as const

export const PRACTICE_TYPES = [
  { value: 'individual', label: 'Individual Clinician' },
  { value: 'group_practice', label: 'Group Practice / Clinic' },
  { value: 'non_profit', label: 'Non-Profit / Organisation' }
] as const

export const HELPLINES = [
  {
    name: 'Lifeline',
    number: '13 11 14',
    description: '24/7 Crisis Support & Suicide Prevention. Chat available online.',
    website: 'https://www.lifeline.org.au',
    tel: '131114'
  },
  {
    name: 'Suicide Call Back Service',
    number: '1300 659 467',
    description: '24/7 professional counselling for people affected by suicide.',
    website: 'https://www.suicidecallbackservice.org.au',
    tel: '1300659467'
  },
  {
    name: 'Beyond Blue',
    number: '1300 22 4636',
    description: 'Support for anxiety, depression and suicide prevention.',
    website: 'https://www.beyondblue.org.au',
    tel: '1300224636'
  },
  {
    name: '1800RESPECT',
    number: '1800 737 732',
    description: 'National sexual assault, domestic family violence counselling service.',
    website: 'https://www.1800respect.org.au',
    tel: '1800737732'
  },
  {
    name: 'MensLine Australia',
    number: '1300 78 99 78',
    description: 'Support for men with family and relationship concerns.',
    website: 'https://www.mensline.org.au',
    tel: '1300789978'
  },
  {
    name: 'QLife',
    number: '1800 184 527',
    description: 'LGBTIQ+ peer support and referral. (3pm - Midnight)',
    website: 'https://qlife.org.au',
    tel: '1800184527'
  },
  {
    name: 'Open Arms',
    number: '1800 011 046',
    description: 'Mental health support for Veterans and families.',
    website: 'https://www.openarms.gov.au',
    tel: '1800011046'
  },
  {
    name: 'Butterfly Foundation',
    number: '1800 33 4673',
    description: 'Support for eating disorders and body image issues.',
    website: 'https://butterfly.org.au',
    tel: '1800334673'
  },
  {
    name: 'Kids Helpline',
    number: '1800 55 1800',
    description: '24/7 help for young people aged 5 to 25.',
    website: 'https://kidshelpline.com.au',
    tel: '1800551800'
  },
  {
    name: 'headspace',
    number: '1800 650 890',
    description: 'National youth mental health foundation.',
    website: 'https://headspace.org.au',
    tel: '1800650890'
  },
  {
    name: '13YARN',
    number: '13 92 76',
    description: 'Aboriginal & Torres Strait Islander Crisis Support.',
    website: 'https://www.13yarn.org.au',
    tel: '139276'
  }
] as const
