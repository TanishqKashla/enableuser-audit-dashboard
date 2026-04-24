export type WcagPrinciple = "Perceivable" | "Operable" | "Understandable" | "Robust";
export type WcagLevel = "A" | "AA";

export interface WcagCriterion {
  code: string;
  name: string;
  level: WcagLevel;
  principle: WcagPrinciple;
  url: string;
}

const url = (slug: string) =>
  `https://www.w3.org/WAI/WCAG21/Understanding/${slug}.html`;

export const WCAG_21_AA: WcagCriterion[] = [
  // 1. Perceivable
  { code: "1.1.1", name: "Non-text Content", level: "A", principle: "Perceivable", url: url("non-text-content") },
  { code: "1.2.1", name: "Audio-only and Video-only (Prerecorded)", level: "A", principle: "Perceivable", url: url("audio-only-and-video-only-prerecorded") },
  { code: "1.2.2", name: "Captions (Prerecorded)", level: "A", principle: "Perceivable", url: url("captions-prerecorded") },
  { code: "1.2.3", name: "Audio Description or Media Alternative (Prerecorded)", level: "A", principle: "Perceivable", url: url("audio-description-or-media-alternative-prerecorded") },
  { code: "1.2.4", name: "Captions (Live)", level: "AA", principle: "Perceivable", url: url("captions-live") },
  { code: "1.2.5", name: "Audio Description (Prerecorded)", level: "AA", principle: "Perceivable", url: url("audio-description-prerecorded") },
  { code: "1.3.1", name: "Info and Relationships", level: "A", principle: "Perceivable", url: url("info-and-relationships") },
  { code: "1.3.2", name: "Meaningful Sequence", level: "A", principle: "Perceivable", url: url("meaningful-sequence") },
  { code: "1.3.3", name: "Sensory Characteristics", level: "A", principle: "Perceivable", url: url("sensory-characteristics") },
  { code: "1.3.4", name: "Orientation", level: "AA", principle: "Perceivable", url: url("orientation") },
  { code: "1.3.5", name: "Identify Input Purpose", level: "AA", principle: "Perceivable", url: url("identify-input-purpose") },
  { code: "1.4.1", name: "Use of Color", level: "A", principle: "Perceivable", url: url("use-of-color") },
  { code: "1.4.2", name: "Audio Control", level: "A", principle: "Perceivable", url: url("audio-control") },
  { code: "1.4.3", name: "Contrast (Minimum)", level: "AA", principle: "Perceivable", url: url("contrast-minimum") },
  { code: "1.4.4", name: "Resize Text", level: "AA", principle: "Perceivable", url: url("resize-text") },
  { code: "1.4.5", name: "Images of Text", level: "AA", principle: "Perceivable", url: url("images-of-text") },
  { code: "1.4.10", name: "Reflow", level: "AA", principle: "Perceivable", url: url("reflow") },
  { code: "1.4.11", name: "Non-text Contrast", level: "AA", principle: "Perceivable", url: url("non-text-contrast") },
  { code: "1.4.12", name: "Text Spacing", level: "AA", principle: "Perceivable", url: url("text-spacing") },
  { code: "1.4.13", name: "Content on Hover or Focus", level: "AA", principle: "Perceivable", url: url("content-on-hover-or-focus") },

  // 2. Operable
  { code: "2.1.1", name: "Keyboard", level: "A", principle: "Operable", url: url("keyboard") },
  { code: "2.1.2", name: "No Keyboard Trap", level: "A", principle: "Operable", url: url("no-keyboard-trap") },
  { code: "2.1.4", name: "Character Key Shortcuts", level: "A", principle: "Operable", url: url("character-key-shortcuts") },
  { code: "2.2.1", name: "Timing Adjustable", level: "A", principle: "Operable", url: url("timing-adjustable") },
  { code: "2.2.2", name: "Pause, Stop, Hide", level: "A", principle: "Operable", url: url("pause-stop-hide") },
  { code: "2.3.1", name: "Three Flashes or Below Threshold", level: "A", principle: "Operable", url: url("three-flashes-or-below-threshold") },
  { code: "2.4.1", name: "Bypass Blocks", level: "A", principle: "Operable", url: url("bypass-blocks") },
  { code: "2.4.2", name: "Page Titled", level: "A", principle: "Operable", url: url("page-titled") },
  { code: "2.4.3", name: "Focus Order", level: "A", principle: "Operable", url: url("focus-order") },
  { code: "2.4.4", name: "Link Purpose (In Context)", level: "A", principle: "Operable", url: url("link-purpose-in-context") },
  { code: "2.4.5", name: "Multiple Ways", level: "AA", principle: "Operable", url: url("multiple-ways") },
  { code: "2.4.6", name: "Headings and Labels", level: "AA", principle: "Operable", url: url("headings-and-labels") },
  { code: "2.4.7", name: "Focus Visible", level: "AA", principle: "Operable", url: url("focus-visible") },
  { code: "2.5.1", name: "Pointer Gestures", level: "A", principle: "Operable", url: url("pointer-gestures") },
  { code: "2.5.2", name: "Pointer Cancellation", level: "A", principle: "Operable", url: url("pointer-cancellation") },
  { code: "2.5.3", name: "Label in Name", level: "A", principle: "Operable", url: url("label-in-name") },
  { code: "2.5.4", name: "Motion Actuation", level: "A", principle: "Operable", url: url("motion-actuation") },

  // 3. Understandable
  { code: "3.1.1", name: "Language of Page", level: "A", principle: "Understandable", url: url("language-of-page") },
  { code: "3.1.2", name: "Language of Parts", level: "AA", principle: "Understandable", url: url("language-of-parts") },
  { code: "3.2.1", name: "On Focus", level: "A", principle: "Understandable", url: url("on-focus") },
  { code: "3.2.2", name: "On Input", level: "A", principle: "Understandable", url: url("on-input") },
  { code: "3.2.3", name: "Consistent Navigation", level: "AA", principle: "Understandable", url: url("consistent-navigation") },
  { code: "3.2.4", name: "Consistent Identification", level: "AA", principle: "Understandable", url: url("consistent-identification") },
  { code: "3.3.1", name: "Error Identification", level: "A", principle: "Understandable", url: url("error-identification") },
  { code: "3.3.2", name: "Labels or Instructions", level: "A", principle: "Understandable", url: url("labels-or-instructions") },
  { code: "3.3.3", name: "Error Suggestion", level: "AA", principle: "Understandable", url: url("error-suggestion") },
  { code: "3.3.4", name: "Error Prevention (Legal, Financial, Data)", level: "AA", principle: "Understandable", url: url("error-prevention-legal-financial-data") },

  // 4. Robust
  { code: "4.1.1", name: "Parsing", level: "A", principle: "Robust", url: url("parsing") },
  { code: "4.1.2", name: "Name, Role, Value", level: "A", principle: "Robust", url: url("name-role-value") },
  { code: "4.1.3", name: "Status Messages", level: "AA", principle: "Robust", url: url("status-messages") },
];

export const PRINCIPLE_ORDER: WcagPrinciple[] = [
  "Perceivable",
  "Operable",
  "Understandable",
  "Robust",
];
