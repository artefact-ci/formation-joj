import { createFileRoute } from '@tanstack/react-router';
import { LivePage } from '@/features/live/components/live-page';

export const Route = createFileRoute('/direct')({
  component: LivePage,
});
