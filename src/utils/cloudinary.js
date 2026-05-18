const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || '';
const CLOUDINARY_DEFAULT_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER?.trim() || 'lifelapss/admin';

const sanitizeSegment = (value = '') => value
  .toLowerCase()
  .replace(/[^a-z0-9/_-]+/g, '-')
  .replace(/\/+/g, '/')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const stripExtension = (fileName = '') => fileName.replace(/\.[^.]+$/, '');

const buildPublicId = (fileName, prefix = '') => {
  const normalizedPrefix = sanitizeSegment(prefix);
  const baseName = sanitizeSegment(stripExtension(fileName)) || 'upload';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return [normalizedPrefix, `${baseName}-${uniqueSuffix}`].filter(Boolean).join('/');
};

export const isCloudinaryConfigured = () => Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

export const isCloudinaryUrl = (url = '') => /https?:\/\/res\.cloudinary\.com\//i.test(String(url));

export const getCloudinaryVideoPosterUrl = ({ publicId, cloudName = CLOUDINARY_CLOUD_NAME } = {}) => {
  if (!publicId || !cloudName) {
    return '';
  }

  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${publicId}.jpg`;
};

export const getCloudinaryVideoPosterFromUrl = (url = '') => {
  if (!isCloudinaryUrl(url) || !url.includes('/video/upload/')) {
    return '';
  }

  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = pathParts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      return '';
    }

    const publicIdWithVersion = pathParts.slice(uploadIndex + 1).join('/');
    const normalizedPublicId = publicIdWithVersion.replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
    const cloudName = pathParts[0];

    return getCloudinaryVideoPosterUrl({ publicId: normalizedPublicId, cloudName });
  } catch (error) {
    console.error('Failed to derive Cloudinary poster URL:', error);
    return '';
  }
};

export const uploadCloudinaryAsset = async (
  file,
  {
    prefix = '',
    folder = CLOUDINARY_DEFAULT_FOLDER,
    resourceType = 'auto',
    tags = [],
  } = {},
) => {
  if (!isCloudinaryConfigured()) {
    return {
      data: null,
      error: {
        message: 'Cloudinary uploads require VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.',
      },
    };
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const formData = new FormData();
  const normalizedFolder = sanitizeSegment(folder);
  const publicId = buildPublicId(file?.name || 'upload', prefix);

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  if (normalizedFolder) {
    formData.append('folder', normalizedFolder);
  }
  formData.append('public_id', publicId);
  if (tags.length > 0) {
    formData.append('tags', tags.filter(Boolean).join(','));
  }

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: payload?.error?.message || 'Cloudinary upload failed.',
        },
      };
    }

    const thumbnailUrl = payload.resource_type === 'video'
      ? getCloudinaryVideoPosterUrl({ publicId: payload.public_id, cloudName: payload.cloud_name })
      : payload.secure_url;

    return {
      data: {
        provider: 'cloudinary',
        assetId: payload.asset_id,
        bytes: payload.bytes,
        cloudName: payload.cloud_name,
        fileName: payload.public_id,
        format: payload.format,
        originalFilename: payload.original_filename,
        publicId: payload.public_id,
        publicUrl: payload.secure_url,
        resourceType: payload.resource_type,
        secureUrl: payload.secure_url,
        thumbnailUrl,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error?.message || 'Cloudinary upload failed.',
      },
    };
  }
};
