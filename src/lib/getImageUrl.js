import { baseURL } from '../../utils/BaseURL';

export const getImageUrl = (path) => {
  if (
    typeof path === "string" &&
    (path.startsWith("http://") || path.startsWith("https://"))
  ) {
    return path;
  } else if (typeof path === "string" && path.trim() !== "") {
    return `${baseURL}/${path}`;
  } else {
    return "";
  }
};

