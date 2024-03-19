import { Footer } from '@/components';
import { getCaptcha, login } from '@/services/http/login';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import { createStyles } from 'antd-style';
import { message } from 'antd';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Login: React.FC = () => {
  const { styles } = useStyles();
  const [messageApi, contextHolder] = message.useMessage();
  const [captcha, setCaptcha] = useState<string | undefined>();
  const flashCaptcha = () => {
    getCaptcha().then((res) => {
      setCaptcha(() => res.img);
    });
  };
  useEffect(() => {
    flashCaptcha();
  }, []);
  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      const res = await login({
        ...values,
      });
      if (res.code === 200 && res.message === 'OK') {
        const urlParams = new URL(window.location.href).searchParams;
        localStorage.setItem('token', res.data.token || '');
        history.push(urlParams.get('redirect') || '/');
        return;
      } else if (res.message !== 'OK') {
        if (res.message === '验证码错误') flashCaptcha();
        messageApi.open({
          type: 'error',
          content: res.message,
        });
      }
    } catch (error) {}
  };
  return (
    <div className={styles.container}>
      {contextHolder}
      <div
        style={{
          height: '100vh',
          padding: '32px 0',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder="用户名"
              rules={[
                {
                  required: true,
                  message: '用户名是必填项！',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder="密码"
              rules={[
                {
                  required: true,
                  message: '密码是必填项！',
                },
              ]}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <ProFormText
                name="captcha"
                placeholder="验证码"
                fieldProps={{
                  size: 'large',
                }}
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                  { len: 4, message: '验证码为四个字符！' },
                ]}
              />
              {
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => flashCaptcha()}
                  dangerouslySetInnerHTML={{ __html: captcha || '' }}
                />
              }
            </div>
          </>

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
