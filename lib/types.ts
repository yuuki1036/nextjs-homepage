export type TSpec = {
  [key: string]: string;
};

export type TWorks = {
  slug: string;
  title: string;
  featureTitle?: string;
  excerpt: string;
  excerptEn: string;
  otherImage: boolean;
  date: string;
  launch?: string;
  source?: string;
  tag: string[];
  overView: string[];
  overViewEn: string[];
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
