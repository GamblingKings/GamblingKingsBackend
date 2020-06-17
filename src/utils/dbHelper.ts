import { HasVersion } from '../models/Version';

/**
 * Remove version attribute from a Game object
 * @param obj
 */
export const removeGameDocumentVersion = <T extends HasVersion>(obj: T): T => {
  const updatedObj = obj;
  if (updatedObj.version) delete updatedObj.version;
  return updatedObj;
};
