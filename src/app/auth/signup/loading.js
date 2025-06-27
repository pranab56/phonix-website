import { Spin } from 'antd';
import React from 'react';
import Loading from '../../../components/Loading/Loading';

const loading = () => {
    return (
        <div className='h-screen flex items-center justify-center'>
            <Loading />
        </div>
    );
};

export default loading;