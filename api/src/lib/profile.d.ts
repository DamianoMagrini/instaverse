export interface ProfileResponse {
  logging_page_id: string;
  show_suggested_profiles: boolean;
  show_follow_dialog: boolean;
  toast_content_on_load: null;
  graphql: {
    user: User;
  };
}

export interface User {
  biography: string;
  blocked_by_viewer: boolean;
  country_block: boolean;
  external_url: string;
  external_url_linkshimmed: string;
  edge_followed_by: EdgeFollowClass;
  followed_by_viewer: boolean;
  edge_follow: EdgeFollowClass;
  follows_viewer: boolean;
  full_name: string;
  has_channel: boolean;
  has_blocked_viewer: boolean;
  highlight_reel_count: number;
  has_requested_viewer: boolean;
  id: string;
  is_business_account: boolean;
  is_joined_recently: boolean;
  business_category_name: string | null;
  is_private: boolean;
  is_verified: boolean;
  edge_mutual_followed_by: EdgeMutualFollowedBy;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  requested_by_viewer: boolean;
  username: string;
  connected_fb_page: string | null;
  edge_felix_combined_post_uploads: MediaEdge;
  edge_felix_combined_draft_uploads: MediaEdge;
  edge_felix_video_timeline: MediaEdge;
  edge_felix_drafts: MediaEdge;
  edge_felix_pending_post_uploads: MediaEdge;
  edge_felix_pending_draft_uploads: MediaEdge;
  edge_owner_to_timeline_media: MediaEdge;
  edge_saved_media: MediaEdge;
  edge_media_collections: MediaEdge;
}

export interface MediaEdge {
  count: number;
  page_info: PageInfo;
  edges: EdgeFelixCombinedDraftUploadsEdge[];
}

export interface EdgeFelixCombinedDraftUploadsEdge {
  node: MediaNode;
}

export interface MediaNode {
  __typename: Typename;
  id: string;
  edge_media_to_caption: EdgeMediaToCaption;
  shortcode: string;
  edge_media_to_comment: EdgeFollowClass;
  comments_disabled: boolean;
  taken_at_timestamp: number;
  dimensions: MediaDimensions;
  display_url: string;
  edge_liked_by: EdgeFollowClass;
  edge_media_preview_like: EdgeFollowClass;
  location: Location | null;
  gating_info: null;
  media_preview: string | null;
  owner: MediaOwner;
  thumbnail_src: string;
  thumbnail_resources: ThumbnailResource[];
  is_video: boolean;
  accessibility_caption: string;
}

export enum Typename {
  GraphImage = 'GraphImage',
  GraphSidecar = 'GraphSidecar'
}

export interface MediaDimensions {
  height: number;
  width: number;
}

export interface EdgeFollowClass {
  count: number;
}

export interface EdgeMediaToCaption {
  edges: EdgeMediaToCaptionEdge[];
}

export interface EdgeMediaToCaptionEdge {
  node: EdgeMediaToCaptionNode;
}

export interface EdgeMediaToCaptionNode {
  text: string;
}

export interface Location {
  id: string;
  has_public_page: boolean;
  name: string;
  slug: string;
}

export interface MediaOwner {
  id: string;
  username: string;
}

export interface ThumbnailResource {
  src: string;
  config_width: number;
  config_height: number;
}

export interface PageInfo {
  has_next_page: boolean;
  end_cursor: string | null;
}

export interface EdgeMutualFollowedBy {
  count: number;
  edges: any[];
}
