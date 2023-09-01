import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { faComment, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import {
  faCamera,
  faEnvelope,
  faTag,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { nanoid } from 'nanoid';
import { fromEvent, Subject } from 'rxjs';

import type {
  Caret,
  CommentSectionState,
  ExternalMock,
  Indices,
  MentionableIdsByType,
  Tagable,
  TagableIdsByType,
} from './comment-section.component.interfaces';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss'],
})
export class CommentSectionComponent implements OnInit {
  external: ExternalMock = {
    authorizedTagables: [
      {
        id: '1002',
        type: 'user',
      },
      {
        id: '4832',
        type: 'user',
      },
      {
        id: '4293',
        type: 'user',
      },
      { id: '2312', type: 'team' },
      { id: '2313', type: 'team' },
      { id: '9999', type: 'team' },
      { id: '122', type: 'tag' },
      { id: '123', type: 'tag' },
      { id: '124', type: 'tag' },
      { id: '125', type: 'tag' },
      { id: '113', type: 'tag' },
      { id: '999', type: 'tag' },
      { id: '998', type: 'tag' },
    ],
    userLookup: {
      5623: 'Alex Passidomo',
      1002: 'Jeff Babb',
      4832: 'Benjamin Johnson',
      4293: 'Michael Demille',
    },
    teamLookup: {
      2312: 'Manager',
      2313: 'Technician',
      9999: 'Interview Team',
    },
    tagLookup: {
      122: 'Left in Service',
      123: 'LSD: Parts Required',
      124: 'LSD: Repair Team Required',
      125: 'LSD: Troubleshooting Required',
      113: 'Emergency Repair',
      999: 'Looking Forward to the Next Interview',
      998: 'Have a Great Weekend',
    },
    currentUser: 5623,
  };
  icon = {
    camera: faCamera,
    comment: faComment,
  };
  iconTagable: Record<Tagable['type'], IconDefinition> = {
    email: faEnvelope,
    tag: faTag,
    team: faUsers,
    user: faUser,
  };
  observables = {
    caretChanges: new Subject<Caret>(),
    isTaggingChanges: new Subject<boolean>(),
    keyDownChanges: fromEvent(document, 'keydown'),
    selectionChanges: fromEvent(document, 'selectionchange'),
    tagablesChanges: new Subject<Tagable[]>(),
  };
  state: CommentSectionState = {
    autocompleteListPosition: null,
    caret: null,
    comments: [],
    form: this.fb.group({
      text: '',
    }),
    isDisabled: true,
    isTagging: false,
    mentions: {
      user: new Set(),
      team: new Set(),
      email: new Set(),
    },
    selection: null,
    tagableFocusIndex: 0,
    tagableQuery: '',
    tagablesCount: 0,
    tags: new Set(),
  };

  constructor(private fb: FormBuilder) {}

