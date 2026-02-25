import { Challenge } from "@/services/challenge.service";

export const slugifyChallengeTitle = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const getChallengeSlug = (challenge: Challenge): string =>
  slugifyChallengeTitle(challenge.title);
