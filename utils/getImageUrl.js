const { baseURL } = require("./BaseURL");

export const getImageUrl = (imageUrl) => {
    // Check if the imageUrl is empty
    if (!imageUrl || imageUrl.trim() === '') {
        return 'https://picsum.photos/200/300'; // Return fallback image
    }

    // Check if the imageUrl starts with "http"
    if (imageUrl.startsWith("http")) {
        return imageUrl;
    } else {
        return `${baseURL}${imageUrl}`;
    }
};
