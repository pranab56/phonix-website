"use client";
import AuthorPostCard from '@/components/AuthorPostCard';
import { useCreateChatMutation } from '@/features/chat/massage';
import { useGetByUserIdQuery, useGetProfileByIdQuery, useLikePostMutation } from '@/features/post/postApi';
import { Grid, Spin } from 'antd';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ThemeContext } from '../../ClientLayout';
import { isAuthenticated } from '../../../../utils/auth';


const ProfileBanner = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
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
    }else{
      try {
        const response = await createChat({ participant: id }).unwrap();
        console.log(response)
        if (response.success) {
          router.push(`/chat/${response?.data?._id}`)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div className={`${isDarkMode ? 'dark-mode bg-gray-900' : 'light-mode bg-[#F2F4F7]'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-[#EBEBFF]'} pt-20 flex items-center justify-center`}>
        <div className={`${isDarkMode ? 'bg-gray-800 shadow-lg border border-gray-700' : 'bg-white shadow-md'} rounded-lg w-full max-w-7xl`}>
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-12">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                  <img
                    src={getImageUrl(profile?.data?.profile)}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => handleChat(id)}
              className={`
              ${isMobile ? 'px-3 py-1.5 rounded-md' : 'px-4 py-2 rounded-md'}
              bg-primary transition-colors cursor-pointer
              text-white flex items-center justify-center gap-2
              shadow-sm
            `}
              aria-label="Edit profile"
            >
              <Image
                src={"/images/Vector.svg"}
                height={16}
                width={16}
                alt=''
                style={{ filter: isDarkMode ? 'brightness(1.2)' : 'none' }}
              />
              <span className="text-sm font-medium">Send Message</span>
            </button>
          </div>

          <div className="text-center pb-10">
            <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
              {profile?.data?.name}
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>
              @{profile?.data?.userName}
            </p>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto py-5'>
        {
          getbuyUserLoading ? (
            <div className='flex justify-center py-20'>
              <Spin className={isDarkMode ? 'text-gray-200' : ''} />
            </div>
          ) : (
            [...(data?.data || [])].reverse().map((post, index) => (
              <AuthorPostCard
                key={index}
                postData={post}
                onLike={handleLike}
                isDarkMode={isDarkMode}
              />
            ))
          )
        }
      </div>


    </div>
  );
};

export default ProfileBanner;
