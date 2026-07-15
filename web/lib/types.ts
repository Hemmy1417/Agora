export interface Entry {
  entry_id:        string;
  owner:           string;
  topic:           string;
  topic_slug:      string;
  title:           string;
  summary:         string;
  source_url:      string;
  overall_score:   number;
  accuracy_score:  number;
  relevance_score: number;
  quality_score:   number;
  novelty_score:   number;
  tier:            "verified" | "accepted" | "rejected";
  verdict:         string;
  feedback:        string;
  source_confirmed: boolean;
  key_facts:       string;
  reward:          number;
  challenges:      number;
  status:          "active" | "disputed";
  challenge_upheld?: boolean;
  appeal_used?:      boolean;
  appeal_result?:    string;
  bounty_id?:      string;
}

export interface Topic {
  slug:         string;
  display_name: string;
  entry_count:  number;
  bounty_count: number;
}

export interface Profile {
  owner:            string;
  reputation:       number;
  total_entries:    number;
  verified_count:   number;
  accepted_count:   number;
  rejected_count:   number;
  challenges_won:   number;
  bounties_claimed: number;
}

export interface Bounty {
  bounty_id:   string;
  poster:      string;
  topic:       string;
  topic_slug:  string;
  question:    string;
  min_quality: number;
  status:      "open" | "claimed";
  claimed_by:  string;
  entry_id:    string;
}

export interface Stats {
  total_entries:       number;
  total_bounties:      number;
  total_contributors:  number;
}
