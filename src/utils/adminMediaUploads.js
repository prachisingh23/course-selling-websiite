import { uploadCloudinaryAsset, isCloudinaryConfigured } from '@/utils/cloudinary';
import { uploadMediaFile } from '@/utils/mediaStorage';

export const uploadAdminAssetFile = async (file, options = {}) => {
  if (isCloudinaryConfigured()) {
    return uploadCloudinaryAsset(file, options);
  }

  const { prefix = '' } = options;
  return uploadMediaFile(file, { prefix });
};
