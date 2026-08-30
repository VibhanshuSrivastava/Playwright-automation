import { mergeTests } from '@playwright/test';
import { test as pagesTest } from './pages.fixture';
import { test as projectTest } from './project.fixture';

export const test = mergeTests(pagesTest, projectTest);
export { expect } from '@playwright/test';
export type { Project } from '../api/ProjectsApiClient';
