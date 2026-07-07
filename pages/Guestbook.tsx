import React from 'react';
import { FiEdit3, FiRadio } from 'react-icons/fi';
import WalineComponent from '../components/WalineComponent';
import { PageShell } from '../components/ui';

const Guestbook: React.FC = () => {
  return (
    <div className="guest-archive-page">
      <PageShell className="guestbook-shell relative z-10">
        <section className="guestbook-surface" aria-label="留言">
          <div className="guestbook-panel">
            <div className="guestbook-panel-head">
              <div className="guestbook-panel-title">
                <span className="guestbook-status-dot" />
                <div>
                  <p>留言板</p>
                  <span>写下想法、补充信息或节目记忆</span>
                </div>
              </div>
              <div className="guestbook-meta">
                <span><FiRadio aria-hidden="true" /> Waline</span>
                <span><FiEdit3 aria-hidden="true" /> 实时评论</span>
              </div>
            </div>

            <div className="guestbook-waline-frame">
              <WalineComponent
                serverURL="https://xygss-waline.saneko.me"
                path="/guestbook"
                reaction={false}
                pageSize={10}
                dark
                emoji={[
                  'https://unpkg.com/@waline/emojis@1.2.0/bilibili',
                  'https://unpkg.com/@waline/emojis@1.2.0/weibo',
                ]}
              />
            </div>
          </div>
        </section>
      </PageShell>
    </div>
  );
};

export default Guestbook;
