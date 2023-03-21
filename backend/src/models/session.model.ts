export interface SessionAuth {
  instance: string;
  token: string;
  username: string;
  password: string;
}

export interface SessionModel {
  auth: SessionAuth[];
}
