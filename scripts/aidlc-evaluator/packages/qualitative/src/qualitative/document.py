"""Document loading and pairing for AIDLC output comparison."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

# v1 and v2 filenames that track process state rather than design intent
_SKIP_FILES = frozenset({
    "aidlc-state.md", "audit.md",          # v1
    "intent-state.md", "intent-audit.md",  # v2
    "intent-prompt.md",                    # v2 verbatim prompt capture
})

# v2 paths are rooted under intent-NNN-<slug>/ — strip that prefix before
# classifying phase so both v1 and v2 layouts produce the same phase labels.
_INTENT_PREFIX = re.compile(r"^intent-\d{3}-[^/]+/")

# Construction paths include a per-unit name that varies across runs
# (e.g. "sci-calc", "scientific-calculator-api"). Normalise to a fixed
# placeholder so documents pair correctly regardless of the unit name chosen.
_CONSTRUCTION_UNIT = re.compile(r"^(construction/)[^/]+/(.+)$")


@dataclass
class AidlcDocument:
    """A single AIDLC markdown document with its phase and content."""

    relative_path: str
    phase: str
    content: str


def _normalise_path(relative_path: str) -> str:
    """Normalise a document path for matching across runs.

    Applies two transformations:
    1. Strips the leading v2 intent directory (intent-NNN-slug/) if present.
    2. Replaces the per-unit name in construction paths with a fixed token
       (construction/<unit>/ → construction/_unit_/) so that runs using
       different unit names (e.g. "sci-calc" vs "scientific-calculator-api")
       still pair correctly.
    """
    path = _INTENT_PREFIX.sub("", relative_path)
    path = _CONSTRUCTION_UNIT.sub(r"\1_unit_/\2", path)
    return path


# Keep the old name as an alias so external callers aren't broken.
def _strip_intent_prefix(relative_path: str) -> str:
    return _normalise_path(relative_path)


def classify_phase(relative_path: str) -> str:
    """Determine the AIDLC phase from a document's relative path.

    Handles both v1 paths (inception/...) and v2 paths (intent-NNN-.../inception/...).
    Returns 'inception', 'construction', 'bootstrap', or 'other'.
    """
    stripped = _strip_intent_prefix(relative_path)
    parts = Path(stripped).parts
    if not parts:
        return "other"
    if parts[0] == "inception":
        return "inception"
    if parts[0] == "construction":
        return "construction"
    if parts[0] == "bootstrap":
        return "bootstrap"
    return "other"


def load_documents(aidlc_docs_path: Path) -> list[AidlcDocument]:
    """Load all markdown documents from an aidlc-docs directory.

    Skips workflow-internal files (aidlc-state.md, audit.md) that track
    process state rather than design intent.
    """
    if not aidlc_docs_path.is_dir():
        return []

    docs: list[AidlcDocument] = []
    for md_file in sorted(aidlc_docs_path.rglob("*.md")):
        relative = md_file.relative_to(aidlc_docs_path).as_posix()
        if md_file.name in _SKIP_FILES:
            continue
        try:
            content = md_file.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        if not content.strip():
            continue
        phase = classify_phase(relative)
        docs.append(AidlcDocument(relative_path=relative, phase=phase, content=content))
    return docs


@dataclass
class DocumentPair:
    """A matched pair of reference and candidate documents at the same relative path."""

    relative_path: str
    phase: str
    reference: AidlcDocument
    candidate: AidlcDocument


def pair_documents(
    reference_docs: list[AidlcDocument],
    candidate_docs: list[AidlcDocument],
) -> tuple[list[DocumentPair], list[str], list[str]]:
    """Pair reference and candidate documents by intent-prefix-stripped path.

    Both v1 paths (inception/...) and v2 paths (intent-NNN-.../inception/...)
    are normalised by stripping the intent prefix before matching, so a v2
    golden and a v2 candidate pair correctly even if their intent slugs differ.

    Returns (paired, unmatched_reference_paths, unmatched_candidate_paths).
    """
    ref_by_stripped = {_normalise_path(d.relative_path): d for d in reference_docs}
    cand_by_stripped = {_normalise_path(d.relative_path): d for d in candidate_docs}

    paired: list[DocumentPair] = []
    for stripped_path, ref_doc in ref_by_stripped.items():
        if stripped_path in cand_by_stripped:
            paired.append(DocumentPair(
                relative_path=stripped_path,
                phase=ref_doc.phase,
                reference=ref_doc,
                candidate=cand_by_stripped[stripped_path],
            ))

    unmatched_ref = sorted(set(ref_by_stripped) - set(cand_by_stripped))
    unmatched_cand = sorted(set(cand_by_stripped) - set(ref_by_stripped))

    return paired, unmatched_ref, unmatched_cand
