import { apiClient } from '@/shared/api/client';

export const getYoutubeStatus = () =>
  apiClient.get('api/auth/youtube/status').json<{ youtube_channel_id?: string; youtube_channel_title?: string; youtube_linked_at?: string }>();

export const connectYoutube = (code: string) =>
  apiClient.post('api/auth/youtube/connect', { json: { code } });

export const disconnectYoutube = () =>
  apiClient.delete('api/auth/youtube/disconnect');
