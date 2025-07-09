'use client';

import { Avatar, Badge, Button, Dropdown, Form, Input, Tooltip, Upload, message as antMessage } from 'antd';
import EmojiPicker from 'emoji-picker-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { BsEmojiSmile, BsPinAngleFill } from 'react-icons/bs';
import { FiMoreVertical } from 'react-icons/fi';
import { IoMdSend } from 'react-icons/io';
import { TbPinned, TbTrash } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ImageUplaod } from '../../../../utils/svgImage';
import { useDeleteMessageMutation, useGetAllMassageQuery, useMessageSendMutation, usePinMessageMutation, useReactMessageMutation } from '../../../features/chat/message/messageApi';
import { addMessage, resetMessages, setPage } from '../../../redux/features/messageSlice';
import { ThemeContext } from '../../ClientLayout';

const ChatWindow = ({ id }) => {
  const dispatch = useDispatch();
  const { messages, pinnedMessages, isLoading, hasMore, page } = useSelector((state) => state.message);
  const { data: messagesData, refetch } = useGetAllMassageQuery({ chatId: id, page, limit: 10 });
  const [sendMessage, { isLoading: isSending }] = useMessageSendMutation();
  const [messageReact] = useReactMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [pinMessage] = usePinMessageMutation();
  const loginUserId = localStorage.getItem("login_user_id");
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState({ messageId: null, show: false });
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastScrollHeight, setLastScrollHeight] = useState(0);

  // Reactions configuration
  const reactions = [
    { emoji: '❤️', name: 'love' },
    { emoji: '👍', name: 'thumbs_up' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😡', name: 'angry' },
    { emoji: '😢', name: 'sad' }
  ];

  // Reset messages when chat changes
  useEffect(() => {
    dispatch(resetMessages());
    dispatch(setPage(1));
  }, [id, dispatch]);

  // Handle outside clicks for pickers
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

  // Scroll handling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);

      // Load more when scrolling near top
      if (scrollTop < 100 && hasMore && !loadingMore && !isLoading) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, loadingMore]);

  // Scroll to bottom on new messages if near bottom
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const prevScrollHeight = messagesContainerRef.current.scrollHeight;
      setLastScrollHeight(prevScrollHeight);

      dispatch(setPage(page + 1));

      // Wait for the next render cycle to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));

      // After messages are loaded, adjust scroll position
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
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
      dispatch(addMessage(response.data));
      form.resetFields();
      setImagePreview(null);
      setShowEmojiPicker(false);
      setTimeout(() => scrollToBottom('auto'), 100);
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

  const handleUnsendMessage = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap();
      antMessage.success("Message deleted");
    } catch (error) {
      antMessage.error("Failed to delete message");
    }
  };

  const handleAddReaction = async (messageId, reaction) => {
    try {
      await messageReact({ messageId, reaction }).unwrap();
      setShowReactionPicker({ messageId: null, show: false });
    } catch (error) {
      antMessage.error("Failed to add reaction");
    }
  };

  const handlePinMessage = async (messageId, action) => {
    try {
      await pinMessage({ messageId, action }).unwrap();
      antMessage.success(`Message ${action}ned`);
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

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 }
  };



  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    // Close reaction picker if open
    if (showReactionPicker.show) {
      setShowReactionPicker({ messageId: null, show: false });
    }
  };

  return (
    <div className={`flex flex-col h-[80vh] ${isDarkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Avatar
            src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
            size={48}
          />
          <Badge
            dot
            color="green"
            className="absolute bottom-1 right-0 w-3 h-3"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Dawn Teague</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>
      </div>




      {/* Pinned messages section */}
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

      {/* Message container */}
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
          .message-loading {
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.3; }
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
            const isPinned = message.isPinned === true;

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
                    whileHover={{ scale: 1.02 }}
                    className={`message-bubble p-3 rounded-2xl ${isDeleted
                      ? 'deleted-message'
                      : isCurrentUser
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-white text-gray-800'
                      } shadow-sm relative`}
                  >
                    {!isDeleted && isPinned && (
                      <div className="absolute -left-2 -top-2">
                        <BsPinAngleFill className="text-gray-400 text-xs" />
                      </div>
                    )}

                    {message.replyTo && !isDeleted && (
                      <div className={`mb-2 p-2 text-xs rounded-lg ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-200'} ${isDarkMode && !isCurrentUser ? 'bg-gray-600' : ''}`}>
                        <p className="font-medium">Replying to:</p>
                        <p className="truncate">{message.replyTo.text || "Message"}</p>
                      </div>
                    )}

                    <p className={`${isDeleted ? "text-gray-500" : ""}`}>
                      {isDeleted ? "This message was deleted" : message.text}
                    </p>

                    {message.images?.length > 0 && !isDeleted && (
                      <div className="mt-2">
                        <img
                          src={getImageUrl(message.images[0])}
                          alt="Message attachment"
                          className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                        />
                      </div>
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
                        className="flex gap-1 absolute -bottom-3 right-2"
                      >
                        <div className={`flex items-center px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} shadow-sm`}>
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

                  {/* Message action buttons */}
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
                            },
                            {
                              key: 'delete',
                              label: 'Delete Message',
                              icon: <TbTrash size={14} />,
                              onClick: () => handleUnsendMessage(message._id),
                              danger: true
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

                  {/* Reaction picker */}
                  {!isDeleted && showReactionPicker.show && showReactionPicker.messageId === message._id && (
                    <motion.div
                      ref={reactionPickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute z-10 p-1 mt-3 rounded-full shadow-md flex gap-1 ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'} ${isCurrentUser ? 'right-0' : 'left-0'} -top-8`}
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

      {/* Input form */}
      <div className={`p-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mx-2 mb-2 relative"
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
                style={{ fontSize: '12px' }}
              >
                ✕
              </Button>
            </div>
          </motion.div>
        )}

        <Form
          form={form}
          onFinish={handleCreateNewMessage}
          className="flex w-full items-center gap-2 relative"
        >
          <div className="flex items-center">
            <Form.Item name="file" valuePropName="file" className="mb-0">
              <Upload
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                onChange={handleFileChange}
              >
                <Button
                  type="text"
                  icon={<ImageUplaod />}
                  className="flex items-center justify-center"
                />
              </Upload>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                ref={emojiButtonRef}
                type="text"
                icon={<BsEmojiSmile size={20} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />}
                onClick={toggleEmojiPicker}
              />
            </Form.Item>
          </div>

          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-14 left-14 z-10"
              ref={emojiPickerRef}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={350}
                theme={isDarkMode ? 'dark' : 'light'}
              />
            </motion.div>
          )}

          <Form.Item name="message" className="flex-1 mb-0">
            <Input
              ref={inputRef}
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#F5F5F6',
                borderRadius: '20px',
                color: isDarkMode ? 'white' : 'inherit',
                padding: '8px 16px'
              }}
              placeholder="Type a message..."
              className={isDarkMode ? 'dark-input' : ''}
              size="large"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              htmlType="submit"
              type="primary"
              icon={<IoMdSend size={18} />}
              shape="circle"
              size="large"
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600"
              loading={isSending}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ChatWindow;