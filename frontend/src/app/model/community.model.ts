export type CommunityPostType = 'story' | 'tip' | 'discussion';
export type CommunityForumType = 'route' | 'destination' | 'advice';
export type CommunityStatus = 'visible' | 'flagged' | 'hidden';

export interface CommunityComment {
  _id?: string;
  authorId: string;
  authorName: string;
  content: string;
  isHidden?: boolean;
  createdAt?: string;
}

export interface CommunityReport {
  userId: string;
  reason: string;
  createdAt?: string;
}

export interface CommunityPost {
  _id?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  type: CommunityPostType;
  forumType: CommunityForumType;
  routeName?: string;
  destination?: string;
  title: string;
  content: string;
  tips: string[];
  photos: string[];
  tags: string[];
  likes: string[];
  comments: CommunityComment[];
  reports: CommunityReport[];
  status: CommunityStatus;
  adminNote?: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  trendingScore?: number;
}

export interface CommunityActivity {
  posts: CommunityPost[];
  comments: Array<CommunityComment & { postTitle: string; postId: string }>;
}
