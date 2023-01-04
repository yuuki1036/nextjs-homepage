export type TSpec = {
  [key: string]: string;
};

export type TPost = {
  slug: string;
  title: string;
  excerpt: string;
  featureNumber?: number;
  otherImage: boolean;
  date: string;
  launch?: string;
  source?: string;
  tag: string[];
  overView: string[];
  chronology?: string[];
  spec: TSpec;
  main: string[];
  others?: string[];
  learned?: string[];
};

export type Snippet = {
  _id: string;
  slug: string;
  content: any;
  title: string;
  description: string;
  logo: string;
};

export enum Form {
  Initial,
  Loading,
  Success,
  Error
}

export type FormState = {
  state: Form;
  message?: string;
};

export type Subscribers = {
  count: number;
};

export type Views = {
  total: number;
};

export type Song = {
  songUrl: string;
  artist: string;
  title: string;
};

export type NowPlayingSong = {
  album: string;
  albumImageUrl: string;
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
};

export type TopTracks = {
  tracks: Song[];
};

export type YouTube = {
  subscriberCount: number;
  viewCount: number;
};

export type GitHub = {
  stars: number;
};

export type Unsplash = {
  downloads: number;
  views: number;
};
