'use client';

import { Avatar, Button, Dropdown, Form, Input, Tooltip, Upload, message as antMessage } from 'antd';
import EmojiPicker from 'emoji-picker-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { BsEmojiSmile, BsPinAngleFill } from 'react-icons/bs';
import { FiMoreVertical } from 'react-icons/fi';
import { IoMdSend } from 'react-icons/io';
import { TbPinned } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ImageUplaod } from '../../../../utils/svgImage';
import { useGetAllChatQuery } from '../../../features/chat/chatList/chatApi';
import { useGetAllMassageQuery, useMessageSendMutation, usePinMessageMutation, useReactMessageMutation } from '../../../features/chat/message/messageApi';
import { addMessage, resetMessages, setPage } from '../../../redux/features/messageSlice';
import { ThemeContext } from '../../ClientLayout';

const ChatWindow = ({ id }) => {
  const dispatch = useDispatch();
  const { data: chat } = useGetAllChatQuery();
  const chatUser = chat?.data.chats.find(user => user._id === id);
  const { messages, pinnedMessages, isLoading, hasMore, page } = useSelector((state) => state.message);
  const { data: messagesData, refetch } = useGetAllMassageQuery({ chatId: id, page, limit: 10 });
  const [sendMessage, { isLoading: isSending }] = useMessageSendMutation();
  const [messageReact] = useReactMessageMutation();
  const [pinMessage] = usePinMessageMutation();
  const loginUserId = localStorage.getItem("login_user_id");
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState({ messageId: null, show: false });
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pinnedMessageId, setPinnedMessageId] = useState(null);

  const reactions = [
    { emoji: '❤️', name: 'love' },
    { emoji: '👍', name: 'thumbs_up' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😡', name: 'angry' },
    { emoji: '😢', name: 'sad' }
  ];

  useEffect(() => {
    dispatch(resetMessages());
    dispatch(setPage(1));
    setInitialLoad(true);
    setPinnedMessageId(null);
  }, [id, dispatch]);

  useEffect(() => {
    if (messagesData?.data) {
      const pinnedMsg = messagesData.data.pinnedMessages?.[0]?._id;
      if (pinnedMsg) {
        setPinnedMessageId(pinnedMsg);
      }
    }
  }, [messagesData]);

  useEffect(() => {
    if (initialLoad && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom('auto');
        setInitialLoad(false);
      }, 100);
    } else if (isNearBottom && messages.length > 0) {
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
  }, [messages, initialLoad, isNearBottom]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }

      if (showReactionPicker.show && reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
        setShowReactionPicker({ messageId: null, show: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showReactionPicker]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);

      if (scrollTop < 100 && hasMore && !loadingMore && !isLoading && !initialLoad) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, loadingMore, initialLoad]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || isLoading) return;

    setLoadingMore(true);
    try {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container.scrollHeight;
      const prevScrollTop = container.scrollTop;

      dispatch(setPage(page + 1));
      await new Promise(resolve => setTimeout(resolve, 500));

      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight;
      container.scrollTop = prevScrollTop + heightDifference;
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleCreateNewMessage = async (values) => {
    if (!values.message && (!values?.file?.fileList || values?.file?.fileList.length === 0)) {
      return;
    }

    const formData = new FormData();
    if (values?.file?.fileList?.length > 0) {
      formData.append("image", values?.file?.fileList[0]?.originFileObj);
    }
    formData.append("text", values.message || "");

    try {
      const response = await sendMessage({ chatId: id, body: formData }).unwrap();
      if (response.data) {
        dispatch(addMessage(response.data));
        form.resetFields();
        setImagePreview(null);
        setShowEmojiPicker(false);
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    } catch (error) {
      antMessage.error("Failed to send message");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const handleFileChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    form.setFieldsValue({ file: { fileList } });
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setFieldsValue({ file: { fileList: [] } });
  };

  const onEmojiClick = (emojiData) => {
    const currentMessage = form.getFieldValue('message') || '';
    form.setFieldsValue({ message: currentMessage + emojiData.emoji });
    inputRef.current.focus();
  };

  const handleAddReaction = async (messageId, reaction) => {
    try {
      await messageReact({ messageId, reaction }).unwrap();
      const updatedMessages = messages.map(msg => {
        if (msg._id === messageId) {
          const existingReactionIndex = msg.reactions.findIndex(r => r.userId._id === loginUserId);
          if (existingReactionIndex >= 0) {
            const updatedReactions = [...msg.reactions];
            updatedReactions[existingReactionIndex] = {
              ...updatedReactions[existingReactionIndex],
              reactionType: reaction,
              timestamp: new Date().toISOString()
            };
            return { ...msg, reactions: updatedReactions };
          } else {
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  userId: { _id: loginUserId },
                  reactionType: reaction,
                  timestamp: new Date().toISOString(),
                  _id: `temp-${Date.now()}`
                }
              ]
            };
          }
        }
        return msg;
      });
      dispatch({ type: 'message/setMessages', payload: updatedMessages });
      setShowReactionPicker({ messageId: null, show: false });
    } catch (error) {
      antMessage.error("Failed to add reaction");
    }
  };

  const handlePinMessage = async (messageId, action) => {
    try {
      await pinMessage({ messageId, action }).unwrap();
      setPinnedMessageId(action === 'pin' ? messageId : null);
      antMessage.success(`Message ${action === 'pin' ? 'pinned' : 'unpinned'}`);
      refetch();
    } catch (error) {
      antMessage.error(`Failed to ${action} message`);
    }
  };

  const toggleReactionPicker = (messageId) => {
    setShowReactionPicker(prev =>
      prev.messageId === messageId && prev.show
        ? { messageId: null, show: false }
        : { messageId, show: true }
    );
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (showReactionPicker.show) {
      setShowReactionPicker({ messageId: null, show: false });
    }
  };

  // Ripple effect component
  const RippleEffect = ({ isCurrentUser }) => {
    return (
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 opacity-0"
            style={{
              background: isCurrentUser
                ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)'
                : 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 70%)',
              animation: `ripple 1s ${i * 0.2}s forwards`,
            }}
          />
        ))}
      </div>
    );
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 }
  };

  return (
    <div className={`flex flex-col h-[80vh] ${isDarkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Header */}
      {chatUser?.participants.map(item => (
        <div key={item._id} className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Avatar
              src={getImageUrl(item?.profile)}
              size={48}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{item?.userName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
      ))}

      {pinnedMessages?.length > 0 && (
        <div className={`p-2 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <div className="flex items-center text-sm font-medium">
            <TbPinned className="mr-1" />
            Pinned Messages
          </div>
          <div className="mt-1">
            {pinnedMessages.map(msg => (
              <div key={msg._id} className="flex items-start text-sm">
                <span className="truncate">{msg.text || "Pinned message"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className={`flex-1 p-4 overflow-y-auto message-container ${isDarkMode ? 'bg-gray-800' : 'bg-[#f9f9f9]'}`}
      >
        <style jsx global>{`
          .message-container::-webkit-scrollbar {
            width: 6px;
          }
          .message-container::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#2D3748' : '#F5F5F6'};
          }
          .message-container::-webkit-scrollbar-thumb {
            background-color: ${isDarkMode ? '#4A5568' : '#CBD5E0'};
          }
          .message-bubble {
            position: relative;
            transition: all 0.2s ease;
          }
          .message-options {
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .message-wrapper:hover .message-options {
            opacity: 1;
          }
          .deleted-message {
            background-color: ${isDarkMode ? '#3B3B3B' : '#f0f0f0'} !important;
            font-style: italic;
          }
          @keyframes ripple {
            0% {
              transform: scale(0.8);
              opacity: 0.4;
            }
            100% {
              transform: scale(2.5);
              opacity: 0;
            }
          }
        `}</style>

        {loadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages?.map((message, index) => {
            const isCurrentUser = message.sender?._id === loginUserId;
            const isDeleted = message.isDeleted === true;
            const isPinned = message._id === pinnedMessageId;

            return (
              <motion.div
                key={message._id || index}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={messageVariants}
                transition={{ duration: 0.2 }}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-6 message-wrapper`}
              >
                {!isCurrentUser && (
                  <Avatar
                    src={getImageUrl(message.sender?.profile)}
                    size={32}
                    className="mr-2 self-start mt-1"
                  />
                )}

                <div className="relative group max-w-[80%]">
                  {isPinned && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <BsPinAngleFill className="text-gray-400 text-xs" />
                    </div>
                  )}

                  <motion.div
                    className={`relative p-3 rounded-2xl ${isDeleted
                      ? 'deleted-message'
                      : isCurrentUser
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-white text-gray-800'
                      } shadow-sm message-bubble`}
                  >
                    <RippleEffect isCurrentUser={isCurrentUser} />

                    {message.replyTo && !isDeleted && (
                      <div className={`mb-2 p-2 text-xs rounded-lg ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-200'} ${isDarkMode && !isCurrentUser ? 'bg-gray-600' : ''}`}>
                        <p className="font-medium">Replying to:</p>
                        <p className="truncate">{message.replyTo.text || "Message"}</p>
                      </div>
                    )}

                    {message.images?.length > 0 && !isDeleted && (
                      <div className="mt-2">
                        <img
                          src={getImageUrl(message.images[0])}
                          alt="Message attachment"
                          className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                        />
                      </div>
                    )}

                    {!isDeleted && message.text && (
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    )}

                    {isDeleted && (
                      <p className="text-gray-500 italic">This message has been deleted</p>
                    )}

                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatDate(message.createdAt)}
                      </span>
                      {message.read && isCurrentUser && (
                        <span className="text-xs text-blue-200">✓✓</span>
                      )}
                    </div>

                    {!isDeleted && message.reactions?.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex gap-1 absolute -bottom-3"
                      >
                        <div className={`flex items-center justify-start px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} shadow-sm`}>
                          {message.reactions.map((reaction, i) => (
                            <Tooltip key={i} title={`${reaction?.userId?.userName || 'User'}`}>
                              <span className="text-sm">
                                {reaction.reactionType === "love" && "❤️"}
                                {reaction.reactionType === "thumbs_up" && "👍"}
                                {reaction.reactionType === "laugh" && "😂"}
                                {reaction.reactionType === "angry" && "😡"}
                                {reaction.reactionType === "sad" && "😢"}
                              </span>
                            </Tooltip>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {!isDeleted && (
                    <div className={`message-options absolute ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 flex`}>
                      <Button
                        type="text"
                        size="small"
                        icon={<BsEmojiSmile />}
                        className={`flex items-center justify-center p-1 rounded-full ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-white hover:bg-gray-100'} shadow-sm`}
                        onClick={() => toggleReactionPicker(message._id)}
                      />

                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'pin',
                              label: isPinned ? 'Unpin Message' : 'Pin Message',
                              icon: <TbPinned size={14} />,
                              onClick: () => handlePinMessage(message._id, isPinned ? 'unpin' : 'pin')
                            }
                          ]
                        }}
                        trigger={['click']}
                        placement={isCurrentUser ? 'bottomLeft' : 'bottomRight'}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<FiMoreVertical />}
                          className={`ml-1 flex items-center justify-center p-1 rounded-full ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-white hover:bg-gray-100'} shadow-sm`}
                        />
                      </Dropdown>
                    </div>
                  )}

                  {!isDeleted && showReactionPicker.show && showReactionPicker.messageId === message._id && (
                    <motion.div
                      ref={reactionPickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute z-10 p-1 mt-3 rounded-full flex items-start gap-1 ${isDarkMode ? 'backdrop-blur-xs' : 'backdrop-blur-xs border border-gray-200'} ${isCurrentUser ? 'right-0' : 'left-0'} -top-8 justify-start`}
                    >
                      {reactions.map((reaction) => (
                        <Button
                          key={reaction.name}
                          type="text"
                          size="small"
                          className="p-1 hover:bg-gray-100 rounded-full"
                          onClick={() => handleAddReaction(message._id, reaction.name)}
                        >
                          {reaction.emoji}
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {isCurrentUser && (
                  <Avatar
                    src={getImageUrl(message.sender?.profile)}
                    size={32}
                    className="ml-2 self-start mt-1"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-3 border-t flex items-center`}>
        <div>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mx-2 relative"
            >
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={`h-20 w-auto rounded object-cover border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                />
                <Button
                  type="text"
                  className={`absolute top-1 right-1 rounded-full p-0 flex items-center justify-center h-6 w-6 shadow-md ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                  onClick={removeImage}
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}

          <div className="relative">
            <Button
              ref={emojiButtonRef}
              type="text"
              icon={<BsEmojiSmile />}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
              onClick={toggleEmojiPicker}
            />
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-10">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={350}
                  theme={isDarkMode ? 'dark' : 'light'}
                />
              </div>
            )}
          </div>
        </div>

        <Form form={form} onFinish={handleCreateNewMessage} className="flex-1 flex items-center">
          <Form.Item name="message" noStyle className="flex-1">
            <Input.TextArea
              ref={inputRef}
              placeholder="Type a message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className={`rounded-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200'}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  form.submit();
                }
              }}
            />
          </Form.Item>

          <Form.Item name="file" noStyle>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button
                type="text"
                icon={<ImageUplaod />}
                className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
              />
            </Upload>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<IoMdSend />}
            className="ml-2"
            loading={isSending}
          />
        </Form>
      </div>
    </div>
  );
};

export default ChatWindow;