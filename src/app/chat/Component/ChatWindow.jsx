'use client';
import { useDeleteMessageMutation, useGetAllChatQuery, useGetAllMassageQuery, useMessageSendMutation, useReactMessageMutation } from '@/features/chat/massage';
import { Avatar, Badge, Button, Dropdown, Form, Input, Tooltip, Upload } from 'antd';
import EmojiPicker from 'emoji-picker-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { BsEmojiSmile } from 'react-icons/bs';
import { FiMoreVertical } from 'react-icons/fi';
import { IoIosAttach, IoMdSend } from 'react-icons/io';
import { TbTrash } from 'react-icons/tb';
import { useSelector } from 'react-redux';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { ThemeContext } from '../../ClientLayout';

const ChatWindow = ({ id }) => {
  // Use refetchOnMountOrArgChange to ensure data is fresh when component mounts
  const { data: messagesData, refetch: refetchMessages } = useGetAllMassageQuery(id, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 3000 // Poll every 3 seconds for updates
  });
  
  const { messages } = useSelector((state) => state.message);
  const [sendMessage, { isLoading }] = useMessageSendMutation();
  const [messageReact] = useReactMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const loginUserId = localStorage.getItem("login_user_id");
  const [form] = Form.useForm();
  const messagesEndRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { data: chatList, isLoading: chatLoading } = useGetAllChatQuery("");
  const { isDarkMode } = useContext(ThemeContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState({ messageId: null, show: false });
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesContainerRef = useRef(null);

  const users = chatList?.data?.find(chat => chat?.participants?.map(item => item === id));

  // The available reactions
  const reactions = [
    { emoji: '❤️', name: 'love' },
    { emoji: '👍', name: 'thumbs_up' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😡', name: 'angry' },
    { emoji: '😢', name: 'sad' }
  ];

  // Handle outside click for emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        showReactionPicker.show &&
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target)
      ) {
        setShowReactionPicker({ messageId: null, show: false });
      }
    }

    // Add event listener when emoji picker is shown
    if (showEmojiPicker || showReactionPicker.show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker, showReactionPicker]);

  // Check scroll position
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
    }
  };

  // Set up scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Scroll to bottom when messages change only if we're near the bottom
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleCreateNewMessage = async (values) => {
    if (!values.message && (!values?.file?.fileList || values?.file?.fileList.length === 0)) {
      return; // Don't send empty messages
    }

    const formData = new FormData();

    if (values?.file?.fileList?.length > 0) {
      formData.append("image", values?.file?.fileList[0]?.originFileObj);
    }

    formData.append("text", values.message || "");

    try {
      const res = await sendMessage({ body: formData, id }).unwrap();
      console.log(res);
      // Reset form and image preview
      form.resetFields();
      setImagePreview(null);
      setShowEmojiPicker(false);
      // Refetch messages to get updated list
      refetchMessages();
      // Scroll to bottom after sending a new message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const handleFileChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Update the form
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

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Function to handle message deletion
  const handleUnsendMessage = async (messageId) => {
    try {
      const response = await deleteMessage(messageId).unwrap();
      console.log(response);
      // Refetch messages to update UI immediately
      refetchMessages();
    } catch (error) {
      console.error("Failed to unsend message:", error);
    }
  };

  // Function to handle adding reactions
  const handleAddReaction = async (messageId, reaction) => {
    try {
      const response = await messageReact({ messageId, reaction }).unwrap();
      // Close the reaction picker after selecting a reaction
      setShowReactionPicker({ messageId: null, show: false });
      // Refetch messages to update UI immediately
      refetchMessages();
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  // Function to toggle reaction picker
  const toggleReactionPicker = (messageId) => {
    setShowReactionPicker(prev =>
      prev.messageId === messageId && prev.show
        ? { messageId: null, show: false }
        : { messageId, show: true }
    );
  };

  return (
    <div className={`flex flex-col h-[80vh] ${isDarkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Header */}
      <div className={`p-4 flex items-center gap-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {users?.participants?.map((participant, index) => (
          <div key={index} className="relative">
            <Avatar
              src={getImageUrl(participant?.profile)}
              size={40}
            />
            <Badge
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                position: 'absolute',
                bottom: "5px",
                right: "-3px"
              }}
              dot
              color="green"
            />
          </div>
        ))}

        <h3 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
          {users?.participants?.length > 0
            ? users.participants.map((participant, idx) => (
                <h3 key={idx}>{participant.userName}</h3>
              ))
            : "Chat Participants"
          }
        </h3>
      </div>

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
        `}</style>

        {messages.map((message, index) => {
          const isCurrentUser = message.sender?._id === loginUserId;
          const isDeleted = message.isDeleted === true;

          return (
            <div key={message._id || index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-6 message-wrapper`}>
              {!isCurrentUser && (
                <Avatar
                  src={getImageUrl(message.sender?.profile)}
                  size={32}
                  className="mr-2 self-start mt-1"
                />
              )}

              <div className="relative group ">
                <div className={`message-bubble max-w-xs p-3 rounded-2xl ${isDeleted
                    ? 'deleted-message'
                    : isCurrentUser
                      ? 'bg-[#f2f2f2] text-black'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-white text-gray-800'
                  } shadow-sm`}>
                  <p className={`${isDeleted ? "text-red-500" : ""}`}>{message.text}</p>

                  {message.image && !isDeleted && (
                    <img
                      src={getImageUrl(message.image)}
                      alt="Message attachment"
                      className="rounded-lg w-44 my-2 h-44 object-cover"
                    />
                  )}

                  <p className={`text-xs mt-1 ${isDarkMode ? 'opacity-50' : 'opacity-70'}`}>
                    {formatDate(message.createdAt)}
                  </p>

                  {/* Display reactions if any and message is not deleted */}
                  {!isDeleted && message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 absolute -mb-3 -ml-3">
                      <div className={`flex items-center px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} shadow-sm`}>
                        {message.reactions.map((reaction, i) => (
                          <Tooltip key={i} title={`${reaction?.userId?.userName}`}>
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
                    </div>
                  )}
                </div>

                {/* Action buttons that appear on hover - only show if message is NOT deleted */}
                {!isDeleted && (
                  <div className={`message-options absolute ${isCurrentUser ? 'left-0 top-1/2 -translate-x-full -translate-y-1/2' : 'right-0 top-1/2 translate-x-full -translate-y-1/2'} flex`}>
                    {/* Reaction button */}
                    <Button
                      type="text"
                      size="small"
                      icon={<BsEmojiSmile />}
                      className={`flex items-center justify-center p-1 rounded-full ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-white hover:bg-gray-100'} shadow-sm`}
                      onClick={() => toggleReactionPicker(message._id)}
                    />

                    {/* 3-dot menu button - for current user's messages */}
                    {isCurrentUser && (
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: '1',
                              label: 'Unsend Message',
                              icon: <TbTrash size={14} />,
                              onClick: () => handleUnsendMessage(message._id),
                              danger: true
                            }
                          ]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<FiMoreVertical />}
                          className={`ml-1 flex items-center justify-center p-1 rounded-full ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-white hover:bg-gray-100'} shadow-sm`}
                        />
                      </Dropdown>
                    )}
                  </div>
                )}

                {/* Reaction picker - only show if message is NOT deleted */}
                {!isDeleted && showReactionPicker.show && showReactionPicker.messageId === message._id && (
                  <div
                    ref={reactionPickerRef}
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
                  </div>
                )}
              </div>

              {isCurrentUser && (
                <Avatar
                  src={getImageUrl(message.sender?.profile)}
                  size={32}
                  className="ml-2 self-start mt-1"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className={`p-1 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Image preview area */}
        {imagePreview && (
          <div className="mx-4 mt-2 relative">
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
          </div>
        )}

        <Form
          form={form}
          onFinish={handleCreateNewMessage}
          name="messageForm"
          className="flex w-full items-center px-2 py-1 gap-2 relative"
          style={{ marginTop: "10px", marginBottom: "-15px" }}
        >
          <div className="flex items-center">
            <Form.Item name="file" valuePropName="file" className="mb-0 mr-1">
              <Upload
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
                showUploadList={false}
                onChange={handleFileChange}
              >
                <Button
                  type="text"
                  icon={<IoIosAttach color={isDarkMode ? "#9BA3AF" : "#9F9F9F"} size={24} />}
                  className="flex items-center justify-center"
                />
              </Upload>
            </Form.Item>

            <Form.Item className="mb-0 mr-1">
              <Button
                ref={emojiButtonRef}
                type="text"
                icon={<BsEmojiSmile color={isDarkMode ? "#9BA3AF" : "#9F9F9F"} size={20} />}
                onClick={toggleEmojiPicker}
              />
            </Form.Item>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-16 left-16 z-10" ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={350}
                theme={isDarkMode ? 'dark' : 'light'}
              />
            </div>
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
              placeholder="Type something ..."
              className={isDarkMode ? 'dark-input' : ''}
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0 ml-1">
            <Button
              htmlType="submit"
              type="primary"
              icon={<IoMdSend style={{ fontSize: '27px', paddingLeft: '3px' , paddingtop: '3px' }} />}
              shape="circle"
              size="large"
              style={{
                backgroundColor: '#0047FF',
                border: 'none',
              }}
              loading={isLoading}
            />
          </Form.Item>
        </Form>
      </div>

      {/* Add dark mode styles for Ant Design components */}
      {isDarkMode && (
        <style jsx global>{`
          .ant-input {
            background-color: #374151 !important;
            color: white !important;
            border-color: #4B5563 !important;
          }

          .ant-input::placeholder {
            color: #9CA3AF !important;
          }

          .ant-input-search-button {
            background-color: #0047FF !important;
          }

          .ant-btn-text:hover {
            background-color: rgba(255, 255, 255, 0.08) !important;
          }

          .ant-input-clear-icon {
            color: #9CA3AF !important;
          }

          .ant-input-affix-wrapper {
            background-color: #374151 !important;
            border-color: #4B5563 !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default ChatWindow;