  addComment(): void {
    const {
      value: { text },
    } = this.state.form;

    if (!text) return;

    this.state.comments.push({
      content: text,
      userId: this.external.currentUser,
      timestamp: Date.now(),
      mentions: this.state.mentions,
      tags: this.state.tags,
    });

    this.state.form.reset();
    this.state.mentions = {
      user: new Set(),
      team: new Set(),
      email: new Set(),
    };
    this.state.tags = new Set();
    this.state.tagablesCount = 0;
  }
  // eslint-disable-next-line class-methods-use-this
  formatDateTime(timestamp: number): string {
    return formatDate(timestamp, 'MM/dd/yyyy h:mm a', 'en');
  }
  getAvailableTagables(): Tagable[] {
    // eslint-disable-next-line array-callback-return
    return this.external.authorizedTagables.filter((tagable) => {
      const { type, id } = tagable;
      switch (type) {
        case 'user': {
          return !this.state.mentions.user.has(Number.parseInt(id, 10));
        }
        case 'team': {
          return !this.state.mentions.team.has(Number.parseInt(id, 10));
        }
        case 'email': {
          return !this.state.mentions.email.has(id);
        }
        case 'tag': {
          return !this.state.tags.has(Number.parseInt(id, 10));
        }
      }
    });
  }
  getTagableName(tagable: Tagable): string {
    const { type, id } = tagable;
    switch (type) {
      case 'user': {
        return (
          this.external.userLookup[Number.parseInt(id, 10)] ?? 'Deleted User'
        );
      }
      case 'team': {
        return (
          this.external.teamLookup[Number.parseInt(id, 10)] ?? 'Deleted Team'
        );
      }
      case 'tag': {
        return (
          this.external.tagLookup[Number.parseInt(id, 10)] ?? 'Deleted Tag'
        );
      }
      case 'email': {
        return id;
      }
    }
  }
  // eslint-disable-next-line class-methods-use-this
  isAnyMention(mentions: MentionableIdsByType): boolean {
    const { user, team, email } = mentions;
    return user.size + team.size + email.size > 0;
  }
  // eslint-disable-next-line class-methods-use-this
  isAnyTag(tags: Set<number>): boolean {
    return tags.size > 0;
  }
  moveCaretFromNodeByOffset(node: Node, offset: number): void {
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    this.state.selection?.removeAllRanges();
    this.state.selection?.addRange(range);
  }
  moveCaretToNode(node: Node, side: 'before' | 'after'): void {
    const range = document.createRange();
    if (side === 'after') {
      range.setStartAfter(node);
      range.setEndAfter(node);
    } else {
      range.setStartBefore(node);
      range.setEndBefore(node);
    }
    this.state.selection?.removeAllRanges();
    this.state.selection?.addRange(range);
  }
  ngOnInit(): void {
    this.observeCaret();
    this.observeCommentText();
    this.observeIsTagging();
    this.observeKeyDown();
    this.observeSelection();
    this.observeTagablesChanges();
  }
  observeCaret(): void {
    this.observables.caretChanges.subscribe((caret) => {
      const { node, index, coordinates } = caret;

      if (
        node?.parentElement !== null &&
        node?.parentElement instanceof HTMLSpanElement &&
        this.state.caret !== null &&
        coordinates !== undefined &&
        this.state.caret.coordinates
      ) {
        const side =
          coordinates.x < this.state.caret.coordinates.x ? 'after' : 'before';
        return this.moveCaretToNode(node.parentElement, side);
      }

      const text = node?.nodeValue ?? '';
      const wordAtCaret = CommentSectionComponent.getWordAtCaret(text, index);

      const wordAtCaretFirstChar = wordAtCaret.slice(0, 1);
      const wordAtCaretSecondChar =
        wordAtCaret.length > 1 ? wordAtCaret.slice(1, 2) : '';
      const isTagging =
        wordAtCaretFirstChar === '@' && wordAtCaretSecondChar !== '@';
      this.state.tagableQuery = isTagging ? wordAtCaret.slice(1) : '';
      this.state.caret = caret;

      if (isTagging !== this.state.isTagging)
        this.observables.isTaggingChanges.next(isTagging);
    });
  }
  observeCommentText(): void {
    this.state.form.valueChanges.subscribe(() => {
      if (this.state.form.value.text?.length === 0) {
        this.state.isDisabled = true;
        this.state.isTagging = false;
        this.state.tagableQuery = '';
      } else {
        this.state.isDisabled = false;
      }

      const currentTagables = CommentSectionComponent.getTagablesFromText();
      if (this.state.tagablesCount === currentTagables.length) return;

      this.observables.tagablesChanges.next(currentTagables);
    });
  }
  observeIsTagging(): void {
    this.observables.isTaggingChanges.subscribe((isTagging) => {
      this.state.isTagging = isTagging;
      this.state.autocompleteListPosition = this.state.caret?.coordinates ?? {
        x: 0,
        y: 0,
      };
      if (!isTagging) this.state.tagableFocusIndex = 0;
    });
  }
  observeKeyDown(): void {
    this.observables.keyDownChanges.subscribe((event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (this.state.selection === null) return;
      if (this.state.caret === null) return;
      const { focusOffset, focusNode } = this.state.selection;
      if (focusNode === null) return;
      const { key } = event;

      switch (key) {
        case 'ArrowLeft': {
          if (
            focusOffset === 0 &&
            focusNode.previousSibling instanceof HTMLSpanElement &&
            focusNode.parentElement?.firstChild === focusNode.previousSibling
          )
            this.moveCaretToNode(focusNode.previousSibling, 'before');
          break;
        }
        case 'Backspace': {
          if (
            focusOffset === 0 &&
            focusNode.previousSibling instanceof HTMLSpanElement
          ) {
            focusNode.previousSibling.remove();
          } else if (
            focusNode instanceof HTMLElement &&
            focusNode.id === 'new-comment-text'
          ) {
            focusNode.childNodes[focusOffset - 1]?.remove();
          }
          break;
        }
        case 'Delete': {
          if (
            CommentSectionComponent.isSelectionEndOfNode(
              this.state.selection,
            ) &&
            focusNode.nextSibling instanceof HTMLSpanElement
          ) {
            focusNode.nextSibling.remove();
          } else if (
            focusNode instanceof HTMLElement &&
            focusNode.id === 'new-comment-text'
          ) {
            focusNode.childNodes[focusOffset]?.remove();
          }
          break;
        }
      }

      if (!this.state.isTagging) return;

      switch (key) {
        case 'Escape': {
          this.state.isTagging = false;
          break;
        }
        case 'Enter':
        case 'Tab': {
          event.preventDefault();
          const selectedTagable =
            this.queryTagables()[this.state.tagableFocusIndex];
          if (selectedTagable) this.replaceQueryWithTagable(selectedTagable);
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          this.state.tagableFocusIndex = Math.max(
            this.state.tagableFocusIndex - 1,
            0,
          );
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          this.state.tagableFocusIndex = Math.min(
            this.state.tagableFocusIndex + 1,
            this.queryTagables().length - 1,
          );
          break;
        }
      }
    });
  }
  observeSelection(): void {
    this.observables.selectionChanges.subscribe(() => {
      this.state.selection = document.getSelection();
      if (this.state.selection === null) return;

      const caretRect = this.state.selection
        .getRangeAt(0)
        .getBoundingClientRect();
      const x = caretRect.left;
      const y = caretRect.top;
      const { focusOffset, focusNode } = this.state.selection;

      const textBoxElement = document.querySelector('#new-comment-text');
      if (
        focusNode?.contains(textBoxElement) ||
        !textBoxElement?.contains(focusNode)
      )
        return;

      this.observables.caretChanges.next({
        index: focusOffset ?? -1,
        node: focusNode,
        coordinates: { x, y },
      });
    });
  }
  observeTagablesChanges(): void {
    this.observables.tagablesChanges.subscribe((currentTagables) => {
      this.state.tagablesCount = currentTagables.length;
      const { tag: tags, ...mentions } =
        CommentSectionComponent.getTagableIdsByType(currentTagables);
      this.state.tags = tags;
      this.state.mentions = mentions;
    });
  }
  queryTagables(): Tagable[] {
    if (this.state.tagableQuery.match(/@/)?.length === 1)
      return [{ type: 'email', id: this.state.tagableQuery }];

    return this.getAvailableTagables().filter((tagable) => {
      const tagableName = this.getTagableName(tagable);
      return tagableName
        .toLowerCase()
        .replaceAll(/\s+/g, '')
        .includes(this.state.tagableQuery.toLowerCase());
    });
  }
  replaceQueryWithTagable(tagable: Tagable): void {
    if (this.state.caret === null) return;
    const { index, node } = this.state.caret;
    if (node == null) return;
    const { type, id } = tagable;
    if (type === 'email' && !CommentSectionComponent.isValidEmail(id)) return;

    const nodeText = node.textContent ?? '';
    const indices = CommentSectionComponent.wordIndicesAtCaret(nodeText, index);
    const replacementId = nanoid();

    const commentTextWithTagablePlaceholder =
      CommentSectionComponent.replaceSubstringAt(
        indices,
        nodeText,
        replacementId,
      );
    node.textContent = commentTextWithTagablePlaceholder;

    const tagableElement = document.createElement('span');
    tagableElement.setAttribute('class', 'tagable');
    tagableElement.setAttribute('type', type);
    tagableElement.setAttribute('id', id);
    tagableElement.append(
      document.createTextNode(`@${this.getTagableName(tagable)}`),
    );

    const newCommentElement = document.querySelector(
      '#new-comment-text',
    ) as HTMLElement;
    const commentHtmlWithTagablePlaceholder = newCommentElement.innerHTML ?? '';

    const commentHtmlWithTagable = commentHtmlWithTagablePlaceholder.replace(
      replacementId,
      `${tagableElement.outerHTML} `,
    );

    this.state.form.get('text')?.setValue(commentHtmlWithTagable);

    const mountedTagableElement = document.querySelector(`span[id="${id}"]`);

    if (
      mountedTagableElement === null ||
      mountedTagableElement?.nextSibling === null
    )
      return;

    this.moveCaretFromNodeByOffset(mountedTagableElement.nextSibling, 1);
    newCommentElement.focus();
  }
  static getTagableElements(): HTMLSpanElement[] {
    return [
      ...(document.querySelectorAll(
        `span[id][type]`,
      ) as NodeListOf<HTMLSpanElement>),
    ];
  }
  static getTagableIdsByType(tagables: Tagable[]): TagableIdsByType {
    const user = new Set<number>();
    const team = new Set<number>();
    const email = new Set<string>();
    const tag = new Set<number>();

    for (const tagable of tagables) {
      const { type, id } = tagable;
      switch (type) {
        case 'user': {
          user.add(Number.parseInt(id, 10));
          break;
        }
        case 'team': {
          team.add(Number.parseInt(id, 10));
          break;
        }
        case 'email': {
          email.add(id);
          break;
        }
        case 'tag': {
          tag.add(Number.parseInt(id, 10));
          break;
        }
      }
    }

    return { user, team, email, tag };
  }
  static getTagablesFromText(): Tagable[] {
    return CommentSectionComponent.getTagableElements()
      .map((element) => ({
        type: element.getAttribute('type'),
        name: element.textContent,
        id: element.getAttribute('id'),
      }))
      .filter((element) =>
        CommentSectionComponent.isTagable(element),
      ) as Tagable[];
  }
  static getWordAtCaret(s: string, caretIndex: number): string {
    const { start, end } = CommentSectionComponent.wordIndicesAtCaret(
      s,
      caretIndex,
    );
    return s.slice(start, end);
  }
  static isSelectionEndOfNode(selection: Selection): boolean {
    try {
      selection.getRangeAt(selection.focusOffset + 1);
      return true;
    } catch {
      return false;
    }
  }
  static isTagable(o: object): o is Tagable {
    const { type, id } = o as Tagable;
    return [
      typeof type === 'string' && CommentSectionComponent.isTagableType(type),
      typeof id === 'string',
    ].every((condition) => !!condition);
  }
  static isTagableType(s: string): s is Tagable['type'] {
    const tagableTypeSet = new Set(['user', 'team', 'email', 'tag']);
    return tagableTypeSet.has(s);
  }
  static isValidEmail(email: string): boolean {
    return email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
  }
  static replaceSubstringAt(
    { start, end }: Indices,
    s: string,
    replacement: string,
  ): string {
    const strArr = [s.slice(0, start), replacement, s.slice(end)];
    return strArr.join('');
  }
  static wordIndicesAtCaret(s: string, caretIndex: number): Indices {
    const beforeCaret = s.slice(0, caretIndex);
    const beforeCaretReversed = [...beforeCaret].reverse().join('');
    const charLeftOfCaret = beforeCaretReversed.slice(0, 1);

    const delimiter = [' ', '\n'];

    if (['', ...delimiter].includes(charLeftOfCaret))
      return { start: 0, end: 0 };

    const delimiterRegEx = new RegExp(delimiter.join('|'), 'g');
    const indexOfStartOfWordAtCaret =
      beforeCaretReversed.search(delimiterRegEx) === -1
        ? 0
        : beforeCaret.length - beforeCaretReversed.search(delimiterRegEx);

    const fromCaret = s.slice(caretIndex);
    const charsRemainingOfWordAtCaret =
      fromCaret.search(delimiterRegEx) === -1
        ? fromCaret.length
        : fromCaret.search(delimiterRegEx);

    return {
      start: indexOfStartOfWordAtCaret,
      end: caretIndex + charsRemainingOfWordAtCaret,
    };
  }
}
