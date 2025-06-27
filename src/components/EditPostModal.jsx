"use client";
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import BlogPostForm from '@/app/new/page';

const EditPostModal = ({ visible, onClose, postData }) => {





  const handleUpdateSuccess = () => {
    onClose();
  };

  return (
    <Modal
      title="Edit Post"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
    >
      {postData && (
        <BlogPostForm 
          initialValues={postData}
          isEditing={true}
          onSuccess={handleUpdateSuccess}
          postId={postData?.id || postData?._id}
        />
      )}
    </Modal>
  );
};

export default EditPostModal;