import { FormControl, FormGroup } from '@angular/forms';

export interface Comment {
  content: string;
  timestamp: number;
  userId: number;
  mentions: MentionableIdsByType;
  tags: Set<number>;
  // attachedFiles: Path[];
}

type MentionableType = 'user' | 'team' | 'email';
type TagType = 'tag';
export interface ITagable {
  id: string;
}
export interface Mentionable extends ITagable {
  type: MentionableType;
}
export interface Tag extends ITagable {
  type: TagType;
}
export type Tagable = Mentionable | Tag;

export type MentionableIdsByType = {
  user: Set<number>;
  team: Set<number>;
  email: Set<string>;
};
export interface TagableIdsByType extends MentionableIdsByType {
  tag: Set<number>;
}

export interface Caret {
  index: number;
  node: Node | null;
  /**
   * Top left corner of the caret's Bounding Client Rectangle.
   */
  coordinates?: Coordinates;
}
export interface Coordinates {
  x: number;
  y: number;
}

export interface Indices {
  start: number;
  end: number;
}

export interface CommentSectionState {
  autocompleteListPosition: Coordinates | null;
  caret: Caret | null;
  comments: Comment[];
  form: FormGroup<CommentSectionForm>;
  isDisabled: boolean;
  isTagging: boolean;
  mentions: MentionableIdsByType;
  selection: Selection | null;
  tagableFocusIndex: number;
  tagableQuery: string;
  tagablesCount: number;
  tags: Set<number>;
}

interface CommentSectionForm {
  text: FormControl<string | null>;
}

export interface ExternalMock {
  authorizedTagables: Tagable[];
  currentUser: number;
  userLookup: Record<number, string>;
  teamLookup: Record<number, string>;
  tagLookup: Record<number, string>;
}
