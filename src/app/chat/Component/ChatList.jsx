"use client";

import LoadingUi from '@/components/LoadingUi';

import {
  deleteChatLocally,
  markChatAsRead,
  toggleBlockChat,
  toggleMuteChat
} from '@/redux/features/chatSlice';
import { Avatar, Dropdown, Flex, Input, message } from 'antd';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BsBell,
  BsBellSlash,
  BsBlockquoteRight,
  BsSearch,
  BsThreeDotsVertical,
  BsTrash
} from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useChatBlockAndUnblockMutation, useDeleteChatMutation, useGetAllChatQuery, useMarkAsReadMutation, useMuteChatMutation } from '../../../features/chat/chatList/chatApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { ThemeContext } from '../../ClientLayout';

const ChatList = ({ setIsChatActive, status }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const dispatch = useDispatch();

  const [markAsRead, { isLoading: markAsReadLoading }] = useMarkAsReadMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [muteChat] = useMuteChatMutation();
  const [blockChat] = useChatBlockAndUnblockMutation();

  const { data: chatListData, isLoading, isError, refetch } = useGetAllChatQuery(debouncedSearchTerm);

  const { chats } = useSelector((state) => state.chats);

  const chatList = useMemo(() => {
    if (!chatListData?.data?.chats) return [];
    return [...chatListData?.data?.chats].sort((a, b) => {
      return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0);
    });
  }, [chatListData?.data?.chats]);

  const handleSelectChat = async (chatId) => {
    router.push(`/chat/${chatId}`);
    if (setIsChatActive) setIsChatActive(true);

    try {
      await markAsRead(chatId).unwrap();
      dispatch(markChatAsRead(chatId));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat(chatId).unwrap();
      dispatch(deleteChatLocally(chatId));
      message.success('Chat deleted successfully');
      if (id === chatId) {
        router.push('/chat');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMuteChat = async (chatId) => {
    try {
      const chat = chats?.chats?.find(c => c._id === chatId);
      if (!chat) return;

      const isCurrentlyMuted = chat.mutedBy?.includes(localStorage.getItem("login_user_id"));

      await muteChat({
        id: chatId,
        body: { action: isCurrentlyMuted ? 'unmute' : 'mute' }
      }).unwrap();

      dispatch(toggleMuteChat(chatId));
      toast.success(`Chat ${isCurrentlyMuted ? 'unmuted' : 'muted'} successfully`);
    } catch (error) {
      console.error('Mute error:', error);
      toast.error(error?.data?.message || 'Failed to toggle mute status');
    }
  };

  const handleBlockChat = async (chatId) => {
    try {
      const chat = chats?.chats?.find(c => c._id === chatId);
      if (!chat) return;

      const userId = localStorage.getItem("login_user_id");
      const isCurrentlyBlocked = chat.blockedUsers?.some(
        block => block.blocker === userId
      );
      const targetId = chat.participants.find(p => p._id !== userId)?._id;

      if (!targetId) {
        throw new Error("Participant not found");
      }

      await blockChat({
        chatId,
        targetId,
        body: { action: isCurrentlyBlocked ? 'unblock' : 'block' }
      }).unwrap();

      dispatch(toggleBlockChat(chatId));
      message.success(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const bangladeshTime = moment.utc(timestamp).utcOffset(6);
    return bangladeshTime.fromNow();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return <LoadingUi />;
  }

  const getMenuItems = (chat) => [
    {
      key: 'mute',
      label: chat.isMuted ? 'Unmute Chat' : 'Mute Chat',
      icon: chat.isMuted ? <BsBell /> : <BsBellSlash />,
      onClick: () => handleMuteChat(chat._id)
    },
    {
      key: 'block',
      label: chat.isBlocked ? 'Unblock User' : 'Block User',
      icon: <BsBlockquoteRight />,
      onClick: () => handleBlockChat(chat._id)
    },
    {
      key: 'delete',
      label: 'Delete Chat',
      icon: <BsTrash />,
      danger: true,
      onClick: () => handleDeleteChat(chat._id)
    }
  ];

  return (
    <div className={`w-full h-[80vh] rounded-lg flex flex-col shadow-lg border border-gray-200  ${isDarkMode ? 'dark-mode bg-gray-800' : 'bg-[#f9f9f9]'
      }`}>
      <div className="p-4">
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

      <div className={`chat-list-container flex-1 overflow-y-auto px-4 ${isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'
        }`}>
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
              className={`flex items-center gap-4 p-4 cursor-pointer rounded-lg relative group ${chat?._id === id
                  ? (isDarkMode ? 'bg-gray-700' : 'bg-[#EBF4FF]')
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#EBF4FF]')
                } ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
            >
              <div className="relative">
                <Avatar size={50} src={getImageUrl(chat?.participants?.[0]?.profile)} />
                {chat.isBlocked && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <BsBlockquoteRight className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium ${chat.isRead ? "font-normal " : "font-extrabold"} truncate ${chat.isBlocked ? 'line-through' : ''
                    }`}>
                    {chat?.participants?.[0]?.userName || "User"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(chat?.lastMessage?.createdAt)}
                    </span>
                    {chat.isMuted && <BsBellSlash className="text-gray-400" size={14} />}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p className={`text-sm ${chat.isRead ? "font-normal" : "font-extrabold"
                    } truncate ${isDarkMode ? 'text-white' : 'text-black'
                    } ${!chat.lastMessage?.read && chat.lastMessage?.sender !== localStorage.getItem("login_user_id")
                      ? 'font-semibold' : ''
                    }`}>
                    {chat?.lastMessage?.text?.slice(0, 25) || ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {chat?.unreadCount > 0 && (
                  <span className="bg-primary text-white rounded-full px-2 py-1 text-xs animate-pulse">
                    {chat?.unreadCount}
                  </span>
                )}

                <Dropdown
                  menu={{ items: getMenuItems(chat) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BsThreeDotsVertical />
                  </button>
                </Dropdown>
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