import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";

import {VideoCameraOutlined} from '@ant-design/icons';

import {Layout, Menu, theme} from 'antd';
import {Button, Result, message, Input, Form} from 'antd';

import "./App.css";

const {Sider, Content} = Layout;

type FieldType = {
  input_video?: string;
};

function FixResult(props: { hidden: any; status: any; }) {
  if (props.hidden) {
    return <p/>
  }
  if (props.status) {
    return <Result status="success" title="修复成功"/>
  }
  return <Result status="error" title="修复失败"/>
}

function FixVideoForm() {
  const [resultHidden, setResultHidden] = useState(true);
  const [fixStatus, setFixStatus] = useState(false);
  const [videoFilePath, setVideoFilePath] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const onFileChange = (e) => {
    console.log(e);
    setVideoFilePath(e.target.value);
  };
  const onFixClick = async () => {
    if (videoFilePath == undefined || videoFilePath.length == 0) {
      messageApi.open({
        type: 'warning',
        content: '请先选择问题视频文件',
      });
      return;
    }
    await invoke("fix_video", {input: videoFilePath, output: "x.mp4"});
    setFixStatus(true);
    setResultHidden(false);
  };

  return (
    <>
      {contextHolder}
      <main className="container">
        <Form
          name="basic"
          labelCol={{span: 8}}
          wrapperCol={{span: 16}}
          style={{maxWidth: 600}}
          initialValues={{remember: true}}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="问题视频文件"
            name="input_video"
            rules={[{required: true, message: '请选择问题视频文件'}]}
          >
            <Input type="file" onChange={onFileChange}/>
          </Form.Item>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" onClick={onFixClick}>修复</Button>
          </Form.Item>
        </Form>
        <FixResult hidden={resultHidden} status={fixStatus}/>
      </main>
    </>
  );
}

function App() {
  const [collapsed, _] = useState(false);
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();
  return (

    <Layout>
      <Sider style={{background: colorBgContainer}} width={160}
             trigger={null} collapsible collapsed={collapsed}>
        <Menu
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <VideoCameraOutlined/>,
              label: '视频修复',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Content style={{
          margin: '16px 16px',
          padding: 24,
          minHeight: 520,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
        >
          <FixVideoForm/>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
