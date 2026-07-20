import { Component, OnInit } from '@angular/core';
import { CommunityForumType, CommunityPost, CommunityPostType } from '../../model/community.model';
import { CommunityService } from '../../service/community.service';

interface LoggedInUser {
  _id?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
  profilepicture?: string;
}

@Component({
  selector: 'app-community-page',
  templateUrl: './community-page.component.html',
  styleUrl: './community-page.component.css',
})
export class CommunityPageComponent implements OnInit {
  posts: CommunityPost[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  commentDrafts: Record<string, string> = {};
  reportDrafts: Record<string, string> = {};
  activeSort = 'trending';
  activeForum: CommunityForumType | '' = '';
  activityCount = 0;

  postForm = {
    type: 'story' as CommunityPostType,
    forumType: 'route' as CommunityForumType,
    routeName: '',
    destination: '',
    title: '',
    content: '',
    tips: '',
    tags: '',
    photos: [] as string[],
  };

  forumOptions: Array<{ label: string; value: CommunityForumType | ''; icon: string }> = [
    { label: 'All forums', value: '', icon: 'forum' },
    { label: 'Route forums', value: 'route', icon: 'route' },
    { label: 'Destination forums', value: 'destination', icon: 'location_on' },
    { label: 'Travel advice', value: 'advice', icon: 'tips_and_updates' },
  ];

  constructor(private communityService: CommunityService) {}

  ngOnInit(): void {
    this.loadPosts();
    const user = this.currentUser;
    if (user?._id) {
      this.communityService.getActivity(user._id).subscribe({
        next: (activity) => {
          this.activityCount = activity.posts.length + activity.comments.length;
        },
      });
    }
  }

  get currentUser(): LoggedInUser | null {
    const rawUser = sessionStorage.getItem('Loggedinuser');
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as LoggedInUser;
    } catch {
      return null;
    }
  }

  get isVerified(): boolean {
    const user = this.currentUser;
    return Boolean(user?._id && user.email);
  }

  get isAdmin(): boolean {
    return Boolean(this.currentUser?.email?.endsWith('@tedbus.admin'));
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.communityService
      .getPosts({
        sort: this.activeSort,
        forumType: this.activeForum,
      })
      .subscribe({
        next: (posts) => {
          this.posts = posts;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Community posts are taking longer than expected. Please retry.';
          this.isLoading = false;
        },
      });
  }

  setForum(forum: CommunityForumType | ''): void {
    this.activeForum = forum;
    this.loadPosts();
  }

  setSort(sort: string): void {
    this.activeSort = sort;
    this.loadPosts();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, 4);
    this.postForm.photos = [];
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') this.postForm.photos = [...this.postForm.photos, reader.result];
      };
      reader.readAsDataURL(file);
    });
  }

  createPost(): void {
    const user = this.currentUser;
    if (!this.isVerified || !user?._id || !user.email) {
      this.errorMessage = 'Sign in with Google before publishing in the community.';
      return;
    }
    if (this.postForm.title.trim().length < 6 || this.postForm.content.trim().length < 20) {
      this.errorMessage = 'Add a clearer title and at least 20 characters of travel detail.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.communityService
      .createPost({
        ...this.postForm,
        authorId: user._id,
        authorName: user.name || 'Verified traveler',
        authorEmail: user.email,
        authorAvatar: user.profilePicture || user.profilepicture,
        tips: this.postForm.tips
          .split('\n')
          .map((tip) => tip.trim())
          .filter(Boolean),
        tags: this.postForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Your community post is live.';
          this.isSaving = false;
          this.postForm = {
            type: 'story',
            forumType: 'route',
            routeName: '',
            destination: '',
            title: '',
            content: '',
            tips: '',
            tags: '',
            photos: [],
          };
          this.loadPosts();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Unable to publish this post right now.';
          this.isSaving = false;
        },
      });
  }

  toggleLike(post: CommunityPost): void {
    const userId = this.currentUser?._id;
    if (!post._id || !userId) {
      this.errorMessage = 'Sign in before liking posts.';
      return;
    }
    this.communityService.toggleLike(post._id, userId).subscribe({
      next: (updatedPost) => this.replacePost(updatedPost),
      error: () => (this.errorMessage = 'Unable to update like. Please retry.'),
    });
  }

  addComment(post: CommunityPost): void {
    const user = this.currentUser;
    const content = post._id ? this.commentDrafts[post._id]?.trim() : '';
    if (!post._id || !user?._id) {
      this.errorMessage = 'Sign in before commenting.';
      return;
    }
    if (!content) return;
    this.communityService.addComment(post._id, user._id, user.name || 'Traveler', content).subscribe({
      next: (updatedPost) => {
        this.commentDrafts[post._id || ''] = '';
        this.replacePost(updatedPost);
      },
      error: () => (this.errorMessage = 'Unable to add comment. Please retry.'),
    });
  }

  reportPost(post: CommunityPost): void {
    const userId = this.currentUser?._id;
    const reason = post._id ? this.reportDrafts[post._id]?.trim() || 'Inappropriate content' : '';
    if (!post._id || !userId) {
      this.errorMessage = 'Sign in before reporting content.';
      return;
    }
    this.communityService.reportPost(post._id, userId, reason).subscribe({
      next: (updatedPost) => {
        this.successMessage = 'Thanks, our moderation team will review this.';
        this.replacePost(updatedPost);
      },
      error: () => (this.errorMessage = 'Unable to submit the report. Please retry.'),
    });
  }

  moderate(post: CommunityPost, status: 'visible' | 'flagged' | 'hidden'): void {
    const adminEmail = this.currentUser?.email || '';
    if (!post._id) return;
    this.communityService.moderatePost(post._id, status, adminEmail, 'Reviewed from community dashboard').subscribe({
      next: () => {
        this.successMessage = 'Moderation status updated.';
        this.loadPosts();
      },
      error: () => (this.errorMessage = 'Admin moderation access is required.'),
    });
  }

  hasLiked(post: CommunityPost): boolean {
    const userId = this.currentUser?._id;
    return Boolean(userId && post.likes.includes(userId));
  }

  sharePost(post: CommunityPost, channel: 'native' | 'twitter' | 'whatsapp'): void {
    const text = `${post.title} - Tedbus Community`;
    const targetUrl = `${window.location.origin}/community`;
    if (channel === 'native' && navigator.share) {
      void navigator.share({ title: post.title, text, url: targetUrl });
      return;
    }
    const encoded = encodeURIComponent(`${text} ${targetUrl}`);
    const shareUrl =
      channel === 'twitter'
        ? `https://twitter.com/intent/tweet?text=${encoded}`
        : `https://wa.me/?text=${encoded}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  trackByPostId(_: number, post: CommunityPost): string {
    return post._id || post.title;
  }

  private replacePost(updatedPost: CommunityPost): void {
    this.posts = this.posts.map((post) => (post._id === updatedPost._id ? updatedPost : post));
  }
}
