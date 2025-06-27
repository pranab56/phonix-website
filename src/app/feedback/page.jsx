"use client"
import CustomBanner from '@/components/CustomBanner';
import { useCreatefeedbackMutation } from '@/features/feedback/feedbackApi';
import { Button, Card, Form, Input, message } from 'antd';
import { useContext } from 'react';
import { ThemeContext } from '../ClientLayout';


const { TextArea } = Input;

export default function FeedBack() {
  const [form] = Form?.useForm();
  const [createfeedback, { isLoading }] = useCreatefeedbackMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const { isDarkMode } = useContext(ThemeContext);

  const onFinish = async (values) => {
    try {
      const response = await createfeedback(values).unwrap();
      messageApi.success('Thank you! Your feedback has been submitted successfully.');
      console.log(response);
      form.resetFields();
    } catch (error) {
      messageApi.error('Oops! Something went wrong. Please try again later.');
      console.log(error);
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {contextHolder}
      <CustomBanner routeName={"Feedback"} />
      <div className={`flex justify-center items-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Card className={`w-full max-w-3xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="mb-6">
            <h1 className={`text-xl font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              We Value Your Feedback!
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your opinion helps us make Mehor Forum better. Share your thoughts and suggestions to help us improve the
              platform and serve you better. We'd love to hear about your experience on the forum. Whether you have
              suggestions, ideas, or anything you think we could improve, please let us know!
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label={<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>What did you like about Mehor Forum?</span>}
              name="likedAspects"
              rules={[
                {
                  required: true,
                  message: 'Please share what you liked about the forum'
                },
                {
                  max: 500,
                  message: 'Feedback cannot exceed 500 characters'
                }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Share your feedback here!"
                className={`rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              label={<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>What can we improve?</span>}
              name="areasForImprovement"
              rules={[
                {
                  required: true,
                  message: 'Please share your suggestions for improvement'
                },
                {
                  max: 500,
                  message: 'Feedback cannot exceed 500 characters'
                }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Your feedback is crucial in helping us enhance the platform. Let us know if there's anything we can do to make your experience better!"
                className={`rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              label={<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Any new features you'd like to see?</span>}
              name="featureSuggestions"
              rules={[
                {
                  required: true,
                  message: 'Please Share Your Features Suggestions'
                },
                {
                  max: 300,
                  message: 'Suggestion cannot exceed 300 characters'
                }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Is there a feature you'd like us to add to make the forum more useful for you?"
                className={`rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
                showCount
                maxLength={300}
              />
            </Form.Item>

            <Form.Item
              label={<span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Additional Comments</span>}
              name="additionalFeedback"
              rules={[
                {
                  required: true,
                  message: 'Please share your additional comments'
                },
                {
                  max: 300,
                  message: 'Comments cannot exceed 300 characters'
                }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Is there anything else you'd like to share with us?"
                className={`rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
                showCount
                maxLength={300}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className={`w-full h-10 rounded-md bg-primary hover:bg-primary`}
              >
                {isLoading ? 'Submitting...' : 'Submit Your Feedback'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
