import { UserModel, createUserModel, UserDoc } from '../main/models/user';
import mongoose from 'mongoose';

/**
 *
 * @param {mongoose} db The connected MnogoDB object
 * @param {any} profile // TODO create Github profile type
 * @returns {UserDoc} newUser
 */
export function createUserObjectGithub(
  db: typeof mongoose,
  profile: any // TODO create Github profile type
): UserDoc {
  const User: UserModel = createUserModel(db);
  let newUser = new User({ userName: profile.username });
  newUser = Object.assign(newUser, {
    userName: profile.username,
    firstName: '',
    lastName: '',
    githubId: profile.id,
  });
  return newUser;
}

/**
 *
 * @param {mongoose} db The connected MnogoDB object
 * @param {stirng} githubId GithubId of user account
 * @param {Function} userFound Callback if user is found in database
 * @param {Function} userNotFound Callback if use is not found in database
 */
function checkUserGithubId(
  db: typeof mongoose,
  githubId: string,
  userFound: Function,
  userNotFound: Function
): void {
  const User: UserModel = createUserModel(db);
  User.find({ githubId: githubId }).exec((err, users) => {
    if (err || users.length === 0) {
      userNotFound();
    } else {
      userFound(users[0]);
    }
  });
}

/**
 *
 * @param {mongoose} db The connected MnogoDB object
 * @param {UserDoc} newUser UserDoc to find or save
 * @param {Function} callback Callback passed in from Passport
 */
export function saveOrFindNewGithubUser(
  db: typeof mongoose,
  newUser: UserDoc,
  callback: Function
): void {
  checkUserGithubId(
    db,
    newUser.githubId,
    function (newUser: UserDoc) {
      newUser.save().then(() => {
        callback(null, newUser);
      });
    },
    function (foundUser: UserDoc) {
      callback(null, foundUser);
    }
  );
}
