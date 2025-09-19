import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { platform } from '@tauri-apps/plugin-os';

import {VideoCameraOutlined} from '@ant-design/icons';

import {Layout, Menu, theme} from 'antd';
import {Button, Result, message, Input, Progress} from 'antd';

import "./App.css";

const {Sider, Content} = Layout;
const { TextArea } = Input;

const os = platform();

function FixProgress(props: {hidden: any, percent: any}) {
  if (props.hidden) {
    return <p/>
  }
  return <Progress percent={props.percent} type="circle" />
}

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
  const [progressHidden, setProgressHidden] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [resultHidden, setResultHidden] = useState(true);
  const [fixStatus, setFixStatus] = useState(false);
  const [videos, setVideos] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const onFixClick = async () => {
    if (videos == undefined || videos.length == 0) {
      messageApi.open({
        type: 'warning',
        content: '请先选择问题视频文件',
      });
      return;
    }
    setProgressHidden(false);
    let videoList = videos.split('\n');
    let progressStep = 100 / videoList.length;
    for (const ele of videoList) {
      let last_slash_idx = ele.lastIndexOf(os === "windows" ? '\\' : '/');
      let video_file_name = ele.substring(last_slash_idx+1, ele.length);
      let fixed_video_file_name = "修复后_" + video_file_name;
      let output = ele.substring(0, last_slash_idx+1) + fixed_video_file_name;
      let status = await invoke("fix_video", {input: ele, output: output});
      if (status !== "success") {
        messageApi.open({
          type: 'warning',
          content: "修复失败：" + ele,
        });
      }
      setProgressPercent((prePercent) => {
        let newPercent = prePercent + progressStep;
        if (newPercent > 100) {
          newPercent = 100;
        }
        return newPercent;
      });
    }
    setProgressHidden(true);
    setFixStatus(true);
    setResultHidden(false);
  };
  const onSelectVideoList = async () => {
    setVideos("");
    const files = await open({
      multiple: true,
      directory: false,
    });
    setFixStatus(false);
    setResultHidden(true);
    setProgressHidden(true);
    if (files == null) {
      messageApi.open({
        type: 'warning',
        content: '请选择问题视频文件',
      });
      return;
    }
    setVideos(files.join('\n'));
  };

  return (
    <>
      {contextHolder}
      <main className="container">
        <TextArea
          value={videos}
          placeholder="点击选择问题视频"
          autoSize={{ minRows: 1, maxRows: 20 }}
          onClick={onSelectVideoList}
        />
          <Button type="primary" size={"large"}
                  style={{marginTop: '20px'}}
                  onClick={onFixClick}>修复</Button>
        <FixProgress hidden={progressHidden} percent={progressPercent}/>
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
