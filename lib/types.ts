export type TMeta = {
  title: string;
  description: string;
  image?: string;
  type: string;
};

export type TCustomMeta = {
  [key: string]: string;
};

export type TSpec = {
  [key: string]: string;
};

export type TWorks = {
  slug: string;
  title: string;
  featureTitle?: string;
  excerpt: string;
  otherImage: boolean;
  date: string;
  launch?: string;
  source?: string;
  tag: string[];
  overView: string[];
  chronology?: string[];
  spec: TSpec;
  others?: string[];
  gradient?: string;
};

export type TFeatureWorks = {
  slug: string;
  gradient: string;
};

export enum TForm {
  Initial,
  Loading,
  Success,
  Error
}

export type TFormState = {
  state: TForm;
  message?: string;
};

export type TInput = {
  name: string;
  email: string;
  inquiry: string;
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
