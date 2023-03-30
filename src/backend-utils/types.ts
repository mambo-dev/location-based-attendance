import { ElectionStatus } from "@prisma/client";

export type HandleError = {
  message: string;
};

export type DecodedToken = {
  username: string;
  user_id: number;
  iat: number;
  exp: number;
};

export type ElectionReports = {
  election_id: number;
  election_name: string;
  election_status: ElectionStatus;
  election_start_date: string;
  election_end_date: string;
  candidate_position: string;
  candidate_id: number;
  candidate_name: string;
  candidate_national_id: number;
  candiate_phone: string;
  candidate_is_winner: boolean;
};
