import { getImageUrl } from '../../../../utils/getImageUrl';


const PostCardImageGrid = ({ postData, handleImageClick }) => {
  if (!postData.images?.length) return null;

  const { images } = postData;

  if (images.length === 1) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden">
        <div className="h-[250px]">
          <img
            src={getImageUrl(images[0])}
            alt="Post content"
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
            onClick={() => handleImageClick(0)}
          />
        </div>
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden">
        <div className="flex gap-2 h-[300px]">
          <img
            src={getImageUrl(images[0])}
            alt="Post content 1"
            className="w-1/2 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
            onClick={() => handleImageClick(0)}
          />
          <img
            src={getImageUrl(images[1])}
            alt="Post content 2"
            className="w-1/2 h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
            onClick={() => handleImageClick(1)}
          />
        </div>
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden">
        <div className="flex gap-2 h-[300px]">
          <div className="w-1/2 h-full">
            <img
              src={getImageUrl(images[0])}
              alt="Post content 1"
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
              onClick={() => handleImageClick(0)}
            />
          </div>
          <div className="w-1/2 flex flex-col gap-2">
            <img
              src={getImageUrl(images[1])}
              alt="Post content 2"
              className="w-full h-1/2 object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
              onClick={() => handleImageClick(1)}
            />
            <img
              src={getImageUrl(images[2])}
              alt="Post content 3"
              className="w-full h-1/2 object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
              onClick={() => handleImageClick(2)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (images.length >= 4) {
    return (
      <div className="mb-4 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 gap-2 h-[300px]">
          {images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative">
              <img
                src={getImageUrl(image)}
                alt={`Post content ${index + 1}`}
                className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-lg ${index === 3 && images.length > 4 ? 'opacity-80' : ''
                  }`}
                onClick={() => handleImageClick(index)}
              />
              {index === 3 && images.length > 4 && (
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold cursor-pointer hover:bg-opacity-40 transition-all rounded-lg"
                  onClick={() => handleImageClick(index)}
                >
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default PostCardImageGrid;