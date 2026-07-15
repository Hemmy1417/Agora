# v0.1.0
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from genlayer import *


STARTING_REPUTATION = 0
SUBMIT_REWARD       = 10
CHALLENGE_REWARD    = 15
APPEAL_BOND         = 20
BOUNTY_CLAIM_BONUS  = 20

QUALITY_TIERS = {
    "verified": {"min": 80, "label": "Verified",  "reward_mult": 2.0},
    "accepted": {"min": 50, "label": "Accepted",  "reward_mult": 1.0},
    "rejected": {"min": 0,  "label": "Rejected",  "reward_mult": 0.0},
}


def _tier_for_score(score):
    if score >= 80:
        return "verified"
    if score >= 50:
        return "accepted"
    return "rejected"


class Agora(gl.Contract):
    total_entries:   u256
    total_bounties:  u256
    entries:         TreeMap[str, str]
    topics:          TreeMap[str, str]
    topic_entries:   TreeMap[str, str]
    profiles:        TreeMap[str, str]
    owner_entries:   TreeMap[str, str]
    bounties:        TreeMap[str, str]
    topic_bounties:  TreeMap[str, str]
    owner_index:     TreeMap[str, str]
    owners_by_index: TreeMap[str, str]
    owner_count:     u256

    def __init__(self):
        self.total_entries  = 0
        self.total_bounties = 0
        self.owner_count    = 0

    # ── internal helpers ────────────────────────────────────────────────────

    def _get_profile(self, address):
        if address in self.profiles:
            return json.loads(self.profiles[address])
        return {
            "owner":            address,
            "reputation":       STARTING_REPUTATION,
            "total_entries":    0,
            "verified_count":   0,
            "accepted_count":   0,
            "rejected_count":   0,
            "challenges_won":   0,
            "bounties_claimed": 0,
        }

    def _save_profile(self, address, p):
        self.profiles[address] = json.dumps(p)

    def _owner_entries(self, address):
        if address in self.owner_entries:
            return json.loads(self.owner_entries[address])
        return []

    def _topic_entries(self, slug):
        if slug in self.topic_entries:
            return json.loads(self.topic_entries[slug])
        return []

    def _topic_bounties(self, slug):
        if slug in self.topic_bounties:
            return json.loads(self.topic_bounties[slug])
        return []

    def _all_owners(self):
        result = []
        for i in range(int(self.owner_count)):
            addr = self.owners_by_index.get(str(i), "")
            if addr:
                result.append(addr)
        return result

    def _track_owner(self, address):
        if address not in self.owner_index:
            idx = str(int(self.owner_count))
            self.owner_index[address]  = idx
            self.owners_by_index[idx]  = address
            self.owner_count          += 1

    def _parse_json(self, raw):
        text = raw.strip()
        if "```" in text:
            parts = text.split("```")
            text  = parts[1] if len(parts) > 1 else text
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())

    def _slugify(self, topic):
        slug = topic.lower().strip()
        out  = ""
        for c in slug:
            if c.isalnum():
                out += c
            elif c in (" ", "-", "_"):
                if out and out[-1] != "-":
                    out += "-"
        return out.strip("-")[:64] or "general"

    def _ensure_topic(self, slug, display_name):
        if slug not in self.topics:
            self.topics[slug] = json.dumps({
                "slug":         slug,
                "display_name": display_name.strip()[:100],
                "entry_count":  0,
                "bounty_count": 0,
            })

    # ── AI: validate a submission against its source ────────────────────────

    def _validate_entry(self, title, summary, source_url, topic):
        def evaluate():
            page_text = gl.nondet.web.render(source_url, mode="text")
            prompt = f"""You are a knowledge validator for the AGORA on-chain knowledge database.

A user submitted a knowledge entry. Your job: fetch the source, verify the summary is accurate, and score the quality.

TOPIC: {topic}
TITLE: {title}
SUBMITTED SUMMARY: {summary}
SOURCE URL: {source_url}
SOURCE CONTENT (first 3000 chars): {page_text[:3000]}

Evaluate:
1. ACCURACY — Does the summary faithfully represent what the source says? No fabrication.
2. RELEVANCE — Is this actually about the stated topic?
3. QUALITY — Is the summary clear, informative, and well-written?
4. NOVELTY — Does the summary extract useful, non-trivial information?

Respond ONLY with this JSON (no markdown):
{{
  "accuracy_score": <0-100>,
  "relevance_score": <0-100>,
  "quality_score": <0-100>,
  "novelty_score": <0-100>,
  "overall_score": <0-100>,
  "verdict": "<VERIFIED|ACCEPTED|REJECTED>",
  "feedback": "<2-3 sentence evaluation explaining the score>",
  "source_confirmed": <true|false>,
  "key_facts": "<comma-separated list of 3-5 key facts extracted>"
}}"""
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            return result

        raw = gl.eq_principle.prompt_comparative(
            evaluate,
            "Responses must agree on verdict (VERIFIED/ACCEPTED/REJECTED) and overall_score within 15 points",
        )
        output = self._parse_json(raw)
        output["overall_score"] = max(0, min(100, int(output.get("overall_score", 0))))
        v = output.get("verdict", "REJECTED").upper()
        output["verdict"] = v if v in ("VERIFIED", "ACCEPTED", "REJECTED") else "REJECTED"
        return output

    # ── AI: re-evaluate a challenged entry ──────────────────────────────────

    def _evaluate_challenge(self, entry, reason, appeal=False):
        def evaluate():
            appeal_note = (
                "\nNOTE: this is an APPEAL of the challenge ruling, filed by the entry's "
                "author. Re-examine the source and the objection especially rigorously and "
                "rule independently — do not defer to the earlier decision.\n" if appeal else ""
            )
            page_text = gl.nondet.web.render(entry["source_url"], mode="text")
            # Fail-safe (Gazette lesson): a source that is unreachable or
            # effectively empty is an infrastructure failure, NEVER grounds to
            # uphold a challenge. Upholding strips the author's reputation and
            # rewards the challenger, so a temporarily-down source would let a
            # griefer farm standing off good entries. Surface reachability as an
            # authoritative signal so the ruling defaults to "entry stands".
            reachable = bool(page_text and len(page_text.strip()) >= 50)
            prompt = f"""You are a challenge arbitrator for the AGORA on-chain knowledge database.

An existing entry has been challenged. Re-evaluate it considering the challenger's objection.
{appeal_note}
ORIGINAL ENTRY:
  Topic: {entry['topic']}
  Title: {entry['title']}
  Summary: {entry['summary']}
  Source URL: {entry['source_url']}
  Original Score: {entry['overall_score']}/100
  Original Verdict: {entry['tier']}

CHALLENGE REASON: {reason}

SOURCE REACHABLE: {reachable}
SOURCE CONTENT (first 3000 chars): {page_text[:3000]}

Re-evaluate with fresh eyes. Is the challenge valid?

CRITICAL RULE: If SOURCE REACHABLE is False (the source could not be fetched or
came back empty), you CANNOT confirm the challenge. An unavailable source is an
infrastructure problem, not proof the entry is wrong — return challenge_valid
false and leave the score unchanged. Only uphold a challenge when the fetched
source content itself positively contradicts or undermines the entry.

Respond ONLY with this JSON (no markdown):
{{
  "source_reachable": {str(reachable).lower()},
  "challenge_valid": <true|false>,
  "new_score": <0-100>,
  "new_verdict": "<VERIFIED|ACCEPTED|REJECTED>",
  "arbitration": "<2-3 sentence explanation of the ruling>",
  "score_change": <integer, negative if downgraded>
}}"""
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            return result

        raw = gl.eq_principle.prompt_comparative(
            evaluate,
            "Responses must agree on source_reachable (true/false), challenge_valid (true/false) and new_verdict",
        )
        output = self._parse_json(raw)
        output["challenge_valid"] = bool(output.get("challenge_valid", False))
        # Deterministic fail-safe backstop: never uphold a challenge when the
        # source was not reachable, no matter what the model returned. Missing
        # field defaults to unreachable, so the entry always stands on doubt.
        if not bool(output.get("source_reachable", False)):
            output["challenge_valid"] = False
        output["new_score"] = max(0, min(100, int(output.get("new_score", 0))))
        nv = output.get("new_verdict", "ACCEPTED").upper()
        output["new_verdict"] = nv if nv in ("VERIFIED", "ACCEPTED", "REJECTED") else "ACCEPTED"
        return output

    # ── public write: submit entry ──────────────────────────────────────────

    @gl.public.write
    def submit_entry(self, topic: str, title: str,
                     summary: str, source_url: str) -> None:
        sender = str(gl.message.sender_address)
        self._track_owner(sender)

        slug = self._slugify(topic)
        self._ensure_topic(slug, topic)

        validation = self._validate_entry(title, summary, source_url, topic)

        overall   = validation["overall_score"]
        tier      = _tier_for_score(overall)
        tier_info = QUALITY_TIERS[tier]
        reward    = int(SUBMIT_REWARD * tier_info["reward_mult"])

        entry_id = f"e_{int(self.total_entries)}"
        entry = {
            "entry_id":         entry_id,
            "owner":            sender,
            "topic":            topic.strip()[:100],
            "topic_slug":       slug,
            "title":            title.strip()[:200],
            "summary":          summary.strip()[:2000],
            "source_url":       source_url.strip()[:500],
            "overall_score":    overall,
            "accuracy_score":   validation.get("accuracy_score", 0),
            "relevance_score":  validation.get("relevance_score", 0),
            "quality_score":    validation.get("quality_score", 0),
            "novelty_score":    validation.get("novelty_score", 0),
            "tier":             tier,
            "verdict":          validation.get("verdict", "REJECTED"),
            "feedback":         validation.get("feedback", ""),
            "source_confirmed": validation.get("source_confirmed", False),
            "key_facts":        validation.get("key_facts", ""),
            "reward":           reward,
            "challenges":       0,
            "status":           "active",
            "challenge_upheld": False,
            "appeal_used":      False,
            "appeal_result":    "",
        }

        self.entries[entry_id] = json.dumps(entry)
        self.total_entries    += 1

        te = self._topic_entries(slug)
        te.append(entry_id)
        self.topic_entries[slug] = json.dumps(te)

        oe = self._owner_entries(sender)
        oe.append(entry_id)
        self.owner_entries[sender] = json.dumps(oe)

        tp = json.loads(self.topics[slug])
        tp["entry_count"] += 1
        self.topics[slug] = json.dumps(tp)

        profile = self._get_profile(sender)
        profile["total_entries"] += 1
        profile["reputation"]   += reward
        if tier == "verified":
            profile["verified_count"] += 1
        elif tier == "accepted":
            profile["accepted_count"] += 1
        else:
            profile["rejected_count"] += 1
        self._save_profile(sender, profile)

    # ── public write: challenge entry ───────────────────────────────────────

    @gl.public.write
    def challenge_entry(self, entry_id: str, reason: str) -> None:
        sender = str(gl.message.sender_address)
        self._track_owner(sender)

        if entry_id not in self.entries:
            return

        entry = json.loads(self.entries[entry_id])
        if entry["status"] != "active":
            return
        if entry["owner"] == sender:
            return

        result = self._evaluate_challenge(entry, reason)

        entry["challenges"] += 1

        if result["challenge_valid"]:
            old_tier    = entry["tier"]
            old_score   = entry["overall_score"]
            old_verdict = entry["verdict"]
            old_mult    = QUALITY_TIERS[old_tier]["reward_mult"]
            lost        = int(SUBMIT_REWARD * old_mult)

            # Snapshot the pre-challenge state so the author can file one bonded
            # appeal against this ruling (see appeal_challenge).
            entry["pre_score"]        = old_score
            entry["pre_tier"]         = old_tier
            entry["pre_verdict"]      = old_verdict
            entry["challenger"]       = sender
            entry["challenge_reason"] = reason
            entry["rep_lost"]         = lost
            entry["challenge_upheld"] = True
            entry["appeal_used"]      = False
            entry["appeal_result"]    = ""

            entry["overall_score"] = result["new_score"]
            entry["tier"]          = _tier_for_score(result["new_score"])
            entry["verdict"]       = result["new_verdict"]
            entry["feedback"]      = result.get("arbitration", entry["feedback"])

            if result["new_score"] < 50:
                entry["status"] = "disputed"

            self.entries[entry_id] = json.dumps(entry)

            challenger_profile = self._get_profile(sender)
            challenger_profile["reputation"]     += CHALLENGE_REWARD
            challenger_profile["challenges_won"] += 1
            self._save_profile(sender, challenger_profile)

            author_profile = self._get_profile(entry["owner"])
            author_profile["reputation"] = max(0, author_profile["reputation"] - lost)
            if old_tier == "verified":
                author_profile["verified_count"] = max(0, author_profile["verified_count"] - 1)
            elif old_tier == "accepted":
                author_profile["accepted_count"] = max(0, author_profile["accepted_count"] - 1)
            new_tier = _tier_for_score(result["new_score"])
            if new_tier == "verified":
                author_profile["verified_count"] += 1
            elif new_tier == "accepted":
                author_profile["accepted_count"] += 1
            else:
                author_profile["rejected_count"] += 1
            self._save_profile(entry["owner"], author_profile)
        else:
            self.entries[entry_id] = json.dumps(entry)

    # ── public write: appeal an upheld challenge ────────────────────────────

    @gl.public.write
    def appeal_challenge(self, entry_id: str) -> None:
        """The author stakes an APPEAL_BOND of reputation to trigger a fresh,
        independent second-panel ruling on the challenge that downgraded their entry.

        Win  → entry + reputation restored, the challenger's reward reversed, bond refunded.
        Lose → the challenge stands and the bond is forfeited to the challenger.

        One appeal per upheld challenge. The re-ruling reuses the same fetched-source
        fail-safe: an unreachable source can never keep a challenge standing, so an
        appeal on a dead source always restores the entry.
        """
        sender = str(gl.message.sender_address)
        self._track_owner(sender)

        if entry_id not in self.entries:
            return
        entry = json.loads(self.entries[entry_id])
        if entry.get("owner") != sender:
            return
        if not entry.get("challenge_upheld", False):
            return
        if entry.get("appeal_used", False):
            return

        # Reputation bond — skin in the game. Must be affordable; escrow it now.
        author = self._get_profile(sender)
        if author["reputation"] < APPEAL_BOND:
            return
        author["reputation"] -= APPEAL_BOND
        self._save_profile(sender, author)

        entry["appeal_used"] = True

        # Fresh, independent ruling on the SAME objection, with the fetched-source
        # fail-safe baked in. challenge_valid False => the challenge cannot stand
        # => the appeal SUCCEEDS.
        result = self._evaluate_challenge(entry, entry.get("challenge_reason", ""), appeal=True)
        challenge_stands = bool(result["challenge_valid"])

        downgraded_tier = entry["tier"]
        pre_tier        = entry.get("pre_tier", downgraded_tier)
        rep_lost        = int(entry.get("rep_lost", 0))
        challenger      = entry.get("challenger", "")

        author = self._get_profile(sender)

        if not challenge_stands:
            # APPEAL SUCCEEDS — restore the entry and unwind the challenge.
            entry["overall_score"]    = int(entry.get("pre_score", entry["overall_score"]))
            entry["tier"]             = pre_tier
            entry["verdict"]          = entry.get("pre_verdict", entry["verdict"])
            entry["status"]           = "active"
            entry["challenge_upheld"] = False
            entry["appeal_result"]    = "overturned"
            entry["feedback"]         = result.get("arbitration", entry["feedback"])

            # Refund the bond and restore the reputation the challenge deducted.
            author["reputation"] += rep_lost + APPEAL_BOND
            if downgraded_tier == "verified":
                author["verified_count"] = max(0, author["verified_count"] - 1)
            elif downgraded_tier == "accepted":
                author["accepted_count"] = max(0, author["accepted_count"] - 1)
            else:
                author["rejected_count"] = max(0, author["rejected_count"] - 1)
            if pre_tier == "verified":
                author["verified_count"] += 1
            elif pre_tier == "accepted":
                author["accepted_count"] += 1
            else:
                author["rejected_count"] += 1
            self._save_profile(sender, author)

            # Reverse the challenger's reward.
            if challenger and challenger != sender:
                cp = self._get_profile(challenger)
                cp["reputation"]     = max(0, cp["reputation"] - CHALLENGE_REWARD)
                cp["challenges_won"] = max(0, cp["challenges_won"] - 1)
                self._save_profile(challenger, cp)
        else:
            # APPEAL DENIED — the challenge stands; the bond goes to the challenger.
            entry["challenge_upheld"] = False
            entry["appeal_result"]    = "denied"
            if challenger and challenger != sender:
                cp = self._get_profile(challenger)
                cp["reputation"] += APPEAL_BOND
                self._save_profile(challenger, cp)

        self.entries[entry_id] = json.dumps(entry)

    # ── public write: post bounty ───────────────────────────────────────────

    @gl.public.write
    def post_bounty(self, topic: str, question: str,
                    min_quality: str) -> None:
        sender = str(gl.message.sender_address)
        self._track_owner(sender)

        slug = self._slugify(topic)
        self._ensure_topic(slug, topic)

        min_q = max(50, min(100, int(min_quality))) if min_quality.isdigit() else 70

        bounty_id = f"b_{int(self.total_bounties)}"
        bounty = {
            "bounty_id":    bounty_id,
            "poster":       sender,
            "topic":        topic.strip()[:100],
            "topic_slug":   slug,
            "question":     question.strip()[:500],
            "min_quality":  min_q,
            "status":       "open",
            "claimed_by":   "",
            "entry_id":     "",
        }

        self.bounties[bounty_id] = json.dumps(bounty)
        self.total_bounties     += 1

        tb = self._topic_bounties(slug)
        tb.append(bounty_id)
        self.topic_bounties[slug] = json.dumps(tb)

        tp = json.loads(self.topics[slug])
        tp["bounty_count"] += 1
        self.topics[slug] = json.dumps(tp)

    # ── public write: claim bounty (submit entry that answers it) ───────────

    @gl.public.write
    def claim_bounty(self, bounty_id: str, title: str,
                     summary: str, source_url: str) -> None:
        sender = str(gl.message.sender_address)
        self._track_owner(sender)

        if bounty_id not in self.bounties:
            return

        bounty = json.loads(self.bounties[bounty_id])
        if bounty["status"] != "open":
            return
        if bounty["poster"] == sender:
            return

        topic = bounty["topic"]
        slug  = bounty["topic_slug"]

        validation = self._validate_entry(title, summary, source_url, topic)
        overall    = validation["overall_score"]

        if overall < bounty["min_quality"]:
            return

        tier      = _tier_for_score(overall)
        tier_info = QUALITY_TIERS[tier]
        reward    = int(SUBMIT_REWARD * tier_info["reward_mult"]) + BOUNTY_CLAIM_BONUS

        entry_id = f"e_{int(self.total_entries)}"
        entry = {
            "entry_id":         entry_id,
            "owner":            sender,
            "topic":            topic,
            "topic_slug":       slug,
            "title":            title.strip()[:200],
            "summary":          summary.strip()[:2000],
            "source_url":       source_url.strip()[:500],
            "overall_score":    overall,
            "accuracy_score":   validation.get("accuracy_score", 0),
            "relevance_score":  validation.get("relevance_score", 0),
            "quality_score":    validation.get("quality_score", 0),
            "novelty_score":    validation.get("novelty_score", 0),
            "tier":             tier,
            "verdict":          validation.get("verdict", "REJECTED"),
            "feedback":         validation.get("feedback", ""),
            "source_confirmed": validation.get("source_confirmed", False),
            "key_facts":        validation.get("key_facts", ""),
            "reward":           reward,
            "challenges":       0,
            "status":           "active",
            "bounty_id":        bounty_id,
        }

        self.entries[entry_id] = json.dumps(entry)
        self.total_entries    += 1

        te = self._topic_entries(slug)
        te.append(entry_id)
        self.topic_entries[slug] = json.dumps(te)

        oe = self._owner_entries(sender)
        oe.append(entry_id)
        self.owner_entries[sender] = json.dumps(oe)

        tp = json.loads(self.topics[slug])
        tp["entry_count"] += 1
        self.topics[slug] = json.dumps(tp)

        bounty["status"]     = "claimed"
        bounty["claimed_by"] = sender
        bounty["entry_id"]   = entry_id
        self.bounties[bounty_id] = json.dumps(bounty)

        profile = self._get_profile(sender)
        profile["total_entries"]    += 1
        profile["reputation"]       += reward
        profile["bounties_claimed"] += 1
        if tier == "verified":
            profile["verified_count"] += 1
        elif tier == "accepted":
            profile["accepted_count"] += 1
        else:
            profile["rejected_count"] += 1
        self._save_profile(sender, profile)

    # ── public views ────────────────────────────────────────────────────────

    @gl.public.view
    def get_entry(self, entry_id: str) -> str:
        if entry_id in self.entries:
            return self.entries[entry_id]
        return json.dumps(None)

    @gl.public.view
    def get_topic(self, slug: str) -> str:
        if slug in self.topics:
            return self.topics[slug]
        return json.dumps(None)

    @gl.public.view
    def get_topic_entries(self, slug: str, n: u256) -> str:
        ids    = self._topic_entries(slug)
        result = []
        for eid in reversed(ids):
            if eid in self.entries:
                result.append(json.loads(self.entries[eid]))
            if len(result) >= int(n):
                break
        return json.dumps(result)

    @gl.public.view
    def get_profile(self, address: str) -> str:
        return json.dumps(self._get_profile(address))

    @gl.public.view
    def get_user_entries(self, address: str, n: u256) -> str:
        ids    = self._owner_entries(address)
        result = []
        for eid in reversed(ids):
            if eid in self.entries:
                result.append(json.loads(self.entries[eid]))
            if len(result) >= int(n):
                break
        return json.dumps(result)

    @gl.public.view
    def get_leaderboard(self, n: u256) -> str:
        entries = []
        for addr in self._all_owners():
            p = self._get_profile(addr)
            if p["total_entries"] > 0:
                entries.append(p)
        entries.sort(key=lambda x: x["reputation"], reverse=True)
        return json.dumps(entries[:int(n)])

    @gl.public.view
    def get_bounty(self, bounty_id: str) -> str:
        if bounty_id in self.bounties:
            return self.bounties[bounty_id]
        return json.dumps(None)

    @gl.public.view
    def get_open_bounties(self, n: u256) -> str:
        result = []
        for i in range(int(self.total_bounties) - 1, -1, -1):
            bid = f"b_{i}"
            if bid in self.bounties:
                b = json.loads(self.bounties[bid])
                if b["status"] == "open":
                    result.append(b)
            if len(result) >= int(n):
                break
        return json.dumps(result)

    @gl.public.view
    def get_recent_entries(self, n: u256) -> str:
        result = []
        for i in range(int(self.total_entries) - 1, -1, -1):
            eid = f"e_{i}"
            if eid in self.entries:
                result.append(json.loads(self.entries[eid]))
            if len(result) >= int(n):
                break
        return json.dumps(result)

    @gl.public.view
    def get_all_topics(self, n: u256) -> str:
        result = []
        seen   = set()
        for i in range(int(self.total_entries) - 1, -1, -1):
            eid = f"e_{i}"
            if eid in self.entries:
                e    = json.loads(self.entries[eid])
                slug = e.get("topic_slug", "")
                if slug and slug not in seen:
                    seen.add(slug)
                    if slug in self.topics:
                        result.append(json.loads(self.topics[slug]))
            if len(result) >= int(n):
                break
        return json.dumps(result)

    @gl.public.view
    def get_stats(self) -> str:
        return json.dumps({
            "total_entries":  int(self.total_entries),
            "total_bounties": int(self.total_bounties),
            "total_contributors": int(self.owner_count),
        })
