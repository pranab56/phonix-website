"use client";

import LoadingUi from '@/components/LoadingUi';
import { useGetAllChatQuery, useMarkAsReadMutation } from '@/features/chat/massage';
import { Avatar, Flex, Input } from 'antd';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BsSearch } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useDebounce } from '../../../hooks/useDebounce';
import { ThemeContext } from '../../ClientLayout';

const ChatList = ({ setIsChatActive, status }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [markAsRead, { isLoading: markAsReadLoading }] = useMarkAsReadMutation()
  const { data: chatListData, isLoading, isError, refetch } = useGetAllChatQuery(debouncedSearchTerm);

  const { chats } = useSelector((state) => state);


  // Memoize and sort the chat list to maintain consistent order
  const chatList = useMemo(() => {
    if (!chatListData?.data) return [];
    // Sort by last message time (newest first) or any other criteria you prefer
    return [...chatListData.data].sort((a, b) => {
      return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0);
    });
  }, [chatListData]);


  console.log(chatList)

  const handleSelectChat = async (chatId) => {
    router.push(`/chat/${chatId}`);
    if (setIsChatActive) {
      setIsChatActive(true);
    }

    try {
      await markAsRead(chatId).unwrap();
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return <LoadingUi />
  }

  return (
    <div className={`w-full h-[80vh] shadow rounded-lg flex flex-col
      ${isDarkMode ? 'dark-mode bg-gray-800 border-gray-700' : 'light-mode bg-white border-gray-200'}`}>

      <div className="p-4 ">
        <Flex gap={8}>
          <Input
            prefix={<BsSearch className={`mx-1 ${isDarkMode ? 'text-gray-300' : 'text-subtitle'}`} size={20} />}
            placeholder="Search for..."
            allowClear
            style={{ width: '100%', height: 42 }}
            value={searchTerm}
            onChange={handleSearchChange}
            className={isDarkMode ? 'bg-gray-700 text-white' : ''}
          />
        </Flex>
      </div>

      <div className={`chat-list-container flex-1 overflow-y-auto px-4
        ${isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}
        style={{
          scrollbarWidth: 'thin',
        }}>
        <style jsx global>{`
          .chat-list-container::-webkit-scrollbar {
            width: 6px;
          }
          .chat-list-container::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#374151' : '#FFFFFF'};
          }
          .chat-list-container::-webkit-scrollbar-thumb {
            background-color: ${isDarkMode ? '#4B5563' : '#CBD5E0'};
          }
        `}</style>
        {chatList?.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={chat?._id}
              onClick={() => handleSelectChat(chat?._id)}
              className={`flex items-center gap-4 p-4 cursor-pointer rounded-lg
                        ${chat?._id === id
                  ? (isDarkMode ? 'bg-gray-700' : 'bg-[#EBF4FF]')
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#EBF4FF]')}
                        ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
            >
              <Avatar size={50} src={getImageUrl(chat?.participants?.[0]?.profile)} />
              <div className="flex-1">
                <h3 className="font-medium max-w-[20ch]">
                  {chat?.participants?.[0]?.userName || "User"}
                </h3>
                <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {chat?.lastMessage?.text?.slice(0, 25) || ''}
                </p>
              </div>
              <div className="text-right flex flex-col gap-2">
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formatTime(chat?.lastMessage?.createdAt)}
                </p>
                {chat?.unreadCount > 0 && (
                  <span className="bg-primary text-white rounded-full px-2 py-1 text-xs">
                    {chat?.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;