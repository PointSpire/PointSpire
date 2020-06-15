import { UserModel, createUserModel, UserDoc } from '../main/models/user';
import mongoose from 'mongoose';

type GithubProfile = {
  id: string;
  username: string;
};

/**
 *
 * @param {mongoose} db The connected MnogoDB object
 * @param {GithubProfile} profile // TODO create Github profile type
 * @returns {UserDoc} newUser
 */
export function createUserObjectGithub(
  db: typeof mongoose,
  profile: GithubProfile
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
 * @param {typeof mongoose} db the connected MongoDB instance
 * @param {UserDoc} newUser the tentatively created newUser
 */
export async function saveOrFindNewGithubUser(
  db: typeof mongoose,
  newUser: UserDoc
): Promise<UserDoc> {
  const User: UserModel = createUserModel(db);
  const userDoc = await User.findOne({ githubId: newUser.githubId }).exec();
  if (userDoc) {
    return userDoc;
  } else {
    await newUser.save();
    return newUser;
  }
}
