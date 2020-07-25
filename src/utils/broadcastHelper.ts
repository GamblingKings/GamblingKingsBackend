import { User } from '../models/User';

/**
 * Get connection Ids from a list of User objects.
 * @param {User[]} usersList users list
 */
export const getConnectionIdsFromUsers = (usersList: User[]): string[] => {
  return usersList.map((user) => user.connectionId);
};

/**
 * Filter out caller connection Id from a list of connection Ids.
 * @param {string} callerConnectionId caller connection Id
 * @param {string} connectionIds connection Ids
 */
export const getConnectionIdsExceptCaller = (callerConnectionId: string, connectionIds: string[]): string[] => {
  return connectionIds.filter((otherConnectionId) => otherConnectionId !== callerConnectionId);
};
