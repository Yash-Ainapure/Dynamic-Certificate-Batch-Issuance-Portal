import type { Step } from 'react-joyride';

export type RouteStep = Step & {
  id: string;
  route: string;
  target: string;
};

export const tourSteps: RouteStep[] = [
  {
    id: 'dash-welcome',
    route: '/',
    target: '[data-tour="dashboard-welcome"]',
    content: 'Welcome to your Dashboard! We\'ll give you a quick tour.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    id: 'dash-projects',
    route: '/',
    target: '[data-tour="dashboard-projects"]',
    content: 'Create or open a project from here.',
    placement: 'right',
  },
  {
    id: 'project-new-cta',
    route: '/',
    target: '[data-tour="nav-create-project"]',
    content: 'Let\'s create a new project to get started.',
    placement: 'bottom',
  },
  {
    id: 'project-form-name',
    route: '/projects/new',
    target: '[data-tour="project-name"]',
    content: 'Name your project here. and fill all details to create your project.',
    placement: 'right',
  },
  {
    id: 'project-form-submit',
    route: '/projects/new',
    target: '[data-tour="project-submit"]',
    content: 'Click submit to create your project.',
    placement: 'top',
  },
];
