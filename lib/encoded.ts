import crypto from "crypto-js";

const secret = process.env.NEXTAUTH_SECRET;

// encode json with password
export const encode = (json: any, password: string) => {
  return crypto.AES.encrypt(JSON.stringify(json), password + secret).toString();
};

// decode json with password
export const decode = (string: string, password: string) => {
  const bytes = crypto.AES.decrypt(string, password + secret);
  return JSON.parse(bytes.toString(crypto.enc.Utf8));
};
