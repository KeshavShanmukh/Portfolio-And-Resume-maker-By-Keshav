const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting demo data seeding...');

  // Use plaintext passwords if enabled, otherwise hash them
  const storePlain = process.env.PLAINTEXT_PASSWORDS === 'true';
  const adminPassword = storePlain ? 'admin123' : await require('bcryptjs').hash('admin123', 10);
  const demoPassword = storePlain ? 'demo123' : await require('bcryptjs').hash('demo123', 10);

  // Create users
  console.log('📝 Creating users...');
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@portfoliomaker.com',
      password: adminPassword,
      role: 'ADMIN',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  });

  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@portfoliomaker.com',
      password: demoPassword,
      role: 'USER',
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    }
  });

  console.log(`✅ Users created: admin (id: ${adminUser.id}), demo (id: ${demoUser.id})`);

  // Create Developer Portfolio
  console.log('📁 Creating Developer Portfolio...');
  const devPortfolio = await prisma.portfolio.create({
    data: {
      userId: demoUser.id,
      title: 'John Developer - Full Stack Portfolio',
      description: 'A professional portfolio showcasing full-stack development skills and projects',
      builderType: 'DRAG_DROP',
      theme: 'developer',
      isPublished: true,
      sections: {
        create: [
          {
            type: 'hero',
            position: 1,
            content: JSON.stringify({
              name: 'John Developer',
              role: 'Senior Full Stack Developer',
              tagline: 'Building scalable web applications with modern technologies',
              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
            })
          },
          {
            type: 'about',
            position: 2,
            content: JSON.stringify({
              description: 'I am a passionate full-stack developer with 5+ years of experience building web applications. I specialize in React, Node.js, and cloud technologies. I love solving complex problems and creating user-friendly solutions that make a real impact.'
            })
          },
          {
            type: 'skills',
            position: 3,
            content: JSON.stringify({
              skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git']
            })
          },
          {
            type: 'projects',
            position: 4,
            content: JSON.stringify({
              title: 'E-Commerce Platform',
              description: 'Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL. Features include user authentication, payment integration, and inventory management.',
              github: 'https://github.com/johndeveloper/ecommerce',
              live: 'https://ecommerce-demo.com',
              image: 'https://via.placeholder.com/400x200?text=E-Commerce'
            })
          },
          {
            type: 'projects',
            position: 5,
            content: JSON.stringify({
              title: 'Task Management App',
              description: 'A collaborative task management application with real-time updates using Socket.io and React.',
              github: 'https://github.com/johndeveloper/taskapp',
              live: 'https://taskapp-demo.com',
              image: 'https://via.placeholder.com/400x200?text=Task+App'
            })
          },
          {
            type: 'experience',
            position: 6,
            content: JSON.stringify({
              company: 'TechCorp Inc.',
              role: 'Senior Developer',
              duration: '2021 - Present',
              description: 'Leading development of enterprise applications using React and Node.js. Mentoring junior developers and implementing best practices.'
            })
          },
          {
            type: 'education',
            position: 7,
            content: JSON.stringify({
              institution: 'University of Technology',
              degree: 'B.S. Computer Science',
              year: '2017 - 2021',
              description: 'Graduated with honors. Focus on software engineering and web technologies.'
            })
          },
          {
            type: 'certifications',
            position: 8,
            content: JSON.stringify({
              name: 'AWS Certified Developer',
              issuer: 'Amazon Web Services',
              date: '2023',
              credentialUrl: 'https://aws.amazon.com/verification'
            })
          },
          {
            type: 'testimonials',
            position: 9,
            content: JSON.stringify({
              name: 'Sarah Johnson',
              designation: 'CTO',
              company: 'TechStart Inc.',
              review: "John is an exceptional developer who consistently delivers high-quality work. His ability to understand complex requirements and translate them into elegant solutions is remarkable.",
              photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
            })
          },
          {
            type: 'contact',
            position: 10,
            content: JSON.stringify({
              email: 'john@developer.com',
              linkedin: 'https://linkedin.com/in/johndeveloper',
              github: 'https://github.com/johndeveloper'
            })
          }
        ]
      }
    }
  });

  console.log('✅ Developer Portfolio created');

  // Create Student Portfolio
  console.log('📁 Creating Student Portfolio...');
  const studentPortfolio = await prisma.portfolio.create({
    data: {
      userId: demoUser.id,
      title: 'Emily Student - CS Student Portfolio',
      description: 'A student portfolio showcasing academic projects and learning journey',
      builderType: 'FORM',
      theme: 'student',
      isPublished: true,
      sections: {
        create: [
          {
            type: 'hero',
            position: 1,
            content: JSON.stringify({
              name: 'Emily Student',
              role: 'Computer Science Student',
              tagline: 'Aspiring software engineer passionate about AI and web development',
              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily'
            })
          },
          {
            type: 'about',
            position: 2,
            content: JSON.stringify({
              description: 'I am a junior at Boston University studying Computer Science. I am passionate about artificial intelligence and web development. Currently looking for internship opportunities to gain real-world experience.'
            })
          },
          {
            type: 'skills',
            position: 3,
            content: JSON.stringify({
              skills: ['Python', 'Java', 'JavaScript', 'React', 'HTML/CSS', 'SQL', 'Git', 'Machine Learning']
            })
          },
          {
            type: 'projects',
            position: 4,
            content: JSON.stringify({
              title: 'AI Chatbot',
              description: 'Built a conversational AI chatbot using Python and TensorFlow for customer service automation.',
              github: 'https://github.com/emilystudent/aichatbot',
              live: '',
              image: 'https://via.placeholder.com/400x200?text=AI+Chatbot'
            })
          },
          {
            type: 'education',
            position: 5,
            content: JSON.stringify({
              institution: 'Boston University',
              degree: 'B.S. Computer Science',
              year: '2022 - 2026',
              description: 'Current GPA: 3.8/4.0. Relevant coursework: Data Structures, Algorithms, Database Systems, Machine Learning.'
            })
          },
          {
            type: 'certifications',
            position: 6,
            content: JSON.stringify({
              name: 'AWS Cloud Practitioner',
              issuer: 'Amazon Web Services',
              date: '2024',
              credentialUrl: ''
            })
          },
          {
            type: 'contact',
            position: 7,
            content: JSON.stringify({
              email: 'emily@student.edu',
              linkedin: 'https://linkedin.com/in/emilystudent',
              github: 'https://github.com/emilystudent'
            })
          }
        ]
      }
    }
  });

  console.log('✅ Student Portfolio created');

  // Create Creative Portfolio
  console.log('📁 Creating Creative Portfolio...');
  const creativePortfolio = await prisma.portfolio.create({
    data: {
      userId: demoUser.id,
      title: 'Alex Creative - Designer Portfolio',
      description: 'A creative portfolio showcasing design work and visual projects',
      builderType: 'DRAG_DROP',
      theme: 'creative',
      isPublished: true,
      sections: {
        create: [
          {
            type: 'hero',
            position: 1,
            content: JSON.stringify({
              name: 'Alex Creative',
              role: 'UI/UX Designer & Developer',
              tagline: 'Creating beautiful digital experiences that users love',
              image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
            })
          },
          {
            type: 'about',
            position: 2,
            content: JSON.stringify({
              description: 'I am a creative designer and developer who loves blending aesthetics with functionality. With 4 years of experience, I have worked with startups and established brands to create memorable digital experiences.'
            })
          },
          {
            type: 'skills',
            position: 3,
            content: JSON.stringify({
              skills: ['Figma', 'Adobe Creative Suite', 'React', 'CSS/SCSS', 'JavaScript', 'Prototyping', 'User Research', 'Design Systems']
            })
          },
          {
            type: 'services',
            position: 4,
            content: JSON.stringify({
              name: 'UI/UX Design',
              description: 'Creating intuitive and beautiful user interfaces that enhance user experience and drive engagement.',
              icon: '🎨'
            })
          },
          {
            type: 'projects',
            position: 5,
            content: JSON.stringify({
              title: 'Mobile App Design',
              description: 'Designed a modern mobile application for fitness tracking with focus on user experience and accessibility.',
              github: '',
              live: 'https://dribbble.com/alexcreative',
              image: 'https://via.placeholder.com/400x200?text=Mobile+App'
            })
          },
          {
            type: 'testimonials',
            position: 6,
            content: JSON.stringify({
              name: 'Michael Brown',
              designation: 'Product Manager',
              company: 'Design Studio',
              review: "Alex's designs are not only beautiful but also highly functional. The attention to detail and user-centered approach resulted in a 40% increase in user engagement.",
              photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael'
            })
          },
          {
            type: 'contact',
            position: 7,
            content: JSON.stringify({
              email: 'alex@creative.design',
              linkedin: 'https://linkedin.com/in/alexcreative',
              github: ''
            })
          }
        ]
      }
    }
  });

  console.log('✅ Creative Portfolio created');

  // Create ATS Resume
  console.log('📄 Creating ATS Resume...');
  const atsResume = await prisma.resume.create({
    data: {
      userId: demoUser.id,
      title: 'John Developer - ATS Resume',
      builderType: 'FORM',
      theme: 'ats',
      isPublished: true,
      sections: {
        create: [
          {
            type: 'contact',
            position: 1,
            content: JSON.stringify({
              name: 'John Developer',
              email: 'john@developer.com',
              phone: '(555) 123-4567',
              location: 'San Francisco, CA',
              linkedin: 'linkedin.com/in/johndeveloper',
              github: 'github.com/johndeveloper'
            })
          },
          {
            type: 'summary',
            position: 2,
            content: JSON.stringify({
              text: 'Results-driven Senior Full Stack Developer with 5+ years of experience in designing and implementing scalable web applications. Proven track record of leading technical teams and delivering high-quality solutions. Expert in React, Node.js, and cloud technologies with strong problem-solving skills.'
            })
          },
          {
            type: 'skills',
            position: 3,
            content: JSON.stringify({
              skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD']
            })
          },
          {
            type: 'experience',
            position: 4,
            content: JSON.stringify({
              items: [
                {
                  company: 'TechCorp Inc.',
                  role: 'Senior Full Stack Developer',
                  duration: '2021 - Present',
                  description: 'Leading development of enterprise applications using React and Node.js. Implemented microservices architecture serving 1M+ users. Reduced system latency by 40% through optimization. Mentoring team of 5 junior developers.'
                },
                {
                  company: 'StartupXYZ',
                  role: 'Full Stack Developer',
                  duration: '2019 - 2021',
                  description: 'Built and maintained web applications using React and Express.js. Developed RESTful APIs and integrated third-party services. Implemented automated testing reducing bugs by 60%.'
                }
              ]
            })
          },
          {
            type: 'education',
            position: 5,
            content: JSON.stringify({
              items: [
                {
                  institution: 'University of Technology',
                  degree: 'Bachelor of Science in Computer Science',
                  year: '2017 - 2021',
                  gpa: '3.9/4.0',
                  relevantCoursework: 'Data Structures, Algorithms, Database Systems, Software Engineering'
                }
              ]
            })
          },
          {
            type: 'projects',
            position: 6,
            content: JSON.stringify({
              items: [
                {
                  name: 'E-Commerce Platform',
                  description: 'Full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include payment integration and inventory management.',
                  technologies: 'React, Node.js, PostgreSQL, Stripe'
                },
                {
                  name: 'Task Management App',
                  description: 'Real-time collaborative task management application with Socket.io integration.',
                  technologies: 'React, Node.js, Socket.io, MongoDB'
                }
              ]
            })
          },
          {
            type: 'certifications',
            position: 7,
            content: JSON.stringify({
              items: [
                {
                  name: 'AWS Certified Developer - Associate',
                  issuer: 'Amazon Web Services',
                  date: '2023'
                },
                {
                  name: 'Professional Scrum Master I',
                  issuer: 'Scrum.org',
                  date: '2022'
                }
              ]
            })
          },
          {
            type: 'languages',
            position: 8,
            content: JSON.stringify({
              languages: ['English (Native)', 'Spanish (Professional)']
            })
          },
          {
            type: 'interests',
            position: 9,
            content: JSON.stringify({
              interests: ['Open Source Contribution', 'Tech Blogging', 'Hackathons']
            })
          },
          {
            type: 'references',
            position: 10,
            content: JSON.stringify({
              items: [
                {
                  name: 'Sarah Johnson',
                  designation: 'Engineering Manager',
                  company: 'TechCorp Inc.',
                  email: 'sarah@techcorp.com',
                  phone: '(555) 987-6543',
                  relationship: 'Former Manager'
                },
                {
                  name: 'Michael Chen',
                  designation: 'CTO',
                  company: 'StartupXYZ',
                  email: 'michael@startupxyz.com',
                  phone: '(555) 456-7890',
                  relationship: 'Former Manager'
                }
              ]
            })
          }
        ]
      }
    }
  });

  console.log('✅ ATS Resume created');

  // Create Student Resume
  console.log('📄 Creating Student Resume...');
  const studentResume = await prisma.resume.create({
    data: {
      userId: demoUser.id,
      title: 'Emily Student - Entry Level Resume',
      builderType: 'FORM',
      theme: 'student',
      isPublished: true,
      sections: {
        create: [
          {
            type: 'contact',
            position: 1,
            content: JSON.stringify({
              name: 'Emily Student',
              email: 'emily@student.edu',
              phone: '(555) 234-5678',
              location: 'Boston, MA',
              linkedin: 'linkedin.com/in/emilystudent',
              github: 'github.com/emilystudent'
            })
          },
          {
            type: 'summary',
            position: 2,
            content: JSON.stringify({
              text: 'Motivated Computer Science student with strong foundation in software development and machine learning. Seeking internship opportunities to apply academic knowledge in real-world projects. Quick learner with excellent problem-solving skills.'
            })
          },
          {
            type: 'education',
            position: 3,
            content: JSON.stringify({
              items: [
                {
                  institution: 'Boston University',
                  degree: 'Bachelor of Science in Computer Science',
                  year: '2022 - 2026',
                  gpa: '3.8/4.0',
                  relevantCoursework: 'Data Structures, Algorithms, Machine Learning, Database Systems, Web Development'
                }
              ]
            })
          },
          {
            type: 'skills',
            position: 4,
            content: JSON.stringify({
              skills: ['Python', 'Java', 'JavaScript', 'React', 'HTML/CSS', 'SQL', 'Git', 'TensorFlow', 'Pandas']
            })
          },
          {
            type: 'experience',
            position: 5,
            content: JSON.stringify({
              items: [
                {
                  company: 'University Research Lab',
                  role: 'Research Assistant',
                  duration: '2023 - Present',
                  description: 'Assisting with machine learning research on natural language processing. Implemented data preprocessing pipelines and trained models using TensorFlow.'
                },
                {
                  company: 'Tech Club',
                  role: 'Web Developer',
                  duration: '2022 - 2023',
                  description: 'Developed and maintained club website using React. Organized coding workshops for 50+ students.'
                }
              ]
            })
          },
          {
            type: 'projects',
            position: 6,
            content: JSON.stringify({
              items: [
                {
                  name: 'AI Chatbot',
                  description: 'Built a conversational AI chatbot using Python and TensorFlow for customer service automation.',
                  technologies: 'Python, TensorFlow, Flask'
                },
                {
                  name: 'Course Planner App',
                  description: 'Mobile app for students to plan and track their coursework with degree requirements.',
                  technologies: 'React Native, Firebase'
                }
              ]
            })
          },
          {
            type: 'certifications',
            position: 7,
            content: JSON.stringify({
              items: [
                {
                  name: 'AWS Cloud Practitioner',
                  issuer: 'Amazon Web Services',
                  date: '2024'
                }
              ]
            })
          },
          {
            type: 'languages',
            position: 8,
            content: JSON.stringify({
              languages: ['English (Native)', 'Mandarin (Conversational)']
            })
          },
          {
            type: 'interests',
            position: 9,
            content: JSON.stringify({
              interests: ['Machine Learning', 'Open Source', 'Hackathons', 'Tech Blogging']
            })
          }
        ]
      }
    }
  });

  console.log('✅ Student Resume created');

  // Create Professional Resume
  console.log('📄 Creating Professional Resume...');
  const professionalResume = await prisma.resume.create({
    data: {
      userId: demoUser.id,
      title: 'Sarah Professional - Senior Developer Resume',
      builderType: 'FORM',
      theme: 'professional',
      isPublished: true,
      sections: {
        create: [
          {
            type: 'contact',
            position: 1,
            content: JSON.stringify({
              name: 'Sarah Professional',
              email: 'sarah@professional.dev',
              phone: '(555) 345-6789',
              location: 'Seattle, WA',
              linkedin: 'linkedin.com/in/sarahprofessional',
              github: 'github.com/sarahprofessional'
            })
          },
          {
            type: 'summary',
            position: 2,
            content: JSON.stringify({
              text: 'Senior Software Engineer with 8+ years of experience in designing and implementing distributed systems. Proven leadership in managing cross-functional teams and delivering enterprise-scale solutions. Expert in cloud architecture, microservices, and agile methodologies.'
            })
          },
          {
            type: 'skills',
            position: 3,
            content: JSON.stringify({
              skills: ['Java', 'Python', 'Go', 'Kubernetes', 'AWS', 'GCP', 'PostgreSQL', 'Redis', 'Kafka', 'System Design', 'Team Leadership', 'Agile']
            })
          },
          {
            type: 'experience',
            position: 4,
            content: JSON.stringify({
              items: [
                {
                  company: 'CloudScale Technologies',
                  role: 'Senior Software Engineer',
                  duration: '2020 - Present',
                  description: 'Leading development of cloud-native microservices architecture. Designed systems handling 10M+ daily active users. Reduced infrastructure costs by 30% through optimization. Managing team of 8 engineers.'
                },
                {
                  company: 'Enterprise Solutions Corp',
                  role: 'Software Engineer',
                  duration: '2017 - 2020',
                  description: 'Developed enterprise applications using Java and Spring Boot. Implemented CI/CD pipelines reducing deployment time by 50%. Led migration from monolith to microservices.'
                },
                {
                  company: 'Tech Innovations Inc',
                  role: 'Junior Developer',
                  duration: '2015 - 2017',
                  description: 'Built web applications using Python and Django. Collaborated with design team to implement responsive UIs. Participated in code reviews and agile ceremonies.'
                }
              ]
            })
          },
          {
            type: 'education',
            position: 5,
            content: JSON.stringify({
              items: [
                {
                  institution: 'Stanford University',
                  degree: 'Master of Science in Computer Science',
                  year: '2013 - 2015',
                  gpa: '3.9/4.0'
                },
                {
                  institution: 'UC Berkeley',
                  degree: 'Bachelor of Science in Computer Science',
                  year: '2009 - 2013',
                  gpa: '3.8/4.0'
                }
              ]
            })
          },
          {
            type: 'projects',
            position: 6,
            content: JSON.stringify({
              items: [
                {
                  name: 'Distributed Cache System',
                  description: 'Built a distributed caching layer handling 100K+ requests/sec with 99.99% uptime.',
                  technologies: 'Go, Redis, Kubernetes'
                },
                {
                  name: 'API Gateway',
                  description: 'Developed scalable API gateway with rate limiting, authentication, and monitoring.',
                  technologies: 'Java, Spring Boot, AWS'
                }
              ]
            })
          },
          {
            type: 'certifications',
            position: 7,
            content: JSON.stringify({
              items: [
                {
                  name: 'AWS Solutions Architect Professional',
                  issuer: 'Amazon Web Services',
                  date: '2022'
                },
                {
                  name: 'Certified Kubernetes Administrator',
                  issuer: 'CNCF',
                  date: '2021'
                }
              ]
            })
          },
          {
            type: 'languages',
            position: 8,
            content: JSON.stringify({
              languages: ['English (Native)', 'French (Professional)']
            })
          },
          {
            type: 'interests',
            position: 9,
            content: JSON.stringify({
              interests: ['Cloud Architecture', 'Open Source', 'Technical Writing', 'Mentoring']
            })
          },
          {
            type: 'references',
            position: 10,
            content: JSON.stringify({
              items: [
                {
                  name: 'David Kim',
                  designation: 'VP of Engineering',
                  company: 'CloudScale Technologies',
                  email: 'david@cloudscale.com',
                  phone: '(555) 111-2222',
                  relationship: 'Current Manager'
                }
              ]
            })
          }
        ]
      }
    }
  });

  console.log('✅ Professional Resume created');

  // Create ATS Report
  console.log('📊 Creating ATS Report...');
  const atsReport = await prisma.aTSReport.create({
    data: {
      userId: demoUser.id,
      resumeId: atsResume.id,
      score: 95,
      strengths: JSON.stringify([
        'Contact information is complete',
        'Professional summary is present and detailed',
        'Skills section is comprehensive',
        'Work experience is included',
        'Education is included',
        'Projects are included',
        'Certifications are included',
        'References are included',
        'References are complete with contact information'
      ]),
      weaknesses: JSON.stringify([]),
      suggestions: JSON.stringify([
        'Excellent resume! Consider adding more quantifiable achievements.'
      ]),
      keywords: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'])
    }
  });

  console.log('✅ ATS Report created');

  // Create sample uploaded resume PDF record
  console.log('📋 Creating uploaded resume PDF record...');
  const uploadedResume = await prisma.uploadedResume.create({
    data: {
      userId: demoUser.id,
      fileName: 'demo_resume.pdf',
      filePath: '/uploads/demo_resume.pdf',
      extractedData: JSON.stringify({
        name: 'John Developer',
        email: 'john@developer.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5 years'
      })
    }
  });

  console.log('✅ Uploaded Resume PDF record created');

  // Create sample Resume PDF record
  console.log('📋 Creating Resume PDF record...');
  const resumePDF = await prisma.resumePDF.create({
    data: {
      userId: demoUser.id,
      username: 'demo',
      pdfFileName: 'demo_generated_resume.pdf',
      pdfPath: '/uploads/pdfs/demo_generated_resume.pdf'
    }
  });

  console.log('✅ Resume PDF record created');

  console.log('\n🎉 Demo data seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: username=admin, password=admin123');
  console.log('   Demo User: username=demo, password=demo123');
  console.log('\n📊 Created:');
  console.log('   - 2 users (admin, demo)');
  console.log('   - 3 portfolios (Developer, Student, Creative)');
  console.log('   - 3 resumes (ATS, Student, Professional)');
  console.log('   - 1 ATS report');
  console.log('   - 1 uploaded resume PDF record');
  console.log('   - 1 generated resume PDF record');
}

main()
  .catch(e => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });