// src/data/teamData.ts

export interface TeamMember {
  id: string;
  category: 'core' | 'advisor';
  name: string;
  role: string;
  institution: string;
  location: string;
  email: string;
  bio?: string;
  image: string;
  imagePosition?: string;
  linkedin: string;
}

export const TEAM_DATA: TeamMember[] = [
  // ================= CORE RESEARCHERS =================
  {
    id: 'hilmy',
    category: 'core',
    name: 'Hilmy Baihaqi',
    role: 'Frontend Engineering & UI/UX',
    institution: 'Telkom University',
    location: 'Bandung, Indonesia',
    email: 'hilmybaihaqi08@gmail.com',
    bio: 'Translating complex in-silico computational data into a seamless, intuitive, and highly editorial digital experience.',
    image: '/pictures/team/Hilmy Baihaqi.jpeg',
    imagePosition: 'center top',
    linkedin: '#',
  },
  {
    id: 'citra',
    category: 'core',
    name: 'Citra Kusumadewi Sribawono',
    role: 'Machine Learning & Integration',
    institution: 'Telkom University',
    location: 'Bandung, Indonesia',
    email: 'csribawono@gmail.com',
    bio: 'Focusing on the methodological rigor and architectural integration of predictive cardiotoxicity models.',
    image: '/pictures/team/Citra Kusumadewi.jpg',
    imagePosition: 'center top',
    linkedin: '#',
  },
  {
    id: 'mitchel',
    category: 'core',
    name: 'Mitchel Mohamad Affandi',
    role: 'Systems & Infrastructure',
    institution: 'Telkom University',
    location: 'Bandung, Indonesia',
    email: 'mitch.affandi22@gmail.com',
    bio: 'Ensuring robust operational deployment and maintaining the backbone infrastructure for high-capacity simulations.',
    image: '/pictures/team/Mitchel M. Affandi.jpeg',
    linkedin: '#',
  },

  // ================= SUPERVISORS & ADVISORS =================
  {
    id: 'yunendah',
    category: 'advisor',
    name: 'R. Yunendah Nur Fu’adah',
    role: 'Research Supervisor',
    institution: 'Telecommunication Eng., Telkom University',
    location: 'Bandung, Indonesia',
    email: 'yunendah@telkomuniversity.ac.id',
    image: '/pictures/team/Yunendah Nur Fuadah.png',
    linkedin: '#',
  },
  {
    id: 'ali',
    category: 'advisor',
    name: 'Ali Ikhsanul Qauli',
    role: 'AI & Robotics Advisor',
    institution: 'Robotics and AI Eng., Universitas Airlangga',
    location: 'Surabaya, Indonesia',
    email: 'ali.ikhsanul.q@ftmm.unair.ac.id',
    image: '/pictures/team/Ali Ikhsanul Qauli.png',
    linkedin: '#',
  },
  {
    id: 'pramudito',
    category: 'advisor',
    name: 'Muhammad Adnan Pramudito',
    role: 'Medical IT Convergence Advisor',
    institution: 'Kumoh National Institute of Technology',
    location: 'Gumi, Republic of Korea',
    email: 'adnanpramudito@kumoh.ac.kr',
    image: '/pictures/team/Muhammad-Adnan-Pramudito.png',
    linkedin: '#',
  },
  {
    id: 'kimoolim',
    category: 'advisor',
    name: 'Prof. Ki Moo Lim',
    role: 'Principal Scientific Advisor',
    institution: 'Medical IT Convergence Eng., Kumoh National Institute of Technology',
    location: 'Gumi, Republic of Korea',
    email: 'kmlim@kumoh.ac.kr',
    image: '/pictures/team/Prof-Kii-Moo-Lim.png',
    imagePosition: 'center top',
    linkedin: '#',
  },
];
