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
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', // Ganti dengan foto asli
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
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop', // Ganti dengan foto asli
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
    image: 'https://images.unsplash.com/photo-1517070208541-6d8fec9b8e62?q=80&w=800&auto=format&fit=crop', // Ganti dengan foto asli
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
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop', // Ganti dengan foto asli
    linkedin: '#',
  },
];