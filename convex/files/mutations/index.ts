// Export R2 file upload functions
export { generateUploadUrl, syncMetadata } from '../r2';

// Export custom file management mutations
import { mutation } from '../../_generated/server';
import { deleteFileArgs, deleteFileHandler } from './deleteFile';

// Delete file from R2 and database
export const deleteFile = mutation({
  args: deleteFileArgs,
  handler: deleteFileHandler,
});
