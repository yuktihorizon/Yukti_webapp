/**
 * Default Service page document (Mongo-safe JSON).
 * Images use stable HTTPS URLs; replace via admin or re-seed.
 */
const defaultServicePageDocument = {
  pageKey: 'main',
  hero: {
    backgroundImage:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1920&q=80',
    overlayOpacity: 0.3,
    words: [
      { text: 'SHAPE', layoutClass: 'hero-word-right' },
      { text: 'TEST', layoutClass: 'hero-word-center' },
      { text: 'REFINE.', layoutClass: 'hero-word-right2' },
    ],
  },
  capabilitiesIntro: {
    titleLines: ['OUR', 'CAPABILITIES'],
    paragraphs: [
      'At Yukti, we support you in the development of your furniture with a complete and tailored approach. From initial concept to final validation, every stage is carefully managed to ensure clarity, consistency, and precision throughout the process.',
      'Our work combines technical expertise with a disciplined approach to execution shaping components through precise lathe craftsmanship and validating designs through structured prototyping. Each step allows us to test proportions, refine details, and resolve challenges before moving forward.',
    ],
  },
  capabilityBlocks: [
    {
      id: 'lathe',
      theme: 'dark',
      number: '01',
      label: 'LATHE',
      headingLines: ['Precision Shaping For', 'Structural Components'],
      paragraphs: [
        'We develop components through controlled lathe processes, ensuring accuracy in form, balance, and proportion. Each piece is shaped with precision to meet structural and design requirements before moving into final assembly.',
      ],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1615876230499-f305cf136832?auto=format&fit=crop&w=1200&q=80',
          alt: 'Lathe workshop',
        },
        {
          src: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
          alt: 'Lathe craftsmanship',
        },
      ],
    },
    {
      id: 'prototyping',
      theme: 'light',
      number: '02',
      label: 'PROTOTYPING',
      headingLines: [
        "Tested Before It's Built",
        'So Nothing Is Left',
        'Unresolved.',
      ],
      paragraphs: [
        'Prototyping is where ideas are tested and refined. We develop working models to study proportions, structure, and usability—ensuring each design performs as intended before moving forward.',
        'Through iteration and evaluation, we resolve details that cannot be defined on paper alone. This process allows us to adjust, improve, and confirm every aspect—reducing uncertainty in the final build.',
      ],
      images: [
        {
          src: 'https://images.unsplash.com/photo-1567538096639-e914084baa99?auto=format&fit=crop&w=1200&q=80',
          alt: 'Prototype furniture',
        },
        {
          src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
          alt: 'Prototyping process',
        },
      ],
    },
  ],
  projectForm: {
    backgroundImage:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1920&q=80',
    overlayOpacity: 0.6,
    titleLines: ['Start your project', 'with clarity'],
    subtitle: 'From shaping to validation—handled end-to-end',
    submitLabel: 'Submit Project Request',
    successToast: 'Project request submitted!',
    errorToast: 'Failed to submit. Please try again.',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Enter your name',
        required: true,
        row: 'top',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
        required: true,
        row: 'top',
      },
      {
        name: 'projectType',
        label: 'Project Type',
        type: 'text',
        placeholder: 'Enter your Project Type',
        required: true,
        row: 'full',
      },
    ],
    apiMap: {
      firstNameKey: 'name',
      emailKey: 'email',
      subjectKey: 'projectType',
      messagePattern: 'Project Type: {{projectType}}',
    },
  },
};

module.exports = { defaultServicePageDocument };
