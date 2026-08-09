export const servicesData = [
  {
    slug: 'individual-therapy',
    title: 'Individual Therapy',
    shortDescription: 'One-on-one sessions tailored to your unique needs.',
    fullDescription: 'Individual therapy provides a safe, confidential space to explore your thoughts, feelings, and behaviors. Whether you are dealing with anxiety, depression, stress, or life transitions, these one-on-one sessions are tailored specifically to your unique needs and goals. We use evidence-based approaches to help you develop coping strategies, build resilience, and foster personal growth.',
    benefits: [
      'Personalized treatment plans',
      'Confidential and non-judgmental environment',
      'Develop effective coping mechanisms',
      'Improve self-awareness and emotional regulation'
    ],
    duration: '50 minutes',
    price: '₹2000'
  },
  {
    slug: 'couples-therapy',
    title: 'Couples Therapy',
    shortDescription: 'Navigate relationship challenges and strengthen your bond.',
    fullDescription: 'Couples therapy helps partners improve communication, resolve conflicts, and rebuild trust. Whether you are facing a specific crisis, experiencing a loss of connection, or simply wanting to strengthen your relationship, we provide a neutral ground to help you understand each other better. Our approach focuses on breaking negative cycles and fostering deeper intimacy and emotional safety.',
    benefits: [
      'Improve communication skills',
      'Resolve deep-seated conflicts',
      'Rebuild trust and intimacy',
      'Learn tools for future conflict resolution'
    ],
    duration: '60 minutes',
    price: '₹3000'
  },
  {
    slug: 'family-therapy',
    title: 'Family Therapy',
    shortDescription: 'Resolve conflicts and foster healthier family dynamics.',
    fullDescription: 'Family dynamics can be complex and challenging. Family therapy aims to address issues affecting the health and functioning of the family unit. By giving everyone a voice, we work to resolve conflicts, improve communication, and create a more supportive home environment. This is especially helpful during major life transitions, behavioral issues with children or teens, or when dealing with loss.',
    benefits: [
      'Enhance family communication',
      'Resolve persistent conflicts',
      'Support through life transitions',
      'Strengthen family bonds and understanding'
    ],
    duration: '60 minutes',
    price: '₹3500'
  },
  {
    slug: 'cbt',
    title: 'Cognitive Behavioral Therapy (CBT)',
    shortDescription: 'A structured approach to identify and change negative thought patterns.',
    fullDescription: 'Cognitive Behavioral Therapy (CBT) is a highly effective, evidence-based treatment for a wide range of psychological issues, particularly anxiety and depression. It focuses on identifying and challenging negative or unhelpful thought patterns and behaviors. By learning to change how you think about situations, you can significantly alter how you feel and respond, leading to long-lasting positive changes.',
    benefits: [
      'Evidence-based and highly effective',
      'Practical and goal-oriented',
      'Learn skills to use for a lifetime',
      'Relieve symptoms of anxiety and depression'
    ],
    duration: '50 minutes',
    price: '₹2500'
  },
  {
    slug: 'emdr',
    title: 'Trauma Therapy (EMDR)',
    shortDescription: 'EMDR for PTSD and trauma recovery.',
    fullDescription: 'Eye Movement Desensitization and Reprocessing (EMDR) for PTSD, complex trauma, and adverse life experiences. A structured, evidence-based approach to trauma recovery.',
    benefits: [
      'PTSD & complex trauma recovery',
      'Childhood trauma processing',
      'Accident & medical trauma',
      'Phobias & fears reduction'
    ],
    duration: '90 minutes',
    price: '₹4000'
  },
  {
    slug: 'online-consultation',
    title: 'Online Consultation',
    shortDescription: 'Secure video sessions for therapy and follow-ups.',
    fullDescription: 'Secure video consultation for follow-ups, medication review, initial assessments, or ongoing therapy. We use a HIPAA-compliant platform with end-to-end encryption.',
    benefits: [
      'Convenient access from home',
      'Secure & private video link',
      'Initial assessments & follow-ups',
      'Flexible scheduling'
    ],
    duration: '30 minutes',
    price: '₹1500'
  }
];

export function getServiceBySlug(slug: string) {
  return servicesData.find(service => service.slug === slug);
}
