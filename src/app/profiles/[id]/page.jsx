"use client";
import AuthorPostCard from '@/components/AuthorPostCard';
import { useCreateChatMutation } from '@/features/chat/massage';
import { useGetByUserIdQuery, useGetProfileByIdQuery, useLikePostMutation } from '@/features/post/postApi';
import { Grid } from 'antd';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { isAuthenticated } from '../../../../utils/auth';
import { getImageUrl } from '../../../../utils/getImageUrl';
import Loading from '../../../components/Loading/Loading';
import { ThemeContext } from '../../ClientLayout';

const ProfileBanner = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const router = useRouter();
  const { id } = useParams();
  const [createChat] = useCreateChatMutation();
  const [likePost] = useLikePostMutation();
  const { data, isLoading: getbuyUserLoading, refetch } = useGetByUserIdQuery(id);
  const { data: profile, isLoading: profileLoading } = useGetProfileByIdQuery(id);
  const { isDarkMode } = useContext(ThemeContext);

  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap();
      refetch()
    } catch (error) {
      toast.error(error?.message || 'Failed to like post');
    }
  };

  const handleChat = async (id) => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    } else {
      try {
        const response = await createChat({ participant: id }).unwrap();
        if (response.success) {
          router.push(`/chat/${response?.data?._id}`)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div className={`${isDarkMode ? 'dark-mode bg-gray-900' : 'light-mode bg-[#F2F4F7]'} min-h-screen`}>
      {/* Profile Header Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'} pt-16 sm:pt-20 pb-8 sm:pb-10`}>
        <div className={`${isDarkMode ? 'bg-gray-800 shadow-lg border border-gray-700' : 'bg-white shadow-md'} rounded-lg mx-auto w-full max-w-7xl`}>
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 relative">
            {/* Profile Image */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-16">
              <div className="relative">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} border-2 ${isDarkMode ? 'border-gray-700' : 'border-white'}`}>
                  <img
                    src={getImageUrl(profile?.data?.profile)}
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/default-profile.png';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Message Button - Right Aligned */}
            <div className="flex-1"></div>
            <button
              onClick={() => handleChat(id)}
              className={`
                ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'} 
                rounded-md bg-primary transition-colors cursor-pointer
                ${isDarkMode ? 'text-white hover:bg-blue-700' : 'text-black hover:bg-blue-600'}  
                flex items-center justify-center gap-2 shadow-sm
              `}
              aria-label="Send message"
            >
              <Image
                src={"/images/Vector.svg"}
                height={16}
                width={16}
                alt='Message icon'
                style={{ filter: isDarkMode ? 'brightness(1.2)' : 'none' }}
              />
              <span className="font-medium">Send Message</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="text-center pb-6 sm:pb-10 px-4">
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              {profile?.data?.name}
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>
              @{profile?.data?.userName}
            </p>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-5'>
        {getbuyUserLoading ? (
          <div className='flex justify-center py-10 sm:py-20'>
            <Loading size={isMobile ? 'medium' : 'large'} />
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {[...(data?.data || [])].reverse().map((post, index) => (
              <AuthorPostCard
                key={index}
                postData={post}
                onLike={handleLike}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-10 sm:py-20 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
              No posts available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileBanner;