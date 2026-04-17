const DRAFT_ID_KEY = "refinery.po.draftId";

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function clearDraft() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DRAFT_ID_KEY);
}

export function loadDraftId() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(DRAFT_ID_KEY);
}

export function saveDraftId(draftId: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DRAFT_ID_KEY, draftId);
}
