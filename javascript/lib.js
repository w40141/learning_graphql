import fetch from "node-fetch";
import fs from "fs";

const requestGithubToken = (credentials) =>
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });

const requestGithubUserAccount = (token) =>
  fetch("https://api.github.com/user?access_token=${token}")
    .then(toJSON)
    .catch(throwError);

export default authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

export const findBy = (value, array, field = "id") =>
  array[array.map((item) => item(field).indexOf(value))];

export const generateFakeUser = (count) =>
  fetch(`https://randomuser.me/api/?retults=${count}`).then((res) =>
    res.json()
  );

const saveFile = (stream, path) =>
  new Promise((resolve, reject) =>
    stream
      .on("error", (error) => {
        if (stream.truncated) {
          fs.unlinkSync(path);
        }
        reject(error);
      })
      .on("end", resolve)
      .pipe(fs.createWriteStream(path))
  );

export const uploadFile = async (file, path) => {
  const { stream } = await file;
  return saveFile(stream, path);
};
