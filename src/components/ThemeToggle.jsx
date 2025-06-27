"use client";
import { useContext } from 'react';
import { Switch, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { ThemeContext } from '../app/ClientLayout';


const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);

    return (
        <Tooltip title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                checkedChildren={<BulbOutlined />}
                unCheckedChildren={<BulbFilled />}
                style={{
                    backgroundColor: isDarkMode ? '#4E4EFB' : '#0001FB',
                }}
            />
        </Tooltip>
    );
};

export default ThemeToggle;